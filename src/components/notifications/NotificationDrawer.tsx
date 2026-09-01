import React from 'react';
import { X, Bell, Check, Calendar, AlertTriangle, Flame, RotateCcw, ArrowRight, Shield, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppNotification } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, setActiveTab, isDeepWork } = useApp();

  const handleAction = (n: AppNotification) => {
    markNotificationRead(n.id);
    if (n.actionTab) {
      setActiveTab(n.actionTab);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="notification-drawer-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end"
      onClick={onClose}
    >
      <div
        id="notification-drawer-card"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-sm ${isDeepWork ? 'bg-slate-900 text-slate-100 p-6' : 'bg-white text-slate-900'} h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200`}
      >
        {isDeepWork ? (
          <>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">Deep Work Mode Active</h3>
              </div>
              <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Shield className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-base">Notifications Restricted 🔕</h4>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                All academic alerts and study notifications are temporarily blocked during your active deep work session.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800 text-center">
              <button
                onClick={onClose}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Resume Deep Work
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">Academic Notifications</h3>
              </div>
              <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="p-3 flex-1 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Bell className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
                  <p className="text-xs font-semibold">No new alerts</p>
                  <p className="text-[11px]">You are up to date on revisions and study goals.</p>
                </div>
              ) : (
                notifications.map((n) => {
                  let Icon = Bell;
                  let iconColor = 'text-indigo-600 bg-indigo-50';
                  if (n.type === 'revision_due') {
                    Icon = RotateCcw;
                    iconColor = 'text-amber-600 bg-amber-50';
                  } else if (n.type === 'exam_alert') {
                    Icon = Calendar;
                    iconColor = 'text-rose-600 bg-rose-50';
                  } else if (n.type === 'mistake_reminder') {
                    Icon = AlertTriangle;
                    iconColor = 'text-orange-600 bg-orange-50';
                  } else if (n.type === 'streak_alert') {
                    Icon = Flame;
                    iconColor = 'text-amber-500 bg-amber-50';
                  }

                  return (
                    <div
                      key={n.id}
                      onClick={() => handleAction(n)}
                      className={`p-3 rounded-2xl cursor-pointer transition-colors space-y-1.5 ${
                        n.read ? 'opacity-70 hover:bg-slate-50' : 'bg-indigo-50/40 hover:bg-indigo-50'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconColor}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                            {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                          </div>
                          <p className="text-[11px] text-slate-600 leading-snug mt-0.5">{n.message}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span>{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-indigo-600 font-semibold flex items-center gap-0.5">
                          Open <ArrowRight className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
              <p className="text-[11px] text-slate-500 font-medium">Smart adaptive alerts based on your study schedule</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
