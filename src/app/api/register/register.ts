import {useMutation} from "@tanstack/react-query";
import {api} from "@/app/api/api";

export const useRegister = () => {
    return useMutation({
        mutationFn: async (userData: {
            first_name: string,
            last_name: string,
            username: string,
            email: string,
            password: string,
        }) => {
            const response = await api.post('/register', userData);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        },
        onError: (error) => {
            console.error('Registration error:', error);
        },
        onSuccess: () => {
            window.location.href = '/profile';
        },
    });
}



