import React, {useState} from 'react';
import {useNavigate, Link} from 'react-router-dom';


interface SignUpFormProps{
    setToken : (token : string) => void
}

export default function SignUpForm({setToken} : SignUpFormProps){
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [adminKey, setAdminKey] = useState('');
    const [error, setError] = useState('');
    const [confirmError, setConfirmError] = useState('');
    const [loading, setLoading] = useState(false);


    const handleSubmit = async (e : React.SyntheticEvent)=>{
        e.preventDefault();
        setLoading(true);
        setError('');
        setConfirmError('');    
        
        if(password !== confirmPassword){
            setConfirmError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/admin/signup`, {
                method : 'POST',
                headers : {
                    'Content-Type' : 'application/json',
                },
                body : JSON.stringify({username, email, password, adminKey}),
            })

            if(response.ok){
                const data = await response.json();
                localStorage.setItem('adminToken', data.token);
                setToken(data.token);
                navigate('/dashboard');
            }else {
                const errorData = await response.json();
                setError(errorData.error || 'Admin SignUp Failed');
            }
        } catch {
            setError('Network Error, Please try again');   
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-4 bg-gray-900">
        <div className="bg-gray-800 text-white border border-gray-700 shadow-lg w-full sm:w-auto p-6 sm:p-8 rounded-lg mt-10 mb-10">
            <h1 className="text-center text-2xl font-bold mb-6">Admin Sign Up</h1>
            <form className="flex flex-col gap-4 w-full sm:w-[400px]" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1">
                <label htmlFor="username" className="text-white">Username</label>
                <input
                className="p-2 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                />
            </div>
            <div className="flex flex-col gap-1">
                <label htmlFor="email" className="text-white">Email</label>
                <input
                className="p-2 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                />
            </div>
            <div className="flex flex-col gap-1">
                <label htmlFor="password" className="text-white">Password</label>
                <input
                className="p-2 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                />
            </div>
            <div className="flex flex-col gap-1">
                <label htmlFor="confirm-password" className="text-white">Confirm Password</label>
                <input
                className="p-2 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                type="password"
                id="confirm-password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                />
                {confirmError && (
                <p className="text-sm text-red-600 mt-1">{confirmError}</p>
                )}
            </div>
            <div className="flex flex-col gap-1">
                <label htmlFor="admin-key" className="text-white">Admin Key</label>
                <input
                className="p-2 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                type="password"
                id="admin-key"
                name="adminKey"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                required
                />
            </div>
            {error && (
                <p className="text-sm text-red-600 mt-1">{error}</p>
            )}
            <button
                className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 cursor-pointer transition-colors disabled:opacity-50 w-full"
                type="submit"
                disabled={loading}
            >
                {loading ? 'Creating account...' : 'Sign Up'}
            </button>
            </form>
            <p className="mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:underline">
                Log in
            </Link>
            </p>
        </div>
        </div>
    );
}
