import { useState } from 'react';

interface YouTubeInputProps {
  onUrlSubmit: (url: string) => void;
  onTranscribe: () => void;
  isLoading: boolean;
  onError: (message: string) => void;
}

export default function YouTubeInput({ onUrlSubmit, onTranscribe, isLoading, onError }: YouTubeInputProps) {
  const [url, setUrl] = useState('');

  const isValidYouTubeUrl = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return youtubeRegex.test(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidYouTubeUrl(url)) {
      onError('Please enter a valid YouTube URL');
      return;
    }
    onUrlSubmit(url);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex items-center mb-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter YouTube URL"
          className="flex-grow px-4 py-2 bg-input-background border border-input-border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Set URL
        </button>
      </div>
      <button
        type="button"
        onClick={onTranscribe}
        disabled={isLoading}
        className={`px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isLoading ? 'Transcribing...' : 'Transcribe Video'}
      </button>
    </form>
  );
}
