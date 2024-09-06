import { useState, useEffect } from 'react';

interface ErrorPanelProps {
  message: string;
  onClose: () => void;
}

export default function ErrorPanel({ message, onClose }: ErrorPanelProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-md shadow-lg z-50">
      <p>{message}</p>
      <button
        onClick={() => {
          setIsVisible(false);
          onClose();
        }}
        className="absolute top-1 right-2 text-white hover:text-gray-200"
      >
        ×
      </button>
    </div>
  );
}
