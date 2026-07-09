const URL_REGEX = /(https?:\/\/[^\s]+)/g;

export function Linkify({ text, className }: { text: string; className?: string }) {
  const parts = text.split(URL_REGEX);

  return (
    <p className={className}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:no-underline"
          >
            {part}
          </a>
        ) : (
          part
        ),
      )}
    </p>
  );
}
