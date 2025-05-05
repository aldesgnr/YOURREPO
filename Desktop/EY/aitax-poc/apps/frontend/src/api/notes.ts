import api from './auth';
import { Note, NoteCreate } from '@/types/note';

// Get all notes
export const getAllNotes = async (newsId?: number, documentId?: number): Promise<Note[]> => {
  const params = new URLSearchParams();
  if (newsId) params.append('news_id', newsId.toString());
  if (documentId) params.append('document_id', documentId.toString());
  
  const response = await api.get(`/api/notes?${params.toString()}`);
  return response.data;
};

// Get a specific note by ID
export const getNoteById = async (noteId: number): Promise<Note> => {
  const response = await api.get(`/api/notes/${noteId}`);
  return response.data;
};

// Create a new note
export const createNote = async (noteData: NoteCreate): Promise<Note> => {
  const response = await api.post('/api/notes', noteData);
  return response.data;
};

// Update a note
export const updateNote = async (noteId: number, content: string): Promise<Note> => {
  const response = await api.put(`/api/notes/${noteId}`, { content });
  return response.data;
};

// Delete a note
export const deleteNote = async (noteId: number): Promise<void> => {
  await api.delete(`/api/notes/${noteId}`);
};
