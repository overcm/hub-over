function config() {
  const zone = process.env.BUNNY_STORAGE_ZONE_NAME;
  const password = process.env.BUNNY_STORAGE_PASSWORD;
  const endpoint = process.env.BUNNY_STORAGE_ENDPOINT ?? "https://br.storage.bunnycdn.com";
  if (!zone || !password) throw new Error("Bunny Storage não configurado");
  return { zone, password, endpoint };
}

export async function bunnyPut(path: string, buffer: Buffer): Promise<void> {
  const { zone, password, endpoint } = config();
  const res = await fetch(`${endpoint}/${zone}/${path}`, {
    method: "PUT",
    headers: { AccessKey: password, "Content-Type": "application/octet-stream" },
    body: buffer,
  });
  if (!res.ok) {
    throw new Error(`Falha ao enviar arquivo para o Bunny Storage: ${await res.text()}`);
  }
}

export async function bunnyGet(path: string): Promise<Buffer | null> {
  const { zone, password, endpoint } = config();
  const res = await fetch(`${endpoint}/${zone}/${path}`, {
    headers: { AccessKey: password },
  });
  if (!res.ok) return null;
  return Buffer.from(await res.arrayBuffer());
}

export async function bunnyDelete(path: string): Promise<void> {
  const { zone, password, endpoint } = config();
  await fetch(`${endpoint}/${zone}/${path}`, {
    method: "DELETE",
    headers: { AccessKey: password },
  }).catch(() => {});
}
