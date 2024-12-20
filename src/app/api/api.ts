import axios from 'axios';

// Create a function to ensure URL has trailing slash
// const addTrailingSlash = (url: string) => {
//     if (!url.endsWith('/') && !url.includes('.')) {
//         return `${url}/`;
//     }
//     return url;
// };

export const api = axios.create({
    baseURL: 'https://bondify.uz',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

api.interceptors.request.use(config => {
    // Add auth token
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Add trailing slash
    // if (config.url) {
    //     config.url = addTrailingSlash(config.url);
    // }
    
    // Log the request for debugging
    console.log('Making request to:', {
        url: config.url,
        method: config.method,
        data: config.data,
        headers: config.headers // Log headers to verify token is being sent
    });
    
    return config;
});

// Handle responses
// api.interceptors.response.use(
//     response => response,
//     error => {
//         if (error.response) {
//             console.error('API Error:', {
//                 url: error.config?.url,
//                 status: error.response?.status,
//                 data: error.response?.data,
//                 headers: error.config?.headers // Log headers to verify token was sent
//             });
//         } else if (error.request) {
//             console.error('No response received:', error.request);
//         } else {
//             console.error('Error setting up request:', error.message);
//         }
//         return Promise.reject(error);
//     }
// );



api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If the error is 401 and we haven't tried to refresh yet
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                const response = await axios.post('https://bondify.uz/auth/token/refresh/', {
                    refresh: refreshToken
                });

                const { access: newToken } = response.data;
                
                // Update token in localStorage
                localStorage.setItem('token', newToken);
                
                // Update the Authorization header
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                
                // Retry the original request
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails, logout the user
                localStorage.removeItem('token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);
