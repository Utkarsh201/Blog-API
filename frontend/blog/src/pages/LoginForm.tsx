import {useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'

interface LoginFormProps {
    setToken : (token : string) => void;
}


export default function LoginForm ({setToken} : LoginFormProps){
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e : React.FormEvent) =>{
        e.preventDefault();
        setLoading(true);
        setError('');


        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/users/login`, {
                method : 'POST',
                headers : {
                    'Content-Type' : 'application/json'
                },
                credentials : 'include',
                body : JSON.stringify({email, password}),
            })

            const data = await response.json();

            if(response.ok){
                if(!data.token){
                    throw new Error('No Token received from the server');
                }
                console.log('Login Successful, token :', data.token);
                localStorage.setItem('token', data.token);
                setToken(data.token);
                navigate('/');
            }else {
                console.log('Login Failed :', data);
                setError(data.error || 'Login Failed')
            }

        } catch (err) {
           console.error('Login error:', err);
        setError(err instanceof Error ? err.message : 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    }



    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-4">
        <div className="bg-gray-800 text-white border-[1px] border-gray-700 shadow-lg w-full sm:w-auto p-6 sm:p-8 rounded-lg mt-10 mb-10">
            <h1 className="text-center text-2xl font-bold mb-6">Log In</h1>
            <form className="flex flex-col gap-4 w-full sm:w-[400px]" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1">
                <label htmlFor="email">Email</label>
                <input
                className="p-2 border rounded"
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                />
            </div>
            <div className="flex flex-col gap-1">
                <label htmlFor="password">Password</label>
                <input
                className="p-2 border rounded"
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                />
            </div>
            {error && (
                <p className="text-sm text-red-600 mt-1">{error}</p>
            )}
            <button
                className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 cursor-pointer transition-colors disabled:opacity-50"
                type="submit"
                disabled={loading}
            >
                {loading ? 'Signing in...' : 'Log In'}
            </button>
            </form>
            <p className="mt-4">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-500 hover:underline">
                Sign up
            </Link>
            </p>
        </div>
        </div>
    );
}
