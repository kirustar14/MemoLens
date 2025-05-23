import { useParams, useNavigate } from 'react-router-dom';
import { useContacts } from './ContactsContext';
import './contacts.css';

export default function ContactProfile() {
  const { id } = useParams();
  const { contacts } = useContacts();
  const navigate = useNavigate();

  const contact = contacts.find(c => c.id === id);

  if (!contact) return <div>Loading...</div>;

  return (
    <div className="contact-profile">
      {contact.image_url && <img src={contact.image_url} alt={contact.name} className="contact-img-large" />}
      <h2>{contact.name}</h2>
      {contact.email && <div>Email: {contact.email}</div>}
      {contact.phone && <div>Phone: {contact.phone}</div>}
      {contact.description && <div>{contact.description}</div>}
      <div className="profile-actions">
        <button onClick={() => navigate(`/contacts/${contact.id}/edit`)}>Edit Contact</button>
        <button onClick={() => navigate(-1)}>Back</button>
      </div>
    </div>
  );
}