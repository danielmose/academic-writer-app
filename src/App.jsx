import React, { useState } from 'react';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from '@clerk/clerk-react';

const GOOGLE_SHEETS_API_URL = "https://script.google.com/macros/s/AKfycbzigJhUDyKaEnzGeMOlf0cdjB_598zD_4qJBuLuh4piloC-raBnSn8jYAzWUL7VzLl2/exec";

export default function App() {
  const { user, isLoaded } = useUser();

  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const isAdmin = userEmail === 'writerdan791@gmail.com';

  const [formData, setFormData] = useState({
    serviceType: 'Essay Writing',
    customService: '',
    subject: 'General Writing',
    pages: 2,
    deadlineDays: 3,
    instructions: '',
  });

  const [attachedFile, setAttachedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'admin', text: 'Hello! How can I assist you with your academic work today?' }
  ]);
  const [newMessage, setNewMessage] = useState('');

  // Ratings State (Pre-populated with fake reviews)
  const [reviews, setReviews] = useState([
    { id: 1, name: 'Sarah M.', rating: 5, comment: 'Writer Dan delivered my MATH 210 paper 2 days early. Flawless work!' },
    { id: 2, name: 'David K.', rating: 5, comment: 'Extremely professional service. Saved my grade on my nursing research paper.' },
    { id: 3, name: 'Anita P.', rating: 4, comment: 'Great communication and followed all rubric instructions carefully.' },
    { id: 4, name: 'Jason T.', rating: 5, comment: 'Best academic support available online. Highly recommended!' },
  ]);

  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');

  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedFile({
        name: file.name,
        type: file.type,
        base64: reader.result,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to submit a request.');
      return;
    }

    setIsSubmitting(true);

    const finalService = formData.serviceType === 'Custom Task' ? formData.customService : formData.serviceType;

    const payload = {
      clientEmail: userEmail,
      clientName: user.fullName || user.firstName || 'Student Client',
      service: finalService,
      subject: formData.subject,
      pages: formData.pages,
      deadline: `${formData.deadlineDays} Days`,
      instructions: formData.instructions || 'N/A',
      fileName: attachedFile ? attachedFile.name : 'No Attachment',
      fileData: attachedFile ? attachedFile.base64 : '',
    };

    try {
      await fetch(GOOGLE_SHEETS_API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      alert('Order and details submitted successfully!');
      setAttachedFile(null);
    } catch (err) {
      console.error(err);
      alert('Error submitting request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setChatMessages([...chatMessages, { sender: 'user', text: newMessage }]);
    setNewMessage('');

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'admin', text: 'Thanks for reaching out! Writer Dan has received your message.' }
      ]);
    }, 1000);
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;

    const reviewObj = {
      id: Date.now(),
      name: user?.firstName || userEmail?.split('@')[0] || 'Student',
      rating: Number(newRating),
      comment: newReviewText,
    };

    setReviews([reviewObj, ...reviews]);
    setNewReviewText('');
    alert('Thank you! Your rating has been posted.');
  };

  const handleDeleteReview = (id) => {
    if (window.confirm('Admin: Are you sure you want to delete this rating?')) {
      setReviews(reviews.filter((r) => r.id !== id));
    }
  };

  if (!isLoaded) return <div style={styles.loading}>Loading application...</div>;

  return (
    <div style={styles.container}>
      {/* Navigation Header */}
      <header style={styles.nav}>
        <div style={styles.logoGroup}>
          <div style={styles.logoBadge}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
          <span style={styles.logoText}>Academic Writer</span>
        </div>

        <div>
          <SignedOut>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <SignInButton mode="modal">
                <button style={styles.signInBtn}>Sign In</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button style={styles.signUpBtn}>Sign Up</button>
              </SignUpButton>
            </div>
          </SignedOut>
          <SignedIn>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={styles.userBadge}>
                {isAdmin ? 'Admin' : 'Student'}: <strong>{userEmail}</strong>
              </span>
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
        </div>
      </header>

      {/* Admin Panel */}
      {isAdmin && (
        <div style={styles.adminBanner}>
          <div>
            <strong>Administrator Access Active</strong>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Logged in as {userEmail}</p>
          </div>
          <a href="https://sheets.google.com" target="_blank" rel="noreferrer" style={styles.sheetBtn}>
            Open Sheets Database ?
          </a>
        </div>
      )}

      {/* Main Order Area */}
      <main style={styles.main}>
        <div style={styles.hero}>
          <h1 style={styles.heroTitle}>Premium Academic Support</h1>
          <p style={styles.heroSubtitle}>Fast, confidential, and professional assistance for your assignments & exams.</p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardHeader}>Place Your Order</h2>

          <SignedIn>
            <form onSubmit={handleSubmitOrder} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Select or Specify Service</label>
                <select name="serviceType" value={formData.serviceType} onChange={handleFormChange} style={styles.input}>
                  <option value="Essay Writing">Essay / Research Paper</option>
                  <option value="MATH 210 / STEM Homework">MATH 210 / STEM Homework</option>
                  <option value="Proctored Exam Assistance">Proctored Exam Assistance</option>
                  <option value="Full Course Management">Full Course Management</option>
                  <option value="Custom Task">Other / Custom Service Request...</option>
                </select>
              </div>

              {formData.serviceType === 'Custom Task' && (
                <div style={styles.field}>
                  <label style={styles.label}>Describe Custom Service Needed</label>
                  <input
                    type="text"
                    name="customService"
                    placeholder="e.g., Python Scripting, Lab Report, Presentation..."
                    value={formData.customService}
                    onChange={handleFormChange}
                    required
                    style={styles.input}
                  />
                </div>
              )}

              <div style={styles.field}>
                <label style={styles.label}>Subject Area</label>
                <select name="subject" value={formData.subject} onChange={handleFormChange} style={styles.input}>
                  <option value="General Writing">General Writing / Humanities</option>
                  <option value="MATH 210 Vectors">MATH 210 (Linear Algebra / Vectors)</option>
                  <option value="Nursing / Anatomy">Nursing / Anatomy & Physiology</option>
                  <option value="Computer Science / STEM">Computer Science / STEM</option>
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Detailed Instructions / Prompt</label>
                <textarea
                  name="instructions"
                  rows="3"
                  placeholder="Paste rubric details or specific requests here..."
                  value={formData.instructions}
                  onChange={handleFormChange}
                  style={styles.textarea}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Upload Task Files (PDF, Word, Images)</label>
                <input type="file" onChange={handleFileChange} style={styles.fileInput} />
                {attachedFile && (
                  <span style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '0.25rem' }}>
                    [Attached]: {attachedFile.name}
                  </span>
                )}
              </div>

              <div style={styles.row}>
                <div style={styles.field}>
                  <div style={styles.sliderHeader}>
                    <label style={styles.label}>Pages / Size</label>
                    <span style={styles.sliderVal}>{formData.pages} pages</span>
                  </div>
                  <input type="range" name="pages" min="1" max="30" value={formData.pages} onChange={handleFormChange} style={styles.slider} />
                </div>

                <div style={styles.field}>
                  <div style={styles.sliderHeader}>
                    <label style={styles.label}>Deadline</label>
                    <span style={styles.sliderVal}>{formData.deadlineDays} Days</span>
                  </div>
                  <input type="range" name="deadlineDays" min="1" max="14" value={formData.deadlineDays} onChange={handleFormChange} style={styles.slider} />
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} style={styles.submitBtn}>
                {isSubmitting ? 'Processing Order...' : 'Submit Request Now'}
              </button>
            </form>
          </SignedIn>

          <SignedOut>
            <div style={styles.signedOutBox}>
              <p style={{ margin: '0 0 0.4rem 0', fontWeight: 'bold' }}>Welcome to Academic Writer</p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>Please <strong>Sign In</strong> or <strong>Sign Up</strong> above to place an order and track your submissions.</p>
            </div>
          </SignedOut>
        </div>

        {/* Ratings and Reviews Section */}
        <div style={{ ...styles.card, marginTop: '2rem' }}>
          <h2 style={styles.cardHeader}>Student Ratings & Feedback</h2>

          <SignedIn>
            <form onSubmit={handleAddReview} style={{ ...styles.form, marginBottom: '2rem' }}>
              <div style={styles.field}>
                <label style={styles.label}>Leave a Rating</label>
                <select value={newRating} onChange={(e) => setNewRating(e.target.value)} style={styles.input}>
                  <option value="5">????? (5 Stars - Excellent)</option>
                  <option value="4">????? (4 Stars - Good)</option>
                  <option value="3">????? (3 Stars - Average)</option>
                  <option value="2">????? (2 Stars - Below Average)</option>
                  <option value="1">????? (1 Star - Poor)</option>
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Your Review / Feedback</label>
                <textarea
                  rows="2"
                  placeholder="Share your experience working with Writer Dan..."
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  required
                  style={styles.textarea}
                />
              </div>

              <button type="submit" style={{ ...styles.submitBtn, background: '#10b981' }}>
                Post Rating
              </button>
            </form>
          </SignedIn>

          {/* List of Reviews */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reviews.map((rev) => (
              <div key={rev.id} style={styles.reviewCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '700', color: '#38bdf8' }}>{rev.name}</span>
                  <span style={{ color: '#f59e0b', fontSize: '0.9rem' }}>
                    {'?'.repeat(rev.rating)}{'?'.repeat(5 - rev.rating)}
                  </span>
                </div>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#cbd5e1' }}>{rev.comment}</p>

                {isAdmin && (
                  <button
                    onClick={() => handleDeleteReview(rev.id)}
                    style={styles.deleteReviewBtn}
                  >
                    Delete Review (Admin)
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Floating Chat Widget with Writer */}
      <div style={styles.chatWrapper}>
        {isChatOpen ? (
          <div style={styles.chatBox}>
            <div style={styles.chatHeader}>
              <span>Chat with Writer</span>
              <button onClick={() => setIsChatOpen(false)} style={styles.closeChatBtn}>?</button>
            </div>
            <div style={styles.chatBody}>
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.chatBubble,
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    background: msg.sender === 'user' ? '#2563eb' : '#334155',
                  }}
                >
                  {msg.text}
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} style={styles.chatFooter}>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                style={styles.chatInput}
              />
              <button type="submit" style={styles.sendBtn}>Send</button>
            </form>
          </div>
        ) : (
          <button onClick={() => setIsChatOpen(true)} style={styles.chatToggleBtn}>
            Chat with Writer
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { fontFamily: "'Inter', system-ui, -apple-system, sans-serif", minHeight: '100vh', background: '#0f172a', color: '#f8fafc', paddingBottom: '4rem' },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2rem', borderBottom: '1px solid #1e293b', background: '#0f172a' },
  logoGroup: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  logoBadge: { background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: '#fff', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontWeight: '700', fontSize: '1.25rem', letterSpacing: '-0.02em', color: '#ffffff' },
  signInBtn: { background: 'transparent', color: '#cbd5e1', border: '1px solid #334155', padding: '0.55rem 1.1rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  signUpBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '0.55rem 1.1rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  userBadge: { fontSize: '0.85rem', color: '#94a3b8', background: '#1e293b', padding: '0.4rem 0.8rem', borderRadius: '20px', border: '1px solid #334155' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0f172a', color: '#94a3b8' },
  adminBanner: { maxWidth: '720px', margin: '1.5rem auto 0', padding: '1rem 1.5rem', background: '#1e1b4b', border: '1px solid #4338ca', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  sheetBtn: { background: '#10b981', color: '#fff', padding: '0.5rem 1rem', borderRadius: '6px', textDecoration: 'none', fontWeight: '600', fontSize: '0.85rem' },
  main: { maxWidth: '720px', margin: '0 auto', padding: '3rem 1.5rem' },
  hero: { textAlign: 'center', marginBottom: '2.5rem' },
  heroTitle: { fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '0.5rem' },
  heroSubtitle: { color: '#94a3b8', fontSize: '1rem', margin: 0 },
  card: { background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)' },
  cardHeader: { margin: '0 0 1.5rem', fontSize: '1.25rem', fontWeight: '700', borderBottom: '1px solid #334155', paddingBottom: '0.75rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1' },
  sliderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  sliderVal: { fontSize: '0.85rem', color: '#38bdf8', fontWeight: '600' },
  input: { background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '0.75rem', color: '#f8fafc', fontSize: '0.95rem', outline: 'none' },
  textarea: { background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '0.75rem', color: '#f8fafc', fontSize: '0.95rem', outline: 'none', resize: 'vertical' },
  fileInput: { color: '#94a3b8', fontSize: '0.85rem' },
  slider: { accentColor: '#3b82f6', cursor: 'pointer' },
  submitBtn: { background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none', padding: '0.9rem', borderRadius: '8px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem' },
  signedOutBox: { textAlign: 'center', padding: '2rem', background: '#0f172a', borderRadius: '10px', color: '#cbd5e1', border: '1px dashed #334155' },
  reviewCard: { background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '1rem', position: 'relative' },
  deleteReviewBtn: { marginTop: '0.75rem', background: '#ef4444', color: '#fff', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' },
  chatWrapper: { position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 1000 },
  chatToggleBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '0.8rem 1.25rem', borderRadius: '30px', fontWeight: '600', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', cursor: 'pointer' },
  chatBox: { width: '320px', height: '400px', background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)', overflow: 'hidden' },
  chatHeader: { background: '#0f172a', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '600', fontSize: '0.9rem', borderBottom: '1px solid #334155' },
  closeChatBtn: { background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem' },
  chatBody: { flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  chatBubble: { maxWidth: '80%', padding: '0.6rem 0.8rem', borderRadius: '10px', fontSize: '0.85rem', color: '#fff' },
  chatFooter: { padding: '0.5rem', background: '#0f172a', display: 'flex', gap: '0.5rem', borderTop: '1px solid #334155' },
  chatInput: { flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', padding: '0.4rem 0.6rem', color: '#fff', fontSize: '0.85rem', outline: 'none' },
  sendBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }
};
