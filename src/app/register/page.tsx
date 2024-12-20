'use client';
import { useState } from 'react';
import { useRegister } from '../api/register/register';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        password: '',
    });
    const register = useRegister();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        register.mutate(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0E0B18] bg-gradient-to-br from-[#0E0B18] via-[#1a1527] to-[#261d37] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full backdrop-blur-sm bg-[#1a1527]/50 p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-[#261d37]">
                <div className="mb-10">
                    <h2 className="text-center text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        Join Us
                    </h2>
                    <p className="mt-3 text-center text-gray-400 text-sm">
                        Create your account to get started
                    </p>
                </div>
                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            name="first_name"
                            type="text"
                            required
                            placeholder="First Name"
                            className="w-full px-4 py-3 rounded-lg bg-[#261d37]/50 border border-[#382b4e] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 outline-none text-gray-200 placeholder-gray-400"
                            value={formData.first_name}
                            onChange={handleChange}
                        />
                        <input
                            name="last_name"
                            type="text"
                            required
                            placeholder="Last Name"
                            className="w-full px-4 py-3 rounded-lg bg-[#261d37]/50 border border-[#382b4e] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 outline-none text-gray-200 placeholder-gray-400"
                            value={formData.last_name}
                            onChange={handleChange}
                        />
                    </div>
                    <input
                        name="username"
                        type="text"
                        required
                        placeholder="Username"
                        className="w-full px-4 py-3 rounded-lg bg-[#261d37]/50 border border-[#382b4e] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 outline-none text-gray-200 placeholder-gray-400"
                        value={formData.username}
                        onChange={handleChange}
                    />
                    <input
                        name="email"
                        type="email"
                        required
                        placeholder="Email address"
                        className="w-full px-4 py-3 rounded-lg bg-[#261d37]/50 border border-[#382b4e] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 outline-none text-gray-200 placeholder-gray-400"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <input
                        name="password"
                        type="password"
                        required
                        placeholder="Password"
                        className="w-full px-4 py-3 rounded-lg bg-[#261d37]/50 border border-[#382b4e] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 outline-none text-gray-200 placeholder-gray-400"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                        disabled={register.isPending}
                    >
                        {register.isPending ? (
                            <div className="flex items-center justify-center">
                                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                                Creating Account...
                            </div>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>
                {register.isError && (
                    <div className="mt-6 bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg">
                        <p className="text-red-400 text-sm font-medium">
                            Registration failed. Please try again.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}