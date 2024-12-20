'use client';
import { useRouter } from 'next/navigation';
import LoginForm from '@/app/components/auth/LoginForm';

export default function LoginPage() {
    const router = useRouter();

    const handleLoginSuccess = () => {
        router.push('/profile');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0E0B18] bg-gradient-to-br from-[#0E0B18] via-[#1a1527] to-[#261d37] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full backdrop-blur-sm bg-[#1a1527]/50 p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-[#261d37]">
                <div className="mb-10">
                    <h2 className="text-center text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        Sign in
                    </h2>
                    <p className="mt-3 text-center text-gray-400 text-sm">
                        Or{' '}
                        <a href="/register" className="text-purple-400 hover:text-purple-300 transition-colors duration-200">
                            create a new account
                        </a>
                    </p>
                </div>
                
                <LoginForm onSuccess={handleLoginSuccess} />

            </div>
        </div>
    );
}