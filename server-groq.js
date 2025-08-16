const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const { Groq } = require('groq');
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

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

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
  res.json({ status: 'OK', message: 'AI Meeting Summarizer MERN API is running' });
});

// Generate summary from text
app.post('/api/summarize', async (req, res) => {
  try {
    const { text, customPrompt } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const prompt = customPrompt || 'Please provide a comprehensive summary of this meeting transcript.';

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert meeting summarizer. Create clear, structured summaries based on the user\'s instructions.'
        },
        {
          role: 'user',
          content: `${prompt}\n\nMeeting transcript:\n${text}`
        }
      ],
      model: 'llama3-8b-8192',
      temperature: 0.3,
      max_tokens: 2000,
    });

    const summary = completion.choices[0]?.message?.content || 'Unable to generate summary';

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
      message: 'Summary generated successfully'
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
    const transporter = nodemailer.createTransporter({
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
      <p>This summary was generated using AI Meeting Summarizer.</p>
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
  console.log(`MERN Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

