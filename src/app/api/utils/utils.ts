import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { api } from "@/app/api/api"
import { useQuery } from "@tanstack/react-query"
import { id } from 'postcss-selector-parser';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface City {
  id: number;
  name: string;
}

interface Hobby {
  name: string;
}

interface School {
  id: number;
  name: string;
}

export const getCities = async (): Promise<City[]> => {
  const response = await api.get('/api/utils/cities');
  return response.data;
};

export const getHobbies = async (): Promise<Hobby[]> => {
  const response = await api.get('/api/utils/hobbies');
  return response.data;
};

export const getSchools = async (): Promise<School[]> => {
  const response = await api.get('/api/utils/schools');
  return response.data;
};

// React Query hooks
export const useGetCities = () => {
  return useQuery({
    queryKey: ['cities'],
    queryFn: getCities,
  });
};

export const useGetHobbies = () => {
  return useQuery({
    queryKey: ['hobbies'],
    queryFn: getHobbies,
  });
};

export const useGetSchools = () => {
  return useQuery({
    queryKey: ['schools'],
    queryFn: getSchools,
  });
};