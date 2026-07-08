interface Material {
  id: string;
  title: string;
  fileUrl: string;
}

export function MaterialsList({ materials }: { materials: Material[] }) {
  if (materials.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum material complementar para esta aula.</p>;
  }

  return (
    <ul className="space-y-2">
      {materials.map((material) => (
        <li key={material.id}>
          <a
            href={material.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            {material.title}
          </a>
        </li>
      ))}
    </ul>
  );
}
