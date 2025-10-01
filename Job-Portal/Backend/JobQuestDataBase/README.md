# JobQuest AI Chatbot Integration

## Overview
This integration adds an AI-powered chatbot to the JobQuest platform to assist users with job searching, resume writing, and interview preparation.

## Setup Instructions

1. Add the following environment variables to your `.env` file:
```
OPENAI_API_KEY=your_openai_api_key_here
```

2. Install the required dependencies:
```bash
npm install openai
```

3. The chatbot integration includes:
- Backend API routes for chat functionality
- Chat message storage in MongoDB
- Real-time AI responses using OpenAI's GPT-3.5
- Frontend chat widget component

## Features
- Real-time chat interface
- Persistent chat history
- Responsive design
- Authentication integration
- Message loading states
- Clear chat history option

## API Endpoints

### GET /api/chat/history
Retrieve chat history for the authenticated user

### POST /api/chat/message
Send a message and receive AI response

### DELETE /api/chat/clear
Clear chat history for the authenticated user

## Security
- All chat routes are protected with authentication
- API keys are stored securely in environment variables
- User data is associated with authenticated sessions