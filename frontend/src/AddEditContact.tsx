import { useNavigate, useParams } from 'react-router-dom';
import { useContacts } from './ContactsContext';
import { useState } from 'react';
import './contacts.css';

export default function AddEditContact() {
  const { id } = useParams();
  const { contacts, addContact, updateContact } = useContacts();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const contact = contacts.find(c => c.id === id) || {};

  const [name, setName] = useState(contact.name || '');
  const [email, setEmail] = useState(contact.email || '');
  const [phone, setPhone] = useState(contact.phone || '');
  const [description, setDescription] = useState(contact.description || '');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      await updateContact(id!, { name, email, phone, description });
    } else {
      await addContact({ name, email, phone, description });
    }
    navigate('/contacts');
  }

  return (
    <form className="add-edit-contact-form" onSubmit={handleSubmit}>
      <h2>{editing ? 'Edit Contact' : 'Add Contact'}</h2>
      <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
      <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
      <button type="submit">{editing ? 'Save' : 'Add'}</button>
      <button type="button" onClick={() => navigate('/contacts')}>Cancel</button>
    </form>
  );
}