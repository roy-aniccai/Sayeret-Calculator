import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../src/firebase';

interface AdminLoginProps {
    onClose: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setError('');
        } catch (err) {
            console.error('Login failed', err);
            setError('Failed to login. Check your credentials.');
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center p-4" dir="ltr">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
                <div className="text-center mb-6">
                    <i className="fa-brands fa-google text-5xl text-blue-600 mb-4"></i>
                    <h1 className="text-2xl font-bold text-gray-800">Admin Login</h1>
                    <p className="text-gray-500">Sign in with your Mortgage App account</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="name@company.com"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="••••••••"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition"
                    >
                        Sign In
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full text-gray-500 text-sm hover:text-gray-700 mt-2"
                    >
                        Back to App
                    </button>
                </form>
            </div>
        </div>
    );
};
