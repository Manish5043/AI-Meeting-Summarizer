import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [text, setText] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [summary, setSummary] = useState('');
  const [editedSummary, setEditedSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [recipientEmails, setRecipientEmails] = useState([]);
  const [emailSubject, setEmailSubject] = useState('Meeting Summary Shared with You');
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleGenerateSummary = async () => {
    if (!text.trim()) {
      setError('Please enter some text to summarize');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/summarize`, {
        text: text.trim(),
        customPrompt: customPrompt.trim() || undefined
      });

      setSummary(response.data.summary);
      setEditedSummary(response.data.summary);
      setSuccess('Summary generated successfully!');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdits = async () => {
    if (!editedSummary.trim()) {
      setError('Please enter a summary to save');
      return;
    }

    setError('');
    setSuccess('');

    try {
      await axios.put(`${API_BASE_URL}/api/summaries/${summary.id}`, {
        editedSummary: editedSummary.trim()
      });

      setSuccess('Summary updated successfully!');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update summary');
    }
  };

  const handleAddEmail = () => {
    const email = emailInput.trim();
    if (email && !recipientEmails.includes(email)) {
      setRecipientEmails([...recipientEmails, email]);
      setEmailInput('');
    }
  };

  const handleRemoveEmail = (emailToRemove) => {
    setRecipientEmails(recipientEmails.filter(email => email !== emailToRemove));
  };

  const handleSendEmail = async () => {
    if (recipientEmails.length === 0) {
      setError('Please add at least one recipient email');
      return;
    }

    if (!editedSummary.trim()) {
      setError('Please generate and edit a summary before sending');
      return;
    }

    setSendingEmail(true);
    setError('');
    setSuccess('');

    try {
      await axios.post(`${API_BASE_URL}/api/send-email`, {
        recipientEmails,
        subject: emailSubject,
        summary: editedSummary.trim()
      });

      setSuccess('Emails sent successfully!');
      setRecipientEmails([]);
      setEmailSubject('Meeting Summary Shared with You');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to send emails');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddEmail();
    }
  };

  return (
    <div className="App">
      <div className="container">
        <div className="header">
          <h1>AI Meeting Summarizer</h1>
          <p>Powered by MERN Stack & Hugging Face AI</p>
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <div className="form-section">
          <h2>Input Meeting Transcript</h2>
          <div className="form-group">
            <label htmlFor="text">Meeting Transcript:</label>
            <textarea
              id="text"
              className="form-control"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your meeting transcript, call recording, or notes here..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="customPrompt">Custom Instructions (Optional):</label>
            <textarea
              id="customPrompt"
              className="form-control"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g., 'Summarize in bullet points for executives' or 'Highlight only action items'"
            />
          </div>

          <button
            className="btn"
            onClick={handleGenerateSummary}
            disabled={loading || !text.trim()}
          >
            {loading ? 'Generating Summary...' : 'Generate Summary'}
          </button>
        </div>

        {summary && (
          <div className="summary-section">
            <h2>Generated Summary</h2>
            <div className="summary-content">{summary}</div>
            
            <h3>Edit Summary</h3>
            <div className="form-group">
              <textarea
                className="form-control"
                value={editedSummary}
                onChange={(e) => setEditedSummary(e.target.value)}
                placeholder="Edit the summary as needed..."
              />
            </div>
            
            <button
              className="btn btn-secondary"
              onClick={handleSaveEdits}
              disabled={!editedSummary.trim()}
            >
              Save Edits
            </button>
          </div>
        )}

        {editedSummary && (
          <div className="email-section">
            <h2>Share Summary via Email</h2>
            
            <div className="form-group">
              <label htmlFor="emailSubject">Email Subject:</label>
              <input
                id="emailSubject"
                type="text"
                className="form-control"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Recipient Emails:</label>
              <div className="email-input">
                <input
                  type="email"
                  className="form-control"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter email address"
                />
                <button className="btn" onClick={handleAddEmail}>
                  Add Email
                </button>
              </div>
              
              {recipientEmails.length > 0 && (
                <div className="email-list">
                  {recipientEmails.map((email, index) => (
                    <div key={index} className="email-tag">
                      {email}
                      <button onClick={() => handleRemoveEmail(email)}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              className="btn"
              onClick={handleSendEmail}
              disabled={sendingEmail || recipientEmails.length === 0}
            >
              {sendingEmail ? 'Sending...' : 'Send Summary'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

