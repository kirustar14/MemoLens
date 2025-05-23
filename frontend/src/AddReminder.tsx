import { useLocation, useNavigate } from 'react-router-dom';
import { useReminders } from './RemindersContext';
import './addReminder.css';
import { useState } from 'react';

export default function AddReminder() {
  const location = useLocation();
  const prefill = location.state || {};

  const navigate = useNavigate();
  const { addReminder, refreshReminders } = useReminders();

  // Local state for form fields
  const [title, setTitle] = useState(prefill.title || '');
  const [datetime, setDatetime] = useState(prefill.datetime || '');
  const [contactName, setContactName] = useState(prefill.contact_name || '');
  const [details, setDetails] = useState(prefill.details || '');
  const [repeat, setRepeat] = useState('Everyday');
  const [editingDateTime, setEditingDateTime] = useState(false);
  const [editingRepeat, setEditingRepeat] = useState(false);

  async function handleCreate() {
    await addReminder({
      title: title || 'New Reminder',
      datetime: datetime || 'No time set',
      contact_name: contactName,
      details,
    });
    await refreshReminders(); // Ensure context is updated
    navigate('/reminders');
  }

  return (
    <div className="add-reminder-container">
      <div className="add-reminder-topbar">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <span className="add-reminder-title">Add reminder</span>
      </div>

      <div className="add-reminder-card">
        <div className="reminder-title-row">
          <input
            className="reminder-title-input"
            placeholder="New Reminder"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <button className="edit-title-btn">✎</button>
        </div>
        <div className="reminder-row">
          {editingRepeat ? (
            <input
              className="details-input"
              type="text"
              placeholder="e.g. Everyday"
              value={repeat}
              onChange={e => setRepeat(e.target.value)}
              onBlur={() => setEditingRepeat(false)}
              onKeyDown={e => {
                if (e.key === 'Enter') setEditingRepeat(false);
              }}
              autoFocus
              style={{ width: '120px' }}
            />
          ) : (
            <>
              <span>📅 {repeat}</span>
              <button
                className="edit-title-btn"
                style={{ marginLeft: 8 }}
                onClick={() => setEditingRepeat(true)}
                type="button"
              >✎</button>
            </>
          )}
        </div>
        <div className="reminder-row">
          {editingDateTime ? (
            <input
              className="details-input"
              type="text"
              placeholder="e.g. 5:30pm - 5:35pm"
              value={datetime}
              onChange={e => setDatetime(e.target.value)}
              onBlur={() => setEditingDateTime(false)}
              onKeyDown={e => {
                if (e.key === 'Enter') setEditingDateTime(false);
              }}
              autoFocus
              style={{ width: '180px' }}
            />
          ) : (
            <>
              <span>🕒 {datetime || '5:30pm - 5:35pm'}</span>
              <button
                className="edit-title-btn"
                style={{ marginLeft: 8 }}
                onClick={() => setEditingDateTime(true)}
                type="button"
              >✎</button>
            </>
          )}
        </div>
      </div>

      <div className="add-details-card">
        <div className="details-header">📝 Enter details.</div>
        <input
          className="details-input"
          placeholder="Contact Name"
          value={contactName}
          onChange={e => setContactName(e.target.value)}
        />
        <input className="details-input" placeholder="Email address" />
        <div className="attendees-row">
          <input className="details-input" placeholder="Add attendees" />
          <button className="add-attendee-btn">+</button>
        </div>
        <textarea
          className="details-textarea"
          placeholder="Meeting details."
          value={details}
          onChange={e => setDetails(e.target.value)}
        />
      </div>

      <button className="create-btn" onClick={handleCreate}>Create</button>

      {/* Bottom nav bar */}
      <div className="bottom-nav">
        <span>🏠</span>
        <span>🔍</span>
        <span className="nav-plus">+</span>
        <span>💬</span>
        <span>⚙️</span>
      </div>
    </div>
  );
}