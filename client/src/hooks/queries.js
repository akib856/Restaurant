import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api.js';
export const useSettings = () => useQuery({ queryKey: ['settings'], queryFn: () => api('/settings').then((r) => r.data) });
export const useCategories = () => useQuery({ queryKey: ['categories'], queryFn: () => api('/categories').then((r) => r.data) });
export const useMe = () => useQuery({ queryKey: ['me'], queryFn: () => api('/auth/me').then((r) => r.data), staleTime: 0 });
export const useMenu = (params) => useQuery({ queryKey: ['menu', params], queryFn: () => api('/menu?' + new URLSearchParams(params)).then((r) => r.data) });
