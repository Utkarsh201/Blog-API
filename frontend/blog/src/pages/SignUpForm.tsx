import {useState} from 'react'
import {useNavigate} from 'react-router-dom'

interface SignUpFormProps {
    setToken : (token : string) => void;
}



export default function SignUpForm({setToken} : SignUpFormProps){
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [confirmError, setConfirmError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e : React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setConfirmError('');

        if(password !== confirmPassword){
            setConfirmError('Password Donot Match');
            setLoading(false)
            return ;
        }

        try{
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/signup`, {
                method : 'POST',
                headers : {
                    'Content-Type' : 'application/json',
                },
                body : JSON.stringify({username, email, password}),
            });

            if(response.ok){
                const data = response.json();
                localStorage.setItem('token', data.token);
                setToken(data.token);
                navigate('/')
            }else {
                const errorData = await response.json();
                setError(errorData.error || 'Sign Up Failed')
            }
        } catch (error){
            setError('NetWork Error. Please try again');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-4">
        <div className="bg-gray-800 text-white border-[1px] border-gray-700 shadow-lg w-full sm:w-auto p-6 sm:p-8 rounded-lg mt-10 mb-10">
            <h1 className="text-center text-2xl font-bold mb-6">Sign Up</h1>
            <form className="flex flex-col gap-4 w-full sm:w-[400px]" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1">
                <label htmlFor="username">Username</label>
                <input
                className="p-2 border rounded"
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                />
            </div>
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
            <div className="flex flex-col gap-1">
                <label htmlFor="confirm-password">Confirm Password</label>
                <input
                className="p-2 border rounded"
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
            {error && (
                <p className="text-sm text-red-600 mt-1">{error}</p>
            )}
            <button
                className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 cursor-pointer transition-colors disabled:opacity-50"
                type="submit"
                disabled={loading}
            >
                {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
            </form>
            <p className="mt-4">
            Already have an account?{' '}
            <a href="/login" className="text-blue-500 hover:underline">
                Log in
            </a>
            </p>
        </div>
        </div>
    );
}