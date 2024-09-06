interface VideoPreviewProps {
  url: string;
}

export default function VideoPreview({ url }: VideoPreviewProps) {
  const videoId = new URL(url).searchParams.get('v');

  if (!videoId) {
    return <div>Invalid YouTube URL</div>;
  }

  return (
    <div className="mb-6 aspect-w-16 aspect-h-9 relative">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute top-0 left-0 w-full h-full rounded-md"
      ></iframe>
    </div>
  );
}
