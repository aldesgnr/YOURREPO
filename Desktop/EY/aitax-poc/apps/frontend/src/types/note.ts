export interface NoteBase {
  content: string;
  news_id?: number;
  document_id?: number;
}

export interface Note extends NoteBase {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export type NoteCreate = NoteBase;

export type NoteUpdate = {
  content: string;
};
