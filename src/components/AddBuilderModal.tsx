import React, { useState } from 'react';
import { Builder, DomainType, AvailabilityStatus } from '../types';
import { UserPlus, X, Phone, Mail, Linkedin, GraduationCap, Github } from 'lucide-react';

interface AddBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBuilder: (builderData: Partial<Builder>) => void;
}

const GRADIENTS = [
  'linear-gradient(135deg, #6366f1, #4f46e5)',
  'linear-gradient(135deg, #0ea5e9, #0284c7)',
  'linear-gradient(135deg, #10b981, #059669)',
  'linear-gradient(135deg, #8b5cf6, #7c3aed)',
  'linear-gradient(135deg, #f43f5e, #e11d48)',
  'linear-gradient(135deg, #f59e0b, #d97706)',
];

export const AddBuilderModal: React.FC<AddBuilderModalProps> = ({
  isOpen,
  onClose,
  onAddBuilder,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Full-Stack Dev');
  const [deptYear, setDeptYear] = useState('SRM IST • CSE 3rd Year');
  const [skillsStr, setSkillsStr] = useState('React, TypeScript, FastAPI');
  const [domains, setDomains] = useState<DomainType[]>(['Frontend', 'Backend']);
  const [availability, setAvailability] = useState<AvailabilityStatus>('Ready for 24h Hackathon');
  const [avatarColor, setAvatarColor] = useState(GRADIENTS[0]);
  const [bio, setBio] = useState('');
  const [github, setGithub] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [cgpa, setCgpa] = useState('9.10 / 10.0');

  if (!isOpen) return null;

  const toggleDomain = (d: DomainType) => {
    if (domains.includes(d)) {
      if (domains.length > 1) {
        setDomains(domains.filter((item) => item !== d));
      }
    } else {
      setDomains([...domains, d]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const skills = skillsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const builderEmail = email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@srmist.edu.in`;
    const builderPhone = phone.trim() || '+91 98401 ' + Math.floor(10000 + Math.random() * 90000);

    onAddBuilder({
      name: name.trim(),
      role,
      deptYear: deptYear.trim() || 'SRM IST • Campus Builder',
      skills: skills.length ? skills : ['React', 'Node.js', 'Python'],
      domains,
      availability,
      avatarColor,
      bio: bio.trim() || 'Passionate campus builder ready for Prompt Wars 2026.',
      github: github.trim() || name.toLowerCase().replace(/\s+/g, ''),
      email: builderEmail,
      phone: builderPhone,
      whatsapp: builderPhone,
      linkedin: linkedin.trim() || `linkedin.com/in/${name.toLowerCase().replace(/\s+/g, '-')}`,
      cgpa: cgpa.trim() || '9.00 / 10.0',
      matchScore: Math.floor(Math.random() * 6) + 93,
      verified: true,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="add-builder-modal"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-slate-900 dark:text-white font-bold text-sm">
                Register Student Builder
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Campus Talent Directory • Firestore Persistence
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Full Name *
            </label>
            <input
              id="input-builder-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Siddharth Menon"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Contact Details (Mobile & Email) */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-3">
            <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              <span>Student Contact Details (Pro Dossier)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                  Mobile / WhatsApp Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98401 23456"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                  Official Campus Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@srmist.edu.in"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                  LinkedIn Profile / URL
                </label>
                <input
                  type="text"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="linkedin.com/in/username"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                  Academic CGPA
                </label>
                <input
                  type="text"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  placeholder="e.g. 9.35 / 10.0"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Primary Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="AI/ML Engineer">AI/ML Engineer</option>
                <option value="Full-Stack Dev">Full-Stack Dev</option>
                <option value="Frontend Dev">Frontend Dev</option>
                <option value="Backend Engineer">Backend Engineer</option>
                <option value="UI/UX Specialist">UI/UX Specialist</option>
                <option value="DevOps & Cloud Engineer">DevOps & Cloud Engineer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                College / Dept & Year
              </label>
              <input
                type="text"
                value={deptYear}
                onChange={(e) => setDeptYear(e.target.value)}
                placeholder="e.g. SRM IST • CSE 3rd Year"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Technical Skills (Comma separated)
            </label>
            <input
              type="text"
              value={skillsStr}
              onChange={(e) => setSkillsStr(e.target.value)}
              placeholder="e.g. PyTorch, CUDA, FastAPI, Docker"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Domain Disciplines (Select 1 to 3)
            </label>
            <div className="flex flex-wrap gap-2">
              {(['Frontend', 'Backend', 'AI/ML', 'UI/UX'] as DomainType[]).map((d) => {
                const active = domains.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDomain(d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                      active
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Availability Window
            </label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value as AvailabilityStatus)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="Ready for 24h Hackathon">Ready for 24h Hackathon</option>
              <option value="Available Weekends">Available Weekends</option>
              <option value="Sprint Mode (48h)">Sprint Mode (48h)</option>
              <option value="Semester Capstone">Semester Capstone</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                GitHub Handle
              </label>
              <input
                type="text"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="e.g. alex-builds"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Avatar Theme
              </label>
              <div className="flex items-center gap-2 pt-1">
                {GRADIENTS.map((grad, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatarColor(grad)}
                    className={`w-6 h-6 rounded-lg cursor-pointer border transition ${
                      avatarColor === grad ? 'border-indigo-600 dark:border-white scale-110' : 'border-transparent opacity-60'
                    }`}
                    style={{ background: grad }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Short Bio / Hackathon Directive
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="What are your strongest skills and hackathon ambitions?"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              Save to Database
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


