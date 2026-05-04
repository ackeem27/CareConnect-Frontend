import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, Clock, Calendar, Activity, AlertCircle, CheckCircle } from 'lucide-react';
import { notificationService } from '../../services/dataService';
import './NotificationPanel.css';

const NotificationPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef(null);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.fetchNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (err) { /* silently fail */ }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id) => {
    try { await notificationService.markAsRead(id); loadNotifications(); } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    try { await notificationService.markAllRead(); loadNotifications(); } catch (e) {}
  };

  const handleClear = async () => {
    try { await notificationService.clear(); loadNotifications(); } catch (e) {}
  };

  const getIcon = (type) => {
    switch (type) {
      case 'appointment_booked': return <Calendar size={16} color="#3b82f6" />;
      case 'appointment_approved': return <CheckCircle size={16} color="#10b981" />;
      case 'appointment_rejected': return <AlertCircle size={16} color="#ef4444" />;
      case 'priority_change': return <Activity size={16} color="#f59e0b" />;
      case 'schedule_update': return <Clock size={16} color="#8b5cf6" />;
      default: return <Bell size={16} color="#64748b" />;
    }
  };

  const formatTime = (d) => {
    const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="np-container" ref={panelRef}>
      <button className="np-bell-btn" onClick={() => setIsOpen(!isOpen)}>
        <Bell size={20} />
        {unreadCount > 0 && <span className="np-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="np-panel">
          <div className="np-header">
            <h3>Notifications</h3>
            <div className="np-header-actions">
              {unreadCount > 0 && <button onClick={handleMarkAllRead} className="np-mark-all"><Check size={14} /> Mark all read</button>}
              <button onClick={handleClear} className="np-clear"><X size={14} /></button>
            </div>
          </div>

          <div className="np-list">
            {notifications.length === 0 ? (
              <div className="np-empty"><Bell size={24} color="#cbd5e1" /><p>No notifications</p></div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`np-item ${!n.read ? 'unread' : ''}`} onClick={() => handleMarkRead(n.id)}>
                  <div className="np-item-icon">{getIcon(n.notification_type)}</div>
                  <div className="np-item-content">
                    <h4>{n.title}</h4>
                    <p>{n.message}</p>
                    <span className="np-item-time">{formatTime(n.created_at)}</span>
                  </div>
                  {!n.read && <span className="np-unread-dot" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
