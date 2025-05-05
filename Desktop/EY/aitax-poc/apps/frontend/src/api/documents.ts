import api from './auth';
import { Document, DocumentUpload } from '@/types/document';

// Get all documents
export const getAllDocuments = async (): Promise<Document[]> => {
  const response = await api.get('/api/documents');
  return response.data;
};

// Get a specific document by ID
export const getDocumentById = async (documentId: number): Promise<Document> => {
  const response = await api.get(`/api/documents/${documentId}`);
  return response.data;
};

// Upload a new document
export const uploadDocument = async (documentData: DocumentUpload): Promise<Document> => {
  const formData = new FormData();
  formData.append('title', documentData.title);
  
  if (documentData.description) {
    formData.append('description', documentData.description);
  }
  
  formData.append('file', documentData.file);
  
  const response = await api.post('/api/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Update document metadata
export const updateDocument = async (documentId: number, title: string, description?: string): Promise<Document> => {
  const response = await api.put(`/api/documents/${documentId}`, { 
    title, 
    description 
  });
  
  return response.data;
};

// Delete a document
export const deleteDocument = async (documentId: number): Promise<void> => {
  await api.delete(`/api/documents/${documentId}`);
};
