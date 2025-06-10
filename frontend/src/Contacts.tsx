import { useNavigate } from 'react-router-dom';
import { useContacts } from './ContactsContext';
import './contacts.css'; // Ensure this path is correct

export default function Contacts() {
  const { contacts, deleteContact } = useContacts();
  const navigate = useNavigate();

  const goToDashboard = () => {
    navigate('/'); // This will take you to the dashboard route
  };

  return (
    <div className="contacts-container">
      {/* New header structure for back arrow and title */}
      <div className="contacts-page-header"> {/* Use a new class for specific styling */}
        <button className="back-arrow" onClick={goToDashboard}>
          ←
        </button>
        <h1 className="contacts-title">Contacts</h1> {/* Changed to h1 for semantic hierarchy and used a new class */}
      </div>

      <div className="add-contact-button-container"> {/* Container for the Add Contact button */}
        <button className="add-contact-btn" onClick={() => navigate('/contacts/add')}>
          Add Contact
        </button>
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
              ></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}