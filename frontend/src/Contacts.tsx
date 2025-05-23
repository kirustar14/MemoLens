import { useNavigate } from 'react-router-dom';
import { useContacts } from './ContactsContext';
import './contacts.css';

export default function Contacts() {
  const { contacts, deleteContact } = useContacts();
  const navigate = useNavigate();

  return (
    <div className="contacts-container">
      <div className="contacts-header">
        <h2>Contacts</h2>
        <button className="add-contact-btn" onClick={() => navigate('/contacts/add')}>Add Contact</button>
      </div>
      <div className="contacts-list">
        {contacts.map(contact => (
          <div className="contact-card" key={contact.id}>
            <div
              className="contact-info"
              onClick={() => navigate(`/contacts/${contact.id}`)}
              style={{ flex: 1, cursor: 'pointer' }}
            >
              {contact.image_url && <img src={contact.image_url} alt={contact.name} className="contact-img" />}
              <div>
                <div className="contact-name">{contact.name}</div>
                {contact.email && <div className="contact-email">{contact.email}</div>}
                {contact.phone && <div className="contact-phone">{contact.phone}</div>}
              </div>
            </div>
            <div className="contact-actions">
              <button
                onClick={e => {
                  e.stopPropagation();
                  navigate(`/contacts/${contact.id}/edit`);
                }}
                aria-label="Edit"
              >✎</button>
              <button
                onClick={async e => {
                  e.stopPropagation();
                  if (window.confirm('Delete this contact?')) {
                    await deleteContact(contact.id);
                  }
                }}
                aria-label="Delete"
                className="delete-btn"
              >🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}