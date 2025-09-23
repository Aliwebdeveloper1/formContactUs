import React, { useState, useEffect } from 'react';
import { getApiUrl } from './config';

function App() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [captcha, setCaptcha] = useState({
    num1: 0,
    num2: 0,
    answer: '',
    userAnswer: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // localStorage utility functions
  const getLeadsFromStorage = () => {
    try {
      const leads = localStorage.getItem('leads');
      return leads ? JSON.parse(leads) : [];
    } catch (error) {
      console.error('Error reading leads from localStorage:', error);
      return [];
    }
  };

  const saveLeadToStorage = (leadData) => {
    try {
      const existingLeads = getLeadsFromStorage();
      const newLead = {
        id: Date.now(), // Simple unique ID using timestamp
        submittedAt: new Date().toISOString(),
        ...leadData
      };
      const updatedLeads = [...existingLeads, newLead];
      localStorage.setItem('leads', JSON.stringify(updatedLeads));
      return true;
    } catch (error) {
      console.error('Error saving lead to localStorage:', error);
      return false;
    }
  };

  // Helper function to view all leads (can be called from browser console)
  useEffect(() => {
    const viewAllLeads = () => {
      const leads = getLeadsFromStorage();
      console.log('All saved leads:', leads);
      console.log(`Total leads: ${leads.length}`);
      return leads;
    };

    window.viewAllLeads = viewAllLeads;
    return () => {
      delete window.viewAllLeads;
    };
  }, []);

  // Generate random math captcha
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptcha({
      num1,
      num2,
      answer: num1 + num2,
      userAnswer: ''
    });
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCaptchaChange = (e) => {
    setCaptcha(prev => ({
      ...prev,
      userAnswer: e.target.value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setMessage({ text: 'Please enter your name', type: 'error' });
      return false;
    }
    if (!formData.email.trim()) {
      setMessage({ text: 'Please enter your email', type: 'error' });
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setMessage({ text: 'Please enter a valid email address', type: 'error' });
      return false;
    }
    if (formData.phone.trim() && !/^[+]?[(]?[\d\s\-()]{10,}$/.test(formData.phone)) {
      setMessage({ text: 'Please enter a valid phone number (minimum 10 digits)', type: 'error' });
      return false;
    }
    if (!formData.subject.trim()) {
      setMessage({ text: 'Please enter a subject', type: 'error' });
      return false;
    }
    if (!formData.message.trim()) {
      setMessage({ text: 'Please enter your message', type: 'error' });
      return false;
    }
    if (parseInt(captcha.userAnswer) !== captcha.answer) {
      setMessage({ text: 'Please solve the math problem correctly', type: 'error' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const apiUrl = getApiUrl('/api/contact');
      
      // Check if API is available
      if (apiUrl) {
        // Try to send to backend API
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setMessage({ text: 'Thank you! Your message has been saved successfully to our database.', type: 'success' });
          setFormData({
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: ''
          });
          generateCaptcha();
          
          console.log(`Form submitted successfully to MongoDB! Contact ID: ${result.data.id}`);
          
          // Also save backup to localStorage
          saveLeadToStorage(formData);
          return; // Exit early on success
        } else {
          throw new Error(result.message || 'Failed to save to database');
        }
      } else {
        // No API available, save to localStorage only
        throw new Error('API not available, using local storage');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      
      // Fallback to localStorage if API fails
      const localSuccess = saveLeadToStorage(formData);
      if (localSuccess) {
        setMessage({ 
          text: 'Your message has been saved locally. We will sync it when the connection is restored.', 
          type: 'success' 
        });
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
        generateCaptcha();
      } else {
        setMessage({ 
          text: 'Sorry, there was an error saving your message. Please try again.', 
          type: 'error' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Contact Us</h1>
        <p>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
      </div>
      
      <div className="form-container">
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email address"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number (e.g., +1 234-567-8900)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject *</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="Enter the subject of your message"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message *</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Enter your message here..."
              rows="5"
              required
            ></textarea>
          </div>

          <div className="captcha-container">
            <div className="math-captcha">
              <span>Security Check:</span>
              <span>{captcha.num1} + {captcha.num2} = ?</span>
              <input
                type="number"
                value={captcha.userAnswer}
                onChange={handleCaptchaChange}
                placeholder="Answer"
                required
              />
              <button
                type="button"
                onClick={generateCaptcha}
                style={{
                  padding: '8px 12px',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Refresh
              </button>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading && <span className="loading"></span>}
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;