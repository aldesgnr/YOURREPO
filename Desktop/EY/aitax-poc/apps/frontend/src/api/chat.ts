import api from './auth';
import { ChatMessage, ChatMessageCreate } from '@/types/chat';

// Get chat history for a document
export const getChatHistory = async (documentId: number): Promise<ChatMessage[]> => {
  const response = await api.get(`/api/chat/document/${documentId}`);
  return response.data;
};

// Ask a question about a document
export const askQuestion = async (documentId: number, question: string): Promise<ChatMessage> => {
  const messageData: ChatMessageCreate = {
    content: question,
    role: 'user',
    document_id: documentId,
  };
  
  const response = await api.post(`/api/chat/document/${documentId}`, messageData);
  return response.data;
};
