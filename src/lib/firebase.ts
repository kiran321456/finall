import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { Builder, UserProfile } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with auto-detect long polling for resilient connection inside iframe sandboxes
export const db = (() => {
  try {
    return initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
    }, firebaseConfig.firestoreDatabaseId);
  } catch (e) {
    return getFirestore(app, firebaseConfig.firestoreDatabaseId);
  }
})();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Notice:', JSON.stringify(errInfo));
}

// Auth helper functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await syncUserProfile(result.user);
    return result.user;
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

export const registerWithEmailPassword = async (
  email: string,
  pass: string,
  fullName: string,
  college?: string
) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  if (fullName) {
    await updateProfile(userCredential.user, { displayName: fullName });
  }
  await syncUserProfile(userCredential.user, { college });
  return userCredential.user;
};

export const loginWithEmailPassword = async (email: string, pass: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  await syncUserProfile(userCredential.user);
  return userCredential.user;
};

export const logoutUser = async () => {
  await firebaseSignOut(auth);
};

// Sync and fetch user profile with Pro status
export const syncUserProfile = async (
  user: FirebaseUser,
  extraData?: { college?: string; phone?: string }
): Promise<UserProfile> => {
  const fallbackProfile: UserProfile = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email?.split('@')[0] || 'Campus Builder',
    photoURL: user.photoURL,
    isPro: false,
    proPlan: null,
    college: extraData?.college || 'SRM Institute of Science and Technology',
    phone: extraData?.phone || '',
  };

  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      await setDoc(userRef, {
        ...fallbackProfile,
        createdAt: new Date().toISOString(),
      });
      return fallbackProfile;
    } else {
      const data = snap.data();
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || data.displayName || 'Campus Builder',
        photoURL: user.photoURL || data.photoURL,
        isPro: !!data.isPro,
        proPlan: data.proPlan || null,
        proActivatedAt: data.proActivatedAt,
        phone: data.phone || '',
        college: data.college || 'SRM Institute of Science and Technology',
      };
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
    return fallbackProfile;
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        uid,
        email: data.email || null,
        displayName: data.displayName || null,
        photoURL: data.photoURL || null,
        isPro: !!data.isPro,
        proPlan: data.proPlan || null,
        proActivatedAt: data.proActivatedAt,
        phone: data.phone,
        college: data.college,
      };
    }
    return null;
  } catch (err) {
    console.error('Error getting user profile:', err);
    return null;
  }
};

// Upgrade User to Pro in Firestore
export const upgradeUserToPro = async (
  uid: string,
  plan: 'hacker_pass' | 'squad_pass' | 'campus_lifetime'
): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    isPro: true,
    proPlan: plan,
    proActivatedAt: new Date().toISOString(),
  });
};

// Squad cloud synchronization
export const saveUserSquad = async (userId: string, memberIds: string[]): Promise<void> => {
  try {
    const squadRef = doc(db, 'squads', userId);
    await setDoc(squadRef, {
      userId,
      memberIds,
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error('Error saving user squad to Firestore:', e);
  }
};

export const loadUserSquad = async (userId: string): Promise<string[] | null> => {
  try {
    const squadRef = doc(db, 'squads', userId);
    const snap = await getDoc(squadRef);
    if (snap.exists()) {
      return snap.data().memberIds || [];
    }
    return null;
  } catch (e) {
    console.error('Error loading user squad from Firestore:', e);
    return null;
  }
};

// Builders cloud sync
export const saveCustomBuilderToDb = async (builder: Builder, userId?: string): Promise<void> => {
  try {
    const builderRef = doc(db, 'builders', builder.id);
    await setDoc(builderRef, {
      ...builder,
      createdBy: userId || 'anonymous',
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error saving builder to Firestore:', err);
  }
};

export const loadBuildersFromDb = async (): Promise<Builder[]> => {
  try {
    const colRef = collection(db, 'builders');
    const snap = await getDocs(colRef);
    const result: Builder[] = [];
    snap.forEach((docSnap) => {
      result.push(docSnap.data() as Builder);
    });
    return result;
  } catch (err) {
    console.error('Error loading builders from Firestore:', err);
    return [];
  }
};
