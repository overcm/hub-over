export interface SavedFile {
  fileUrl: string;
  fileSizeBytes: number;
}

export interface StorageProvider {
  name: string;
  save(params: { buffer: Buffer; fileName: string; folder: string }): Promise<SavedFile>;
  delete(fileUrl: string): Promise<void>;
}
