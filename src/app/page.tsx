'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import YouTubeInput from '@/components/YouTubeInput';
import VideoPreview from '@/components/VideoPreview';
import ChatInterface from '@/components/ChatInterface';
import TranscriptionSearch from '@/components/TranscriptionSearch';
import SearchResults from '@/components/SearchResults';
import ErrorPanel from '@/components/ErrorPanel';

interface Segment {
  id: number;
  start: number;
  end: number;
  text: string;
}

interface Word {
  word: string;
  start: number;
  end: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [transcription, setTranscription] = useState('');
  const [segments, setSegments] = useState<Segment[]>([]);
  const [words, setWords] = useState<Word[]>([]); 
  const [searchResults, setSearchResults] = useState<Segment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleUrlSubmit = (url: string) => {
    setYoutubeUrl(url);
    setTranscription('');
    setSegments([]);
    setWords([]); 
    setSearchResults([]);
    setChatMessages([]); // Clear chat messages when a new URL is submitted
  };

  const handleError = (message: string) => {
    setError(message);
  };

  const clearError = () => {
    setError(null);
  };

  const handleTranscribe = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ youtubeUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to transcribe video');
      }

      const data = await response.json();
      console.log('Transcription data:', data);


      setTranscription(data.transcription);
      setSegments(data.segments.map((segment: any, index: number) => ({
        id: index,
        start: segment.start,
        end: segment.end,
        text: segment.text
      })));
      setWords(data.words);


    } catch (error) {
      console.error('Error:', error);
      alert('Failed to transcribe video. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    try {
      const requestBody = { 
        transcription, 
        message,
        conversation: chatMessages.map(m => `${m.role}: ${m.content}`).join('\n')
      };
      
      console.log('Sending request to ChatGPT:', requestBody);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error:', error);
      return 'Sorry, I encountered an error while processing your request.';
    }
  };

  const handleSearch = (keyword: string) => {
    if (!segments.length) {
      alert('Please transcribe the video first.');
      return;
    }

    const results = segments.filter(segment => 
      segment.text.toLowerCase().includes(keyword.toLowerCase())
    );


    setSearchResults(results);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow overflow-y-auto pt-16 pb-16">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <YouTubeInput 
            onUrlSubmit={handleUrlSubmit} 
            onTranscribe={handleTranscribe} 
            isLoading={isLoading}
            onError={handleError}
          />
          {youtubeUrl && <VideoPreview url={youtubeUrl} />}
          {transcription && (
            <div>
              <div className="flex border-b border-gray-200 mb-4">
                <button
                  className={`py-2 px-4 ${activeTab === 'chat' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('chat')}
                >
                  Chat
                </button>
                <button
                  className={`py-2 px-4 ${activeTab === 'search' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('search')}
                >
                  Search
                </button>
              </div>
              {activeTab === 'chat' ? (
                <ChatInterface 
                  transcription={transcription} 
                  onSendMessage={handleSendMessage}
                  messages={chatMessages}
                  setMessages={setChatMessages}
                />
              ) : (
                <div>
                  <TranscriptionSearch onSearch={handleSearch} />
                  <SearchResults results={searchResults} youtubeUrl={youtubeUrl} />
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
      {error && <ErrorPanel message={error} onClose={clearError} />}
    </div>
  );
}
