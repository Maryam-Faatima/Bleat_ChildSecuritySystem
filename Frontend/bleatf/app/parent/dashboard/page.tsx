'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/auth-context';
import { ApiService } from '@/lib/api';
import styles from './dashboard.module.css';

export default function ParentDashboard() {
  const router = useRouter();
  const { userId, userRole, logout } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChild, setSelectedChild] = useState<number | null>(null);

  useEffect(() => {
    if (!userId || userRole !== 'PARENT') {
      router.push('/');
      return;
    }

    loadData();
  }, [userId, userRole, router]);

  const loadData = async () => {
    try {
      const childrenResponse = await ApiService.getChildrenByParent(userId!);
      if (childrenResponse.success) {
        setChildren(childrenResponse.data || []);
      }

      const messagesResponse = await ApiService.getParentMessages(userId!);
      if (messagesResponse.success) {
        setMessages(messagesResponse.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild || !newMessage.trim()) return;

    try {
      const result = await ApiService.sendMessage(userId!, selectedChild, newMessage);
      if (result.success) {
        setNewMessage('');
        loadData();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>👨‍👩‍👧 Parent Dashboard</h1>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Logout
        </button>
      </header>

      <div className={styles.container}>
        <section className={styles.section}>
          <h2>Your Children</h2>
          <div className={styles.childrenList}>
            {children.length > 0 ? (
              children.map((child: any) => (
                <div
                  key={child.childId}
                  className={`${styles.childCard} ${
                    selectedChild === child.childId ? styles.active : ''
                  }`}
                  onClick={() => setSelectedChild(child.childId)}
                >
                  <h3>{child.childName}</h3>
                  <p>Age: {child.childAge}</p>
                </div>
              ))
            ) : (
              <p>No children added yet.</p>
            )}
          </div>
        </section>

        {selectedChild && (
          <section className={styles.section}>
            <h2>Send Message</h2>
            <form onSubmit={handleSendMessage} className={styles.messageForm}>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                required
              />
              <button type="submit">Send Message</button>
            </form>
          </section>
        )}

        <section className={styles.section}>
          <h2>Messages</h2>
          <div className={styles.messagesList}>
            {messages.length > 0 ? (
              messages.map((msg: any, index: number) => (
                <div key={index} className={styles.messageItem}>
                  <p>{msg.content || msg.message}</p>
                  <small>{new Date(msg.timestamp || Date.now()).toLocaleString()}</small>
                </div>
              ))
            ) : (
              <p>No messages yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
