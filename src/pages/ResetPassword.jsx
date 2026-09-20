import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useState } from 'react';
import {useNavigate} from "react-router-dom";

export default function ResetPassword() {

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            const response = await api.post('/auth/reset-password', {
                token,
                newPassword,
                confirmNewPassword
            });
            setMessage('Password reset successfully.');
            navigate('/');
        } catch (err) {
            setError('Failed to reset password.');
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs px-4">
              <div className="relative w-full max-w-md overflow-hidden bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xl">
                    <div className="flex flex-col justify-center p-6 sm:p-8">
                      <h2 className="text-2xl font-bold text-slate-900">Reset Password</h2>
        
                      <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
                        Enter your new password below to reset your account password.
                      </p>
        
                      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                        <input
                          type="password"
                          placeholder="Enter your new password"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 sm:py-3 text-sm text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition"
                          onChange={(e) => setNewPassword(e.target.value)}
                        />

                        <input
                            type="password"
                            placeholder="Confirm your new password"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 sm:py-3 text-sm text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition"
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                        />
        
                        <button
                          type="submit"
                          className="w-full rounded-xl bg-teal-600 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-teal-700 shadow-xs"
                        >
                          Reset Password
                        </button>
                        {error && <p className="mt-2 text-xs font-medium text-rose-600">{error}</p>}
                        {message && <p className="mt-2 text-xs font-medium text-emerald-600">{message}</p>}
                      </form>
                    </div>
              </div>
            </div>
    );
}