import React, {useState} from 'react'
import {useNavigate, Link} from 'react-router-dom';

interface LoginFromProps {
    setToken : (token : string) => void;
}

export default function LoginForm({setToken}: LoginFromProps){
    const navigate = useNavigate();
    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e : React.SyntheticEvent) =>{
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/admin/login`, {
                method : 'POST',
                headers : {
                    'Content-Type' : 'application/json',
                },
                body : JSON.stringify({email, password}),
            });

            if(response.ok){
                const data = await response.json();
                localStorage.setItem('adminToken', data.token);
                setToken(data.token);
                navigate('/dashboard');
            }else {
                const errorData = await response.json();
                setError(errorData.error || 'Login Failed');
            }
        } catch {
            setError('Network Error, Please try again');
        } finally {
            setLoading(false);
        }
    }

    return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-4 bg-gray-900">
      <div className="bg-gray-800 text-white border border-gray-700 shadow-lg w-full sm:w-auto p-6 sm:p-8 rounded-lg mt-10 mb-10">
        <h1 className="text-center text-2xl font-bold mb-6">Admin Login</h1>
        <form className="flex flex-col gap-4 w-full sm:w-[400px]" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-2 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`p-2 bg-gray-700 border ${error ? 'border-red-500' : 'border-gray-600'} rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              disabled={loading}
            />
            {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 cursor-pointer transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Log In'}
          </button>
        </form>
        <p className="mt-4">
          Don't have an admin account?{' '}
          <Link to="/signup" className="text-blue-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
