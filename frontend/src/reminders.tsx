import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './reminders.css';
import logo from './assets/sync_symbol.png';
import { useReminders } from './RemindersContext';

export default function Reminders() {
  const { reminders, deleteReminder } = useReminders();
  const [loading] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="reminders-container">
      <div className="reminders-topbar">
        <span className="reminders-appicon">🔔</span>
        <span className="reminders-appname">MobileAssistant</span>
        <button className="sync-btn">
          <img src={logo} alt="Sync" className="sync-logo" />
          <span className="sync-text">Sync</span>
        </button>
      </div>
      <div className="reminder-list">
        <div className="reminders-title">Today's Reminders</div>
        {loading ? (
          <div>Loading...</div>
        ) : reminders.length === 0 ? (
          <div className="reminder-empty">No reminders yet</div>
        ) : (
          reminders.map(rem => (
            <div className="reminder-card outline" key={rem.id}>
              <div className="reminder-info">
                <div className="reminder-title">{rem.title}</div>
                <div className="reminder-details">{rem.datetime}</div>
                {rem.contact_name && (
                  <div className="reminder-meta">Contact: {rem.contact_name}</div>
                )}
                {rem.details && (
                  <div className="reminder-meta">{rem.details}</div>
                )}
              </div>
              <div className="reminder-actions">
                <button
                  className="reminder-edit-btn outline"
                  onClick={() => navigate('/add-reminder', { state: rem })}
                  aria-label="Edit Reminder"
                >✎</button>
                <button
                  className="reminder-edit-btn outline"
                  onClick={() => deleteReminder(rem.id)}
                  aria-label="Delete Reminder"
                >🗑️</button>
              </div>
            </div>
          ))
        )}
      </div>
      <button
        className="add-reminder-btn outline"
        onClick={() => navigate('/add-reminder')}
        aria-label="Add Reminder"
      >
        +
      </button>
    </div>
  );
}

