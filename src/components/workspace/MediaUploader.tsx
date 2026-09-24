import React, { useState, useRef } from 'react';
import { Video, Mic, Upload, Play, CheckCircle2, X, RefreshCw, Film } from 'lucide-react';

interface MediaUploaderProps {
  mediaUrl?: string;
  mediaType?: 'video' | 'audio' | 'image';
  mediaFileName?: string;
  onMediaSave: (url: string, type: 'video' | 'audio' | 'image', fileName: string) => void;
  onMediaRemove: () => void;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  mediaUrl,
  mediaType,
  mediaFileName,
  onMediaSave,
  onMediaRemove,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<any>(null);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startSimulatedRecording = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopSimulatedRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    const mockAudioUrl = `mock_recording_${Date.now()}.mp3`;
    onMediaSave(mockAudioUrl, 'audio', `Voice_Explanation_${recordingSeconds}s.mp3`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    let type: 'video' | 'audio' | 'image' = 'video';
    if (file.type.startsWith('audio/')) type = 'audio';
    else if (file.type.startsWith('image/')) type = 'image';

    const objectUrl = URL.createObjectURL(file);
    onMediaSave(objectUrl, type, file.name);
  };

  return (
    <div className="p-3.5 bg-amber-50/60 dark:bg-slate-900/50 rounded-xl border border-amber-200/70 dark:border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Film className="w-3.5 h-3.5 text-amber-600" />
          <span>Video / Audio Explanation</span>
        </span>
        {mediaUrl && (
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Attached</span>
          </span>
        )}
      </div>

      {mediaUrl ? (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-slate-700 text-amber-700 dark:text-amber-300">
              {mediaType === 'audio' ? <Mic className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {mediaFileName || 'Explanation_Media.mp4'}
              </div>
              <div className="text-[10px] text-slate-500 capitalize">{mediaType || 'video'} transcript ready</div>
            </div>
          </div>
          <button
            onClick={onMediaRemove}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            title="Remove Media"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {isRecording ? (
            <button
              onClick={stopSimulatedRecording}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs animate-pulse"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              <span>Stop Recording ({recordingSeconds}s)</span>
            </button>
          ) : (
            <button
              onClick={startSimulatedRecording}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-amber-100/50 text-slate-800 dark:text-slate-200 font-bold text-xs border border-amber-200 dark:border-slate-700 shadow-2xs"
            >
              <Mic className="w-3.5 h-3.5 text-rose-500" />
              <span>Record Voice</span>
            </button>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-amber-100/50 text-slate-800 dark:text-slate-200 font-bold text-xs border border-amber-200 dark:border-slate-700 shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-600" />
            <span>Upload Video/Audio</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,audio/*,image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};
