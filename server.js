const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const axios = require('axios');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meeting-summarizer', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// MongoDB Schema
const summarySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  originalText: { type: String, required: true },
  customPrompt: { type: String },
  generatedSummary: { type: String, required: true },
  editedSummary: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Summary = mongoose.model('Summary', summarySchema);

// Free AI Summarization using Hugging Face
async function generateSummaryWithFreeAI(text, customPrompt) {
  try {
    // Option 1: Hugging Face Inference API (Free tier available)
    if (process.env.HUGGINGFACE_API_KEY) {
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
        {
          inputs: `${customPrompt || 'Summarize this meeting transcript:'}\n\n${text}`,
          parameters: {
            max_length: 500,
            min_length: 100,
            do_sample: false
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data && response.data[0] && response.data[0].summary_text) {
        return response.data[0].summary_text;
      }
    }

    // Option 2: Simple rule-based summarization (100% free, no API needed)
    return generateSimpleSummary(text, customPrompt);

  } catch (error) {
    console.log('Free AI service failed, using simple summarization:', error.message);
    return generateSimpleSummary(text, customPrompt);
  }
}

// Simple rule-based summarization (100% free, no API needed)
function generateSimpleSummary(text, customPrompt) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const words = text.toLowerCase().split(/\s+/);
  
  // Count word frequency
  const wordCount = {};
  words.forEach(word => {
    const cleanWord = word.replace(/[^\w]/g, '');
    if (cleanWord.length > 3) {
      wordCount[cleanWord] = (wordCount[cleanWord] || 0) + 1;
    }
  });
  
  // Get top keywords
  const keywords = Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
  
  // Extract key sentences (containing keywords)
  const keySentences = sentences
    .filter(sentence => 
      keywords.some(keyword => 
        sentence.toLowerCase().includes(keyword)
      )
    )
    .slice(0, 5);
  
  // Create summary based on custom prompt
  let summary = '';
  if (customPrompt && customPrompt.toLowerCase().includes('bullet')) {
    summary = keySentences.map(s => `• ${s.trim()}`).join('\n');
  } else if (customPrompt && customPrompt.toLowerCase().includes('action')) {
    const actionWords = ['will', 'going to', 'plan to', 'need to', 'should', 'must'];
    const actionSentences = sentences.filter(s => 
      actionWords.some(word => s.toLowerCase().includes(word))
    );
    summary = actionSentences.map(s => `• ${s.trim()}`).join('\n');
  } else {
    summary = keySentences.join(' ');
  }
  
  return summary || 'Summary: ' + sentences.slice(0, 3).join(' ');
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/plain' || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only text and PDF files are allowed'));
    }
  },
});

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AI Meeting Summarizer MERN API is running (FREE AI)' });
});

// Generate summary from text
app.post('/api/summarize', async (req, res) => {
  try {
    const { text, customPrompt } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const summary = await generateSummaryWithFreeAI(text, customPrompt);

    // Save to MongoDB
    const id = uuidv4();
    const newSummary = new Summary({
      id,
      originalText: text,
      customPrompt,
      generatedSummary: summary
    });

    await newSummary.save();

    res.json({
      id,
      summary,
      message: 'Summary generated successfully (using free AI)'
    });

  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'Failed to generate summary', details: error.message });
  }
});

// Update edited summary
app.put('/api/summaries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { editedSummary } = req.body;

    if (!editedSummary) {
      return res.status(400).json({ error: 'Edited summary is required' });
    }

    const updatedSummary = await Summary.findOneAndUpdate(
      { id },
      { editedSummary },
      { new: true }
    );

    if (!updatedSummary) {
      return res.status(404).json({ error: 'Summary not found' });
    }

    res.json({ message: 'Summary updated successfully' });

  } catch (error) {
    console.error('Error updating summary:', error);
    res.status(500).json({ error: 'Failed to update summary' });
  }
});

// Get summary by ID
app.get('/api/summaries/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const summary = await Summary.findOne({ id });

    if (!summary) {
      return res.status(404).json({ error: 'Summary not found' });
    }

    res.json(summary);

  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get all summaries
app.get('/api/summaries', async (req, res) => {
  try {
    const summaries = await Summary.find().sort({ createdAt: -1 });
    res.json(summaries);
  } catch (error) {
    console.error('Error fetching summaries:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Send summary via email
app.post('/api/send-email', async (req, res) => {
  try {
    const { recipientEmails, subject, summary, summaryId } = req.body;

    if (!recipientEmails || !Array.isArray(recipientEmails) || recipientEmails.length === 0) {
      return res.status(400).json({ error: 'Recipient emails are required' });
    }

    if (!summary) {
      return res.status(400).json({ error: 'Summary content is required' });
    }

    // Create transporter (using Gmail as example)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const emailSubject = subject || 'Meeting Summary Shared with You';
    const emailContent = `
      <h2>Meeting Summary</h2>
      <p>A meeting summary has been shared with you:</p>
      <hr>
      <div style="white-space: pre-wrap;">${summary}</div>
      <hr>
      <p>This summary was generated using AI Meeting Summarizer (Free AI).</p>
    `;

    // Send email to all recipients
    const emailPromises = recipientEmails.map(email => 
      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: emailSubject,
        html: emailContent,
      })
    );

    await Promise.all(emailPromises);

    res.json({ message: 'Emails sent successfully' });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`MERN Server running on port ${PORT} (FREE AI)`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
