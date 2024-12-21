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
        <div className="min-h-screen flex bg-black">
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-[500px] bg-black/80 rounded-lg p-8">
                    <div className="mb-8">
                        <h2 className="text-center text-3xl font-medium text-white">
                            Create Account
                        </h2>
                        <p className="mt-2 text-center text-[#9B9B9B] text-sm">
                            Or{' '}
                            <a href="/login" className="text-white hover:text-gray-300 transition-colors duration-200">
                                sign in to your account
                            </a>
                        </p>
                    </div>
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="first_name" className="block text-sm text-[#9B9B9B] mb-2">
                                    First Name
                                </label>
                                <input
                                    id="first_name"
                                    name="first_name"
                                    type="text"
                                    required
                                    className="w-full px-3 py-2.5 bg-[#1E1E1E] rounded-lg text-white placeholder-[#6B6B6B] outline-none transition-colors duration-200 focus:ring-1 focus:ring-white/10"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="last_name" className="block text-sm text-[#9B9B9B] mb-2">
                                    Last Name
                                </label>
                                <input
                                    id="last_name"
                                    name="last_name"
                                    type="text"
                                    required
                                    className="w-full px-3 py-2.5 bg-[#1E1E1E] rounded-lg text-white placeholder-[#6B6B6B] outline-none transition-colors duration-200 focus:ring-1 focus:ring-white/10"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        
                        {/* Username, Email, Password fields */}
                        {['username', 'email', 'password'].map((field) => (
                            <div key={field}>
                                <label htmlFor={field} className="block text-sm text-[#9B9B9B] mb-2">
                                    {field.charAt(0).toUpperCase() + field.slice(1)}
                                </label>
                                <input
                                    id={field}
                                    name={field}
                                    type={field === 'password' ? 'password' : 'text'}
                                    required
                                    className="w-full px-3 py-2.5 bg-[#1E1E1E] rounded-lg text-white placeholder-[#6B6B6B] outline-none transition-colors duration-200 focus:ring-1 focus:ring-white/10"
                                    value={formData[field as keyof typeof formData]}
                                    onChange={handleChange}
                                />
                            </div>
                        ))}

                        <button
                            type="submit"
                            className="w-full bg-[#2C2C2C] hover:bg-[#3C3C3C] text-white py-2.5 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
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
                        <div className="mt-6 bg-[#2C2C2C] p-4 rounded-lg border border-red-500/20">
                            <p className="text-red-400 text-sm">
                                Registration failed. Please try again.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}