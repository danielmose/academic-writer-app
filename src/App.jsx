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
    service: 'Essay Writing',
    subject: 'General Writing',
    pages: 2,
    deadlineDays: 3,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculatePrice = () => {
    let rate = 15;
    if (formData.subject.includes('MATH') || formData.subject.includes('STEM')) rate = 20;
    let urgency = formData.deadlineDays <= 1 ? 1.5 : 1;
    return Math.round(formData.pages * rate * urgency);
  };

  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to submit a request.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      clientEmail: userEmail,
      clientName: user.fullName || user.firstName || 'Student Client',
      service: formData.service,
      subject: formData.subject,
      pages: formData.pages,
      deadline: `${formData.deadlineDays} Days`,
      price: `$${calculatePrice()}`,
    };

    try {
      await fetch(GOOGLE_SHEETS_API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      alert('Order submitted successfully! Logged in Google Sheets.');
    } catch (err) {
      console.error(err);
      alert('Error submitting request.');
    } finally {
      setIsSubmitting(false);
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
                {isAdmin ? '?? Admin' : '?? Student'}: <strong>{userEmail}</strong>
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
                <label style={styles.label}>Select Service</label>
                <select name="service" value={formData.service} onChange={handleFormChange} style={styles.input}>
                  <option value="Essay Writing">Essay / Research Paper</option>
                  <option value="MATH 210 / STEM Homework">MATH 210 / STEM Homework</option>
                  <option value="Proctored Exam Assistance">Proctored Exam Assistance</option>
                  <option value="Full Course Management">Full Course Management</option>
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Subject Area</label>
                <select name="subject" value={formData.subject} onChange={handleFormChange} style={styles.input}>
                  <option value="General Writing">General Writing / Humanities</option>
                  <option value="MATH 210 Vectors">MATH 210 (Linear Algebra / Vectors)</option>
                  <option value="Nursing / Anatomy">Nursing / Anatomy & Physiology</option>
                  <option value="Computer Science / STEM">Computer Science / STEM</option>
                </select>
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

              <div style={styles.priceCard}>
                <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Total Estimate</span>
                <span style={styles.priceAmount}>${calculatePrice()}</span>
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
      </main>
    </div>
  );
}

const styles = {
  container: { fontFamily: "'Inter', system-ui, -apple-system, sans-serif", minHeight: '100vh', background: '#0f172a', color: '#f8fafc' },
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
  slider: { accentColor: '#3b82f6', cursor: 'pointer' },
  priceCard: { background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' },
  priceAmount: { fontSize: '1.5rem', fontWeight: '800', color: '#10b981' },
  submitBtn: { background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none', padding: '0.9rem', borderRadius: '8px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem' },
  signedOutBox: { textAlign: 'center', padding: '2rem', background: '#0f172a', borderRadius: '10px', color: '#cbd5e1', border: '1px dashed #334155' }
};
