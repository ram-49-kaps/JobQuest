import React from 'react';
import Chatbot from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';
import api from '../api';

const config = {
  botName: 'JobBot',
  initialMessages: [{ id: 1, message: 'Hi! Tell me what kind of job you’re looking for (e.g., "remote developer jobs in New York").', createdBy: 'bot' }],
  customStyles: {
    botMessageBox: { backgroundColor: '#249885' },
    chatButton: { backgroundColor: '#176759' },
  },
};

const MessageParser = ({ children, actions }) => {
  const parse = (message) => {
    actions.handleJobSearch(message);
  };
  return <div>{React.Children.map(children, (child) => React.cloneElement(child, { parse }))}</div>;
};

const ActionProvider = ({ createChatBotMessage, setState, children }) => {
  const handleJobSearch = async (message) => {
    const searchingMessage = createChatBotMessage('Looking for jobs...');
    setState((prev) => ({ ...prev, messages: [...prev.messages, searchingMessage] }));

    try {
      const response = await api.get('/jobs/ai-search', { params: { query: message } });
      const jobs = response.data.jobs;

      if (jobs.length === 0) {
        const noResultsMessage = createChatBotMessage('Sorry, I couldn’t find any jobs matching that. Try something else!');
        setState((prev) => ({ ...prev, messages: [...prev.messages, noResultsMessage] }));
      } else {
        const jobList = jobs.slice(0, 3).map((job) => `${job.title} at ${job.company} (${job.location})`).join('\n');
        const resultsMessage = createChatBotMessage(`Found ${jobs.length} jobs! Here are a few:\n${jobList}\nWant more details?`);
        setState((prev) => ({ ...prev, messages: [...prev.messages, resultsMessage] }));
      }
    } catch (error) {
      const errorMessage = createChatBotMessage('Oops, something went wrong. Try again!');
      setState((prev) => ({ ...prev, messages: [...prev.messages, errorMessage] }));
    }
  };

  return <div>{React.Children.map(children, (child) => React.cloneElement(child, { actions: { handleJobSearch } }))}</div>;
};

const JobSearchBot = () => {
  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Job Search Bot</h2>
      <Chatbot
        config={config}
        messageParser={MessageParser}
        actionProvider={ActionProvider}
      />
    </div>
  );
};

export default JobSearchBot;