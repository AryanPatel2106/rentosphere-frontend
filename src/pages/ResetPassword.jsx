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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
              <div className="relative w-full max-w-3xl overflow-hidden bg-white shadow-2xl">
                    <div className="flex flex-col justify-center p-8 md:p-10">
                      <h2 className="text-3xl font-semibold text-gray-800">Reset Password</h2>
        
                      <p className="mt-2 text-sm text-gray-500">
                        Enter your new password below to reset your account password.
                      </p>
        
                      <form className="mt-8" onSubmit={handleSubmit}>
                        <input
                          type="password"
                          placeholder="Enter your new password"
                          className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-[#009587]"
                          onChange={(e) => setNewPassword(e.target.value)}
                        />


                        <input
                            type="password"
                            placeholder="Confirm your new password"
                            className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-[#009587] mt-4"
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                        />
        
                        <button
                          type="submit"
                          className="mt-6 w-full bg-red-500 py-3 font-medium text-white transition hover:bg-red-600"
                        >
                          Reset Password
                        </button>
                        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
                        {message && <p className="mt-4 text-sm text-green-500">{message}</p>}
                      </form>
                    </div>
              </div>
            </div>
    );
}