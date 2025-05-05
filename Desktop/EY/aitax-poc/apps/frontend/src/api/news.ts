import api from './auth';
import { News, PersonalizedNews } from '@/types/news';

// Get all news items
export const getAllNews = async (): Promise<News[]> => {
  const response = await api.get('/api/news');
  return response.data;
};

// Get a specific news item by ID
export const getNewsById = async (newsId: number): Promise<News> => {
  const response = await api.get(`/api/news/${newsId}`);
  return response.data;
};

// Get personalized summary for a news item
export const getPersonalizedNews = async (newsId: number): Promise<PersonalizedNews> => {
  const response = await api.get(`/api/news/${newsId}/personalized`);
  return response.data;
};
