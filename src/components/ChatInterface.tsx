import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  transcription: string;
  onSendMessage: (message: string) => Promise<string>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export default function ChatInterface({ transcription, onSendMessage, messages, setMessages }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    console.log('Sending request to ChatGPT:', {
      transcription,
      message: input,
      conversation: messages.map(m => `${m.role}: ${m.content}`).join('\n')
    });

    const assistantResponse = await onSendMessage(input);
    const assistantMessage: Message = { role: 'assistant', content: assistantResponse };
    setMessages(prev => [...prev, assistantMessage]);
  };

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold mb-4">Chat with AI about this video</h2>
      <div className="bg-gray-800 rounded-lg p-4 mb-4 h-64 overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-2 ${
              message.role === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block p-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-200'
              }`}
            >
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({node, ...props}) => <p className="mb-1" {...props} />,
                  a: ({node, ...props}) => <a className="text-blue-300 hover:underline" {...props} />,
                  code: ({node, inline, ...props}) => 
                    inline 
                      ? <code className="bg-gray-800 px-1 rounded" {...props} />
                      : <code className="block bg-gray-800 p-2 rounded my-1" {...props} />
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about the transcription"
          className="flex-grow px-4 py-2 bg-input-background border border-input-border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Send
        </button>
      </form>
    </div>
  );
}
