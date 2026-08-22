import React, { useState } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';

export default function App() {
  const { user, isLoaded } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() || '';
  const isAdmin = userEmail === 'writerdan791@gmail.com';

  const [orders, setOrders] = useState([
    {
      id: 1,
      clientEmail: 'student1@university.edu',
      clientName: 'Alex Johnson',
      service: 'MATH 210 Vectors',
      subject: 'STEM / Linear Algebra',
      pages: 5,
      deadline: '2 Days',
      price: '$100',
      status: 'In Progress',
      timestamp: '2026-08-22 08:30'
    }
  ]);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState({
    'student1@university.edu': [
      { sender: 'student', text: 'Hi, I submitted my assignment requirements for MATH 210 vectors.', time: '08:30 AM' },
      { sender: 'writer', text: 'Hello! I received it. Reviewing the details now.', time: '08:32 AM' }
    ]
  });
  const [replyText, setReplyText] = useState('');

  const [formData, setFormData] = useState({ service: 'Essay Writing', subject: 'General Writing', pages: 2, deadlineDays: 3 });

  const calculatePrice = () => {
    let rate = 15;
    if (formData.subject.includes('MATH') || formData.subject.includes('STEM')) rate = 20;
    let urgency = formData.deadlineDays <= 1 ? 1.5 : 1;
    return Math.round(formData.pages * rate * urgency);
  };

  const handleSendMessage = (email) => {
    if (!replyText.trim()) return;
    const currentMsgs = messages[email] || [];
    setMessages({
      ...messages,
      [email]: [...currentMsgs, { sender: 'writer', text: replyText, time: 'Just now' }]
    });
    setReplyText('');
  };

  const toggleOrderStatus = (id) => {
    setOrders(orders.map(ord => {
      if (ord.id === id) {
        const nextStatus = ord.status === 'Pending' ? 'In Progress' : ord.status === 'In Progress' ? 'Completed' : 'Pending';
        return { ...ord, status: nextStatus };
      }
      return ord;
    }));
  };

  if (!isLoaded) return <div style={{ color: '#fff', padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ background: '#0b132b', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', padding: '1rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1c2541', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Academic Writer Hub</h2>
        <div>
          <SignedIn>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#4cc9f0' }}>{isAdmin ? '?? Admin (Writer): ' : '?? Student: '}{userEmail}</span>
              <UserButton />
            </div>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button style={{ padding: '0.5rem 1rem', background: '#4cc9f0', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Sign In</button>
            </SignInButton>
          </SignedOut>
        </div>
      </header>

      {isAdmin ? (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* STATS OVERVIEW HEADER */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#1c2541', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #4361ee' }}>
              <div style={{ fontSize: '0.8rem', color: '#a0aec0' }}>Active Assignments</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4cc9f0' }}>{orders.filter(o => o.status !== 'Completed').length}</div>
            </div>
            <div style={{ background: '#1c2541', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
              <div style={{ fontSize: '0.8rem', color: '#a0aec0' }}>Total Revenue</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>$100</div>
            </div>
            <div style={{ background: '#1c2541', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #f72585', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#a0aec0' }}>Database Link</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fff' }}>Google Sheets</div>
              </div>
              <a href="https://sheets.google.com" target="_blank" rel="noreferrer" style={{ background: '#10b981', color: '#fff', padding: '0.4rem 0.7rem', borderRadius: '4px', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 'bold' }}>Open ?</a>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: selectedStudent ? '1fr 1fr' : '1fr', gap: '1rem' }}>
            {/* MANAGEMENT TABLE / LIST */}
            <div style={{ background: '#1c2541', padding: '1.25rem', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Order Management & Submissions</h4>
              {orders.map((ord) => (
                <div key={ord.id} style={{ background: '#0b132b', padding: '1rem', borderRadius: '6px', border: '1px solid #2d3748', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#4cc9f0', marginBottom: '0.5rem' }}>
                    <strong>{ord.clientName} ({ord.clientEmail})</strong>
                    <span>{ord.timestamp}</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    <strong>{ord.service}</strong> - {ord.subject} ({ord.pages} pages, {ord.deadline})
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                    <div>
                      <span style={{ color: '#10b981', fontWeight: 'bold', marginRight: '0.75rem' }}>{ord.price}</span>
                      <button onClick={() => toggleOrderStatus(ord.id)} style={{ background: ord.status === 'Completed' ? '#059669' : ord.status === 'In Progress' ? '#d97706' : '#4b5563', color: '#fff', border: 'none', padding: '0.25rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', cursor: 'pointer' }}>
                        Status: {ord.status}
                      </button>
                    </div>
                    <button onClick={() => setSelectedStudent(ord)} style={{ background: '#4361ee', color: '#fff', padding: '0.4rem 0.8rem', border: 'none', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}>
                      {selectedStudent?.clientEmail === ord.clientEmail ? 'Chat Open' : 'Open Live Chat'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* LIVE CHAT PANEL */}
            {selectedStudent && (
              <div style={{ background: '#1c2541', padding: '1.25rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #2d3748', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: '#4cc9f0' }}>Live Chat: {selectedStudent.clientName}</h4>
                    <button onClick={() => setSelectedStudent(null)} style={{ background: 'transparent', border: 'none', color: '#a0aec0', cursor: 'pointer', fontWeight: 'bold' }}>?</button>
                  </div>
                  <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {(messages[selectedStudent.clientEmail] || []).map((msg, index) => (
                      <div key={index} style={{ alignSelf: msg.sender === 'writer' ? 'flex-end' : 'flex-start', background: msg.sender === 'writer' ? '#4361ee' : '#0b132b', padding: '0.6rem 0.8rem', borderRadius: '6px', maxWidth: '80%', fontSize: '0.85rem' }}>
                        <div>{msg.text}</div>
                        <div style={{ fontSize: '0.7rem', color: '#a0aec0', textAlign: 'right', marginTop: '0.2rem' }}>{msg.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <input type="text" placeholder="Type message..." value={replyText} onChange={(e) => setReplyText(e.target.value)} style={{ flex: 1, padding: '0.5rem', background: '#0b132b', color: '#fff', border: '1px solid #2d3748', borderRadius: '4px' }} />
                  <button onClick={() => handleSendMessage(selectedStudent.clientEmail)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.5rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Send</button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* STUDENT CLIENT VIEW */
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2>Premium Academic Support</h2>
          <p style={{ color: '#a0aec0', fontSize: '0.9rem' }}>Fast, confidential, and professional assistance for your assignments & exams.</p>
          <div style={{ background: '#1c2541', padding: '1.5rem', borderRadius: '8px', textAlign: 'left', marginTop: '1.5rem' }}>
            <h3>Place Your Order</h3>
            <SignedIn>
              <form onSubmit={(e) => { e.preventDefault(); alert('Order submitted!'); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem' }}>Service</label>
                  <select value={formData.service} onChange={(e) => setFormData({...formData, service: e.target.value})} style={{ width: '100%', padding: '0.6rem', background: '#0b132b', color: '#fff', border: '1px solid #4a5568', borderRadius: '4px' }}>
                    <option value="Essay Writing">Essay / Research Paper</option>
                    <option value="STEM / Homework">STEM / Homework</option>
                  </select>
                </div>
                <div style={{ background: '#064e3b', color: '#a7f3d0', padding: '0.75rem', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }}>
                  Estimated Price: ${calculatePrice()}
                </div>
                <button type="submit" style={{ padding: '0.75rem', background: '#4361ee', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Submit Request</button>
              </form>
            </SignedIn>
            <SignedOut>
              <p style={{ color: '#a0aec0' }}>Please sign in to place an order.</p>
            </SignedOut>
          </div>
        </div>
      )}
    </div>
  );
}
