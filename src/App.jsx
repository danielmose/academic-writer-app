import React, { useState } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';

export default function App() {
  const { user, isLoaded } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() || '';
  const isAdmin = userEmail === 'writerdan791@gmail.com';

  const [orders] = useState([
    {
      id: 1,
      clientEmail: 'student1@university.edu',
      clientName: 'Alex Johnson',
      service: 'MATH 210 Vectors',
      subject: 'STEM / Linear Algebra',
      pages: 5,
      deadline: '2 Days',
      price: '$100',
      timestamp: '2026-08-22 08:30'
    }
  ]);

  const [formData, setFormData] = useState({ service: 'Essay Writing', subject: 'General Writing', pages: 2, deadlineDays: 3 });

  const calculatePrice = () => {
    let rate = 15;
    if (formData.subject.includes('MATH') || formData.subject.includes('STEM')) rate = 20;
    let urgency = formData.deadlineDays <= 1 ? 1.5 : 1;
    return Math.round(formData.pages * rate * urgency);
  };

  if (!isLoaded) return <div style={{ color: '#fff', padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ background: '#0b132b', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', padding: '1rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1c2541', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Academic Writer Hub</h2>
        <div>
          <SignedIn>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#4cc9f0' }}>{isAdmin ? 'Admin (Writer): ' : 'Student: '}{userEmail}</span>
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
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ background: '#1c2541', border: '1px solid #4361ee', padding: '1.25rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0', color: '#4cc9f0' }}>Writer Dashboard Active</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#a0aec0' }}>Student submissions and order inquiries inbox</p>
            </div>
            <a href="https://sheets.google.com" target="_blank" rel="noreferrer" style={{ background: '#10b981', color: '#fff', padding: '0.5rem 0.8rem', borderRadius: '4px', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 'bold' }}>
              Open Sheets Database
            </a>
          </div>

          <div style={{ background: '#1c2541', padding: '1.25rem', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Student Messages & Submissions</h4>
            {orders.length === 0 ? (
              <p style={{ color: '#a0aec0', fontSize: '0.9rem' }}>No student messages or orders yet.</p>
            ) : (
              orders.map((ord) => (
                <div key={ord.id} style={{ background: '#0b132b', padding: '1rem', borderRadius: '6px', border: '1px solid #2d3748', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#4cc9f0', marginBottom: '0.5rem' }}>
                    <strong>{ord.clientName} ({ord.clientEmail})</strong>
                    <span>{ord.timestamp}</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    <strong>{ord.service}</strong> - {ord.subject} ({ord.pages} pages, {ord.deadline})
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>{ord.price}</span>
                    <a href={`mailto:${ord.clientEmail}`} style={{ background: '#4361ee', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '4px', textDecoration: 'none', fontSize: '0.8rem' }}>
                      Reply to Student
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
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
          <a href="mailto:writerdan791@gmail.com" style={{ position: 'fixed', bottom: '1rem', right: '1rem', background: '#4361ee', color: '#fff', padding: '0.75rem 1.25rem', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold' }}>
            Chat with Writer
          </a>
        </div>
      )}
    </div>
  );
}
