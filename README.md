# AI Meeting Summarizer - MERN Stack

A full-stack AI-powered meeting notes summarizer and sharer built with the MERN stack (MongoDB, Express.js, React, Node.js) and powered by Hugging Face AI.

## Features

- **AI-Powered Summarization**: Upload meeting transcripts and get intelligent summaries using Groq AI
- **Custom Instructions**: Provide specific prompts like "Summarize in bullet points for executives" or "Highlight only action items"
- **Editable Summaries**: Edit and refine AI-generated summaries before sharing
- **Email Sharing**: Send summaries to multiple recipients via email
- **MongoDB Storage**: Persistent storage of all summaries and user data
- **Responsive Design**: Clean, modern UI that works on all devices


## Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **Hugging Face AI** - AI service for text summarization
- **Nodemailer** - Email sending functionality

### Frontend
- **React** - JavaScript library for building user interfaces
- **Axios** - HTTP client for API calls
- **CSS3** - Modern styling with responsive design

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Groq API key
- Gmail account for email functionality

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd AI-Meeting-Summarizer
```

### 2. Install backend dependencies
```bash
npm install
```

### 3. Install frontend dependencies
```bash
cd client
npm install
cd ..
```

### 4. Environment Setup
Create a `.env` file in the root directory:
```env
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/meeting-summarizer
# Or use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/meeting-summarizer

# Hugging Face API Key (Get from https://huggingface.co/settings/tokens)
HUGGINGFACE_API_KEY=your_huggingface_api_key_here

# Email Configuration (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here

# Server Configuration
PORT=5000
```

### 5. Start the application

**Option 1: Run both frontend and backend concurrently**
```bash
npm run dev:full
```

**Option 2: Run separately**
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
npm run client
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/summarize` - Generate AI summary
- `PUT /api/summaries/:id` - Update edited summary
- `GET /api/summaries/:id` - Get summary by ID
- `GET /api/summaries` - Get all summaries
- `POST /api/send-email` - Send summary via email

## Usage

1. **Input Meeting Transcript**: Paste or type your meeting transcript in the text area
2. **Custom Instructions**: (Optional) Provide specific instructions for the AI
3. **Generate Summary**: Click "Generate Summary" to get an AI-powered summary
4. **Edit Summary**: Modify the generated summary as needed
5. **Share via Email**: Add recipient emails and send the summary

## Deployment

### Backend Deployment (Railway/Heroku)

1. **Railway**:
   - Connect your GitHub repository
   - Set environment variables
   - Deploy automatically

2. **Heroku**:
   - Create a new Heroku app
   - Connect your repository
   - Set environment variables
   - Deploy

### Frontend Deployment (Vercel/Netlify)

1. **Vercel**:
   - Import your GitHub repository
   - Set build command: `cd client && npm run build`
   - Set output directory: `client/build`
   - Deploy

2. **Netlify**:
   - Connect your GitHub repository
   - Set build command: `cd client && npm run build`
   - Set publish directory: `client/build`
   - Deploy

### Environment Variables for Production

Make sure to set these environment variables in your deployment platform:
- `MONGODB_URI` - Your MongoDB connection string
- `GROQ_API_KEY` - Your Groq API key
- `EMAIL_USER` - Your Gmail address
- `EMAIL_PASS` - Your Gmail app password

## Database Schema

```javascript
{
  id: String,           // Unique identifier
  originalText: String, // Original meeting transcript
  customPrompt: String, // User's custom instructions
  generatedSummary: String, // AI-generated summary
  editedSummary: String,    // User-edited summary
  createdAt: Date       // Creation timestamp
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the GitHub repository.

## Acknowledgments

- Hugging Face for providing the AI summarization service
- MongoDB for the database solution
- The MERN stack community for excellent documentation and tools

