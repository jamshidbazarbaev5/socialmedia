'use client';
import { useState } from 'react';
import { useLogin } from '@/app/api/login/login';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

interface LoginFormProps {
    onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const login = useLogin();
    const { login: authLogin } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        
        if (!username || !password) {
            setErrorMessage('Please enter both username and password');
            return;
        }

        try {
            console.log('Attempting login...', { username, password });
            const result = await login.mutateAsync({ username, password });
            console.log('Login result:', result);
            
            if (result.token) {
                console.log('Login successful');
                authLogin(result.token);
                router.push('/profile');
                onSuccess?.();
            } else {
                setErrorMessage('Invalid login response');
            }
        } catch (error: any) {
            console.error('Login error:', {
                message: error.message,
                error
            });
            setErrorMessage(
                error.message || 
                'Unable to login. Please check your credentials and try again.'
            );
        }
    };

    return (
        <>
            {(errorMessage || login.error) && (
                <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-lg">
                    <p className="text-red-600 text-sm">
                        {errorMessage || 
                         (login.error instanceof Error ? login.error.message : 'An error occurred')}
                    </p>
                </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                        Username
                    </label>
                    <input
                        id="username"
                        type="text"
                        required
                        className="w-full px-3 py-2 bg-[#261d37] border border-[#352a4d] rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 outline-none text-white"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        required
                        className="w-full px-3 py-2 bg-[#261d37] border border-[#352a4d] rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 outline-none text-white"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    disabled={login.isPending}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                >
                    {login.isPending ? (
                        <div className="flex items-center justify-center">
                            <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                            Signing in...
                        </div>
                    ) : (
                        'Sign in'
                    )}
                </button>
            </form>
        </>
    );
}