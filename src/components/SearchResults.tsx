interface Segment {
  id: number;
  start: number;
  end: number;
  text: string;
}

interface SearchResultsProps {
  results: Segment[];
  youtubeUrl: string;
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default function SearchResults({ results, youtubeUrl }: SearchResultsProps) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Search Results</h2>
      {results.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <ul className="space-y-4">
          {results.map((result) => (
            <li key={result.id} className="border border-input-border rounded-md p-4">
              <p className="font-semibold">
                {formatTime(result.start)} - {formatTime(result.end)}
              </p>
              <p className="mb-2">{result.text}</p>
              <a
                href={`${youtubeUrl}&t=${Math.floor(result.start)}s`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Watch on YouTube
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
