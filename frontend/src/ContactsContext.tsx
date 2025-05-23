import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  description?: string;
  image_url?: string;
}

type ContactsContextType = {
  contacts: Contact[];
  refreshContacts: () => Promise<void>;
  addContact: (contact: Omit<Contact, 'id'>) => Promise<void>;
  updateContact: (id: string, contact: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
};

const ContactsContext = createContext<ContactsContextType | undefined>(undefined);

export function ContactsProvider({ children }: { children: React.ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>([]);

  function getToken() {
    const token = localStorage.getItem('token');
    return token ? `Bearer ${token}` : '';
  }

  async function refreshContacts() {
    const res = await axios.get('http://127.0.0.1:8000/contacts', {
      headers: { Authorization: getToken() }
    });
    setContacts(res.data);
  }

  async function addContact(contact: Omit<Contact, 'id'>) {
    await axios.post('http://127.0.0.1:8000/contacts', contact, {
      headers: { Authorization: getToken() }
    });
    await refreshContacts();
  }

  async function updateContact(id: string, contact: Partial<Contact>) {
    await axios.put(`http://127.0.0.1:8000/contacts/${id}`, contact, {
      headers: { Authorization: getToken() }
    });
    await refreshContacts();
  }

  async function deleteContact(id: string) {
    await axios.delete(`http://127.0.0.1:8000/contacts/${id}`, {
      headers: { Authorization: getToken() }
    });
    await refreshContacts();
  }

  useEffect(() => {
    refreshContacts();
  }, []);

  return (
    <ContactsContext.Provider value={{ contacts, refreshContacts, addContact, updateContact, deleteContact }}>
      {children}
    </ContactsContext.Provider>
  );
}

export function useContacts() {
  const ctx = useContext(ContactsContext);
  if (!ctx) throw new Error('useContacts must be used within ContactsProvider');
  return ctx;
}