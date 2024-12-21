'use client';
import { useRouter } from 'next/navigation';
import LoginForm from '@/app/components/auth/LoginForm';

export default function LoginPage() {
    const router = useRouter();

    const handleLoginSuccess = () => {
        router.push('/profile');
    };

    return (
        <div className="min-h-screen flex bg-black">
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-[400px] bg-black/80 rounded-lg p-8">
                    <div className="mb-8">
                        <h2 className="text-center text-3xl font-medium text-white">
                            Sign in
                        </h2>
                        <p className="mt-2 text-center text-[#9B9B9B] text-sm">
                            Or{' '}
                            <a href="/register" className="text-white hover:text-gray-300 transition-colors duration-200">
                                create a new account
                            </a>
                        </p>
                    </div>
                    
                    <LoginForm onSuccess={handleLoginSuccess} />
                </div>
            </div>
        </div>
    );
}

