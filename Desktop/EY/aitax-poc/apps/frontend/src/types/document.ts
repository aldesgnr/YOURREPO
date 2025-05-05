export enum DocumentType {
  PDF = "pdf",
  TXT = "txt"
}

export interface DocumentBase {
  title: string;
  description?: string;
  file_path: string;
  file_type: DocumentType;
  file_size: number;
  user_id: number;
}

export interface Document extends DocumentBase {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentUpload {
  title: string;
  description?: string;
  file: File;
}
