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
            const result = await login.mutateAsync({ username, password });
            
            if (result.token) {
                authLogin(result.token);
                router.push('/profile');
                onSuccess?.();
            } else {
                setErrorMessage('Invalid login response');
            }
        } catch (error: any) {
            setErrorMessage(
                error.message || 
                'Unable to login. Please check your credentials and try again.'
            );
        }
    };

    return (
        <>
            {(errorMessage || login.error) && (
                <div className="mb-6 bg-[#2C2C2C] p-4 rounded-lg border border-red-500/20">
                    <p className="text-red-400 text-sm">
                        {errorMessage || 
                         (login.error instanceof Error ? login.error.message : 'An error occurred')}
                    </p>
                </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username" className="block text-sm text-[#9B9B9B] mb-2">
                        Username
                    </label>
                    <input
                        id="username"
                        type="text"
                        required
                        className="w-full px-3 py-2.5 bg-[#1E1E1E] rounded-lg text-white placeholder-[#6B6B6B] outline-none transition-colors duration-200 focus:ring-1 focus:ring-white/10"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm text-[#9B9B9B] mb-2">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        required
                        className="w-full px-3 py-2.5 bg-[#1E1E1E] rounded-lg text-white placeholder-[#6B6B6B] outline-none transition-colors duration-200 focus:ring-1 focus:ring-white/10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    disabled={login.isPending}
                    className="w-full bg-[#2C2C2C] hover:bg-[#3C3C3C] text-white py-2.5 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
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

