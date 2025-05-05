import api from './auth';
import { CompanyProfile, CompanyProfileCreate, CompanyProfileUpdate } from '@/types/profile';

// Get user profile
export const getUserProfile = async (): Promise<CompanyProfile> => {
  const response = await api.get('/api/profile');
  return response.data;
};

// Create user profile
export const createUserProfile = async (profileData: CompanyProfileCreate): Promise<CompanyProfile> => {
  const response = await api.post('/api/profile', profileData);
  return response.data;
};

// Update user profile
export const updateUserProfile = async (profileData: CompanyProfileUpdate): Promise<CompanyProfile> => {
  const response = await api.put('/api/profile', profileData);
  return response.data;
};
