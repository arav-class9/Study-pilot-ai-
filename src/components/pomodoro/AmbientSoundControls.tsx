import React from 'react';
import { useFocus } from '../../context/FocusContext';
import { AmbientSoundType } from '../../types';
import {
  Volume2,
  VolumeX,
  CloudRain,
  Radio,
  Waves,
  BookOpen,
  Brain,
  Flame,
  Music,
} from 'lucide-react';

export const AmbientSoundControls: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const {
    ambientSound,
    ambientVolume,
    isAmbientPlaying,
    setAmbientSound,
    setAmbientVolume,
    toggleAmbientPlaying,
  } = useFocus();

  const sounds: { id: AmbientSoundType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'none', label: 'Off', icon: VolumeX },
    { id: 'rain', label: 'Rain', icon: CloudRain },
    { id: 'brown_noise', label: 'Brown Noise', icon: Waves },
    { id: 'white_noise', label: 'White Noise', icon: Radio },
    { id: 'library', label: 'Library', icon: BookOpen },
    { id: 'binaural_40hz', label: '40Hz Waves', icon: Brain },
    { id: 'campfire', label: 'Campfire', icon: Flame },
  ];

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Music className="w-3 h-3 text-indigo-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            Ambient Focus Sounds
          </span>
        </div>

        {ambientSound !== 'none' && (
          <button
            onClick={toggleAmbientPlaying}
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
              isAmbientPlaying
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {isAmbientPlaying ? 'Playing' : 'Muted'}
          </button>
        )}
      </div>

      {/* Sound Pills Grid */}
      <div className={`grid ${compact ? 'grid-cols-3' : 'grid-cols-4'} gap-1.5`}>
        {sounds.map((s) => {
          const Icon = s.icon;
          const isSelected = ambientSound === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setAmbientSound(s.id)}
              className={`py-1.5 px-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer truncate ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Icon className="w-3 h-3 shrink-0" />
              <span className="truncate">{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Volume Slider & Visualizer */}
      {ambientSound !== 'none' && (
        <div className="flex items-center gap-2 pt-1">
          <Volume2 className="w-3 h-3 text-slate-400 shrink-0" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={ambientVolume}
            onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <span className="text-[10px] font-mono text-slate-400 w-7 text-right">
            {Math.round(ambientVolume * 100)}%
          </span>
        </div>
      )}
    </div>
  );
};
