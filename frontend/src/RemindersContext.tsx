import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

export interface Reminder {
  id: string;
  title: string;
  datetime: string;
  contact_name?: string;
  details?: string;
}

type RemindersContextType = {
  reminders: Reminder[];
  addReminder: (reminder: Omit<Reminder, 'id'>) => Promise<void>;
  refreshReminders: () => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
};

const RemindersContext = createContext<RemindersContextType | undefined>(undefined);

export function RemindersProvider({ children }: { children: React.ReactNode }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);

  function getToken() {
    const token = localStorage.getItem('token');
    return token ? `Bearer ${token}` : '';
  }

  async function refreshReminders() {
    const res = await axios.get('http://127.0.0.1:8000/reminders/', {
      headers: { Authorization: getToken() }
    });
    setReminders(res.data);
  }

  async function addReminder(reminder: Omit<Reminder, 'id'>) {
    await axios.post('http://127.0.0.1:8000/reminders/', reminder, {
      headers: { Authorization: getToken() }
    });
    await refreshReminders();
  }

  async function deleteReminder(id: string) {
    await axios.delete(`http://127.0.0.1:8000/reminders/${id}`, {
      headers: { Authorization: getToken() }
    });
    await refreshReminders();
  }

  useEffect(() => {
    refreshReminders();
  }, []);

  return (
    <RemindersContext.Provider value={{ reminders, addReminder, refreshReminders, deleteReminder }}>
      {children}
    </RemindersContext.Provider>
  );
}

export function useReminders() {
  const ctx = useContext(RemindersContext);
  if (!ctx) throw new Error('useReminders must be used within RemindersProvider');
  return ctx;
}