import React from 'react';
import { Atom, Compass, Globe, BookOpen, Feather, FileText, Sparkles, Layers } from 'lucide-react';

interface NCERTBookCoverProps {
  title: string;
  subjectId?: string;
  classLevel?: string;
  size?: 'sm' | 'md' | 'lg' | 'detail';
  className?: string;
  isUploaded?: boolean;
}

export const NCERTBookCover: React.FC<NCERTBookCoverProps> = ({
  title,
  subjectId = 'science',
  classLevel = '9',
  size = 'md',
  className = '',
  isUploaded = false,
}) => {
  const normSubject = (subjectId || '').toLowerCase();

  // Determine cover palette and illustration
  let gradientClass = 'from-[#1e1b4b] via-[#2e1065] to-[#4c1d95]'; // deep violet-indigo default
  let accentColor = '#a855f7';
  let subjectLabel = 'SCIENCE';
  let illustrationType = 'science';

  if (normSubject.includes('math') || normSubject.includes('calcul')) {
    gradientClass = 'from-[#0c2340] via-[#0f3d63] to-[#164e63]';
    accentColor = '#38bdf8';
    subjectLabel = 'MATHEMATICS';
    illustrationType = 'math';
  } else if (
    normSubject.includes('social') ||
    normSubject.includes('history') ||
    normSubject.includes('geo') ||
    normSubject.includes('civic') ||
    normSubject.includes('econ')
  ) {
    gradientClass = 'from-[#431407] via-[#7c2d12] to-[#9a3412]';
    accentColor = '#fb923c';
    subjectLabel = 'SOCIAL SCIENCE';
    illustrationType = 'social';
  } else if (normSubject.includes('english')) {
    gradientClass = 'from-[#4a044e] via-[#701a75] to-[#86198f]';
    accentColor = '#f472b6';
    subjectLabel = 'ENGLISH';
    illustrationType = 'english';
  } else if (normSubject.includes('hindi') || normSubject.includes('sanskrit')) {
    gradientClass = 'from-[#4c0519] via-[#881337] to-[#9f1239]';
    accentColor = '#fb7185';
    subjectLabel = normSubject.includes('sanskrit') ? 'SANSKRIT' : 'HINDI';
    illustrationType = 'hindi';
  } else if (normSubject.includes('physic')) {
    gradientClass = 'from-[#030712] via-[#1e1b4b] to-[#1e3a8a]';
    accentColor = '#60a5fa';
    subjectLabel = 'PHYSICS';
    illustrationType = 'science';
  } else if (normSubject.includes('chem')) {
    gradientClass = 'from-[#042f2e] via-[#115e59] to-[#0f766e]';
    accentColor = '#2dd4bf';
    subjectLabel = 'CHEMISTRY';
    illustrationType = 'science';
  } else if (normSubject.includes('bio')) {
    gradientClass = 'from-[#052e16] via-[#14532d] to-[#166534]';
    accentColor = '#4ade80';
    subjectLabel = 'BIOLOGY';
    illustrationType = 'science';
  } else if (isUploaded) {
    gradientClass = 'from-[#1e1b4b] via-[#3730a3] to-[#4338ca]';
    accentColor = '#818cf8';
    subjectLabel = title.slice(0, 16).toUpperCase();
    illustrationType = 'upload';
  }

  // Dimension classes based on size
  const sizeClasses = {
    sm: 'w-20 h-28 text-[9px]',
    md: 'w-full aspect-[3.2/4.4] text-xs',
    lg: 'w-44 h-60 text-xs',
    detail: 'w-28 sm:w-36 aspect-[3.2/4.4] text-xs shrink-0',
  }[size];

  return (
    <div
      className={`relative rounded-xl overflow-hidden shadow-lg select-none flex flex-col justify-between p-3.5 transition-transform duration-200 group-hover:scale-[1.02] ${sizeClasses} ${className}`}
      style={{
        background: `linear-gradient(145deg, var(--tw-gradient-stops))`,
      }}
    >
      {/* Background Gradient Layer */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass}`} />

      {/* Book Spine Overlay (Glossy left fold shadow) */}
      <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/40 via-black/10 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 left-2 w-[1px] bg-white/20 pointer-events-none z-10" />

      {/* Book Page Edge Highlight (Top/Right subtle sheen) */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/30 pointer-events-none" />

      {/* Subtle Pattern Grid or Stars */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, white 1px, transparent 1px)`,
          backgroundSize: '16px 16px',
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Subject Header */}
        <div className="tracking-widest font-black text-white uppercase text-[10px] sm:text-[11px] leading-tight drop-shadow-sm font-sans">
          {subjectLabel}
        </div>
        <div className="text-[9px] text-white/80 font-medium tracking-wide">
          Class {classLevel}
        </div>
      </div>

      {/* Center Illustration */}
      <div className="relative z-10 my-auto flex items-center justify-center py-2">
        {illustrationType === 'science' && (
          <div className="relative flex items-center justify-center">
            {/* Glowing Backdrop */}
            <div className="absolute w-16 h-16 rounded-full bg-cyan-400/20 blur-md animate-pulse" />
            {/* Atom SVG Graphic */}
            <svg
              className="w-16 h-16 sm:w-20 sm:h-20 text-cyan-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]"
              viewBox="0 0 100 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <ellipse cx="50" cy="50" rx="36" ry="14" transform="rotate(0 50 50)" opacity="0.85" />
              <ellipse cx="50" cy="50" rx="36" ry="14" transform="rotate(60 50 50)" opacity="0.85" />
              <ellipse cx="50" cy="50" rx="36" ry="14" transform="rotate(120 50 50)" opacity="0.85" />
              <circle cx="50" cy="50" r="6" fill="#38bdf8" />
              {/* Electron dots */}
              <circle cx="86" cy="50" r="2.5" fill="#f43f5e" />
              <circle cx="32" cy="20" r="2.5" fill="#a855f7" />
              <circle cx="68" cy="80" r="2.5" fill="#fbbf24" />
            </svg>
          </div>
        )}

        {illustrationType === 'math' && (
          <div className="relative flex items-center justify-center">
            <div className="absolute w-16 h-16 rounded-full bg-sky-400/20 blur-md" />
            <svg
              className="w-16 h-16 sm:w-20 sm:h-20 text-sky-200 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]"
              viewBox="0 0 100 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {/* Coordinate axis */}
              <line x1="20" y1="80" x2="80" y2="80" stroke="#38bdf8" strokeWidth="2.5" />
              <line x1="20" y1="80" x2="20" y2="20" stroke="#38bdf8" strokeWidth="2.5" />
              {/* Sine/curve */}
              <path d="M 20 60 Q 40 20 60 60 T 85 40" stroke="#f43f5e" strokeWidth="2.5" fill="none" />
              {/* Compass / Triangle */}
              <polygon points="50,25 75,75 35,75" stroke="#facc15" strokeWidth="2" fill="rgba(250,204,21,0.15)" />
              <circle cx="50" cy="25" r="3" fill="#facc15" />
            </svg>
          </div>
        )}

        {illustrationType === 'social' && (
          <div className="relative flex items-center justify-center">
            <div className="absolute w-16 h-16 rounded-full bg-amber-500/25 blur-md" />
            <svg
              className="w-16 h-16 sm:w-20 sm:h-20 text-amber-200 drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]"
              viewBox="0 0 100 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {/* Globe stand */}
              <circle cx="50" cy="46" r="28" stroke="#fdba74" strokeWidth="2.5" fill="rgba(154,52,18,0.4)" />
              <ellipse cx="50" cy="46" rx="28" ry="12" stroke="#fdba74" strokeDasharray="3 2" />
              <line x1="50" y1="18" x2="50" y2="74" stroke="#fdba74" strokeDasharray="3 2" />
              {/* Base */}
              <path d="M 24 46 A 28 28 0 0 0 76 46" stroke="#fbbf24" strokeWidth="3" />
              <line x1="50" y1="74" x2="50" y2="88" stroke="#fbbf24" strokeWidth="3" />
              <line x1="36" y1="88" x2="64" y2="88" stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round" />
            </svg>
          </div>
        )}

        {illustrationType === 'english' && (
          <div className="relative flex items-center justify-center">
            <div className="absolute w-16 h-16 rounded-full bg-pink-500/25 blur-md" />
            <svg
              className="w-16 h-16 sm:w-20 sm:h-20 text-pink-200 drop-shadow-[0_0_8px_rgba(244,114,182,0.6)]"
              viewBox="0 0 100 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {/* Open Book */}
              <path
                d="M 50 70 Q 30 65 18 72 L 18 36 Q 30 30 50 35 Q 70 30 82 36 L 82 72 Q 70 65 50 70 Z"
                fill="rgba(244,114,182,0.2)"
                stroke="#f472b6"
                strokeWidth="2.5"
              />
              <line x1="50" y1="35" x2="50" y2="70" stroke="#fbcfe8" strokeWidth="2" />
              {/* Quill */}
              <path
                d="M 72 20 Q 60 30 55 45 L 53 48 L 57 47 Q 66 35 72 20 Z"
                fill="#facc15"
                stroke="#facc15"
              />
            </svg>
          </div>
        )}

        {illustrationType === 'hindi' && (
          <div className="relative flex items-center justify-center">
            <div className="absolute w-16 h-16 rounded-full bg-rose-500/25 blur-md" />
            <svg
              className="w-16 h-16 sm:w-20 sm:h-20 text-rose-200 drop-shadow-[0_0_8px_rgba(251,113,133,0.6)]"
              viewBox="0 0 100 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="50" cy="50" r="28" stroke="#fb7185" strokeWidth="2" strokeDasharray="4 2" />
              {/* Hindi 'A' stylized symbol / flower */}
              <path
                d="M 36 34 L 64 34 M 50 34 L 50 66 M 38 48 Q 50 48 50 66 M 38 66 L 62 66"
                stroke="#ffe4e6"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}

        {illustrationType === 'upload' && (
          <div className="relative flex items-center justify-center">
            <div className="absolute w-16 h-16 rounded-full bg-indigo-500/25 blur-md" />
            <FileText className="w-12 h-12 text-indigo-200 drop-shadow-md" />
          </div>
        )}
      </div>

      {/* Bottom Bar: NCERT Logo & Watermark */}
      <div className="relative z-10 flex items-center justify-between pt-1 border-t border-white/15 text-[8px] text-white/70 font-semibold uppercase tracking-wider">
        <span>NCERT</span>
        <span className="flex items-center gap-0.5">
          <Sparkles className="w-2.5 h-2.5 text-amber-300" />
          <span>AI ED.</span>
        </span>
      </div>
    </div>
  );
};
