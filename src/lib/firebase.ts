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

const firebaseConfig = {
  projectId: 'hardy-premise-6thv3',
  appId: '1:223315327391:web:04f0b65c3e81fe34a5e5aa',
  apiKey: 'AIzaSyDsqR-FZBI8Mbj8H71LMGFrJf-qmiRX2XQ',
  authDomain: 'hardy-premise-6thv3.firebaseapp.com',
  storageBucket: 'hardy-premise-6thv3.firebasestorage.app',
  messagingSenderId: '223315327391',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

const DATABASE_ID = 'ai-studio-matchcrewsync-26e7f742-a2d0-47f2-a3a4-9574fd33079d';
export const db = getFirestore(app, DATABASE_ID);

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
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    const newProfile: UserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0] || 'Campus Builder',
      photoURL: user.photoURL,
      isPro: false,
      proPlan: null,
      college: extraData?.college || 'SRM Institute of Science and Technology',
      phone: extraData?.phone || '',
    };
    await setDoc(userRef, {
      ...newProfile,
      createdAt: new Date().toISOString(),
    });
    return newProfile;
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
