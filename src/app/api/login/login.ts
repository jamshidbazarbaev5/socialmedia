import { useMutation } from "@tanstack/react-query";
import { api } from "@/app/api/api";
import {jwtDecode} from 'jwt-decode';

interface LoginData {
    username: string;
    password: string;
}

interface LoginResponse {
    access: string;
    refresh: string;
}

export const useLogin = () => {
    return useMutation({
        mutationFn: async (userData: LoginData) => {
            try {
                const response = await api.post<LoginResponse>('/auth/token/', {
                    username: userData.username,
                    password: userData.password
                });

                console.log('Login response:', response.data);

                if (response.data.access) {
                    const token = response.data.access;
                    localStorage.setItem('token', token);
                    localStorage.setItem('refresh_token', response.data.refresh);
                    
                    // Decode the JWT token to get user info
                    const decoded = jwtDecode(token);
                    
                    return {
                        success: true,
                        token: token,
                        refresh: response.data.refresh,
                        user: decoded
                    };
                } else {
                    throw new Error('Invalid login response');
                }
            } catch (error: any) {
                if (error.response) {
                    const errorMessage = error.response.data?.detail
                        || error.response.data?.message
                        || error.response.data?.error 
                        || 'Server error occurred';
                    console.error('Server error response:', error.response.data);
                    throw new Error(errorMessage);
                } else if (error.request) {
                    console.error('No response received:', error.request);
                    throw new Error('No response from server. Please check your connection.');
                } else {
                    console.error('Login error:', error);
                    throw new Error(error.message || 'An unexpected error occurred');
                }
            }
        }
    });
};