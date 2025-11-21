'use client';
import Link from 'next/link';
import { useState } from 'react';
import MessageCard from '@/app/components/MessageCard';
import { mockMessages, mockChildren } from '@/app/lib/mockData';

export default function MessagesPage() {
  const [selectedChild, setSelectedChild] = useState(mockChildren[0]);
  const [messageContent, setMessageContent] = useState('');
  const [sentMessages, setSentMessages] = useState<Array<{ id: number; content: string; timestamp: string; direction: string }>>([]);

  const childMessages = mockMessages.filter((msg) => msg.childId === selectedChild.childId);
  const allMessages = [...childMessages, ...sentMessages].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim()) return;

    const newMessage = {
      id: Date.now(),
      content: messageContent,
      timestamp: new Date().toISOString(),
      direction: 'outgoing',
      childName: selectedChild.name,
      status: 'sent',
    };
    setSentMessages([...sentMessages, newMessage]);
    setMessageContent('');
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100vw",
        backgroundImage:
          'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
      }}
    >
      <div
        className="card shadow rounded-4 w-100"
        style={{ maxWidth: 900, borderRadius: 18, padding: '1.5rem', maxHeight: '95vh', overflowY: 'auto' }}
      >
        <div className="d-flex flex-column align-items-center w-100">
          {/* Header */}
          <div className="text-center mb-4 w-100">
            <h1 className="h4 mb-1" style={{ fontWeight: 700 }}>Messages</h1>
            <p className="text-muted small mb-3">Send and receive messages</p>
            <Link href="/parent/dashboard" className="btn btn-sm btn-outline-secondary">Back to Dashboard</Link>
          </div>

          <div className="row g-2 w-100">
            {/* Children List */}
            <div className="col-12 col-md-4">
              <div className="card h-100">
                <div className="card-body p-3">
                  <h6 className="card-title mb-2">Conversations</h6>
                  <div className="list-group list-group-flush">
                    {mockChildren.map((child) => (
                      <button
                        key={child.childId}
                        onClick={() => setSelectedChild(child)}
                        className={`list-group-item list-group-item-action py-2 px-1 small ${
                          selectedChild.childId === child.childId ? 'active' : ''
                        }`}
                      >
                        <div className="fw-semibold">{child.name}</div>
                        <div className="text-muted small">Device {child.deviceId}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Message Area */}
            <div className="col-12 col-md-8">
              <div className="card d-flex flex-column h-100" style={{ minHeight: 400 }}>
                <div className="card-body d-flex flex-column p-3" style={{ minHeight: 400 }}>
                  <h6 className="card-title mb-2">Chat with {selectedChild.name}</h6>

                  <div className="flex-grow-1 overflow-auto mb-3 small" style={{ minHeight: 300 }}>
                    {allMessages.length === 0 ? (
                      <div className="text-center text-muted py-4">No messages yet</div>
                    ) : (
                      allMessages.map((msg: any, idx) => (
                        <div key={idx} className={`d-flex mb-2 ${msg.direction === 'outgoing' ? 'justify-content-end' : 'justify-content-start'}`}>
                          <div className={`p-2 rounded ${msg.direction === 'outgoing' ? 'bg-primary text-white' : 'bg-light'}`} style={{ maxWidth: '70%' }}>
                            <div className="small">{msg.content}</div>
                            <div className="small text-muted mt-1" style={{ fontSize: '0.7rem' }}>{new Date(msg.timestamp).toLocaleTimeString()}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} className="d-flex gap-2">
                    <input
                      type="text"
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      placeholder="Type a message..."
                      className="form-control form-control-sm"
                    />
                    <button type="submit" className="btn btn-primary btn-sm">Send</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
