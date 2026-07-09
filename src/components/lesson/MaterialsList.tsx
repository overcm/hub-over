interface Material {
  id: string;
  title: string;
  fileUrl: string | null;
  content: string | null;
}

export function MaterialsList({ materials }: { materials: Material[] }) {
  if (materials.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum material complementar para esta aula.</p>;
  }

  return (
    <ul className="space-y-3">
      {materials.map((material) => (
        <li key={material.id}>
          {material.fileUrl ? (
            <a
              href={material.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              {material.title}
            </a>
          ) : (
            <div className="rounded-md border p-3">
              <p className="text-sm font-medium">{material.title}</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{material.content}</p>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
