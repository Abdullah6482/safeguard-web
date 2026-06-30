import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { NotificationStore } from '../../utils/notificationStore';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const unread = NotificationStore.getUnreadCount();
  const items = NotificationStore.getAll();

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 text-slate-500 hover:text-slate-800">
        <Bell className="h-5 w-5" />
        {unread > 0 ? (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        ) : null}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-700 uppercase">Notifications</span>
            <button onClick={() => NotificationStore.markAllAsRead()} className="text-xs text-teal-600 hover:underline">
              Mark all read
            </button>
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
            {items.length === 0 ? (
              <p className="p-4 text-xs text-slate-500 text-center">No notifications</p>
            ) : (
              items.map(n => (
                <div key={n.id} className="p-3 hover:bg-slate-50 text-xs">
                  <p className="font-semibold text-slate-800">{n.title}</p>
                  <p className="text-slate-600 mt-0.5">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
