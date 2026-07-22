
import { useState } from 'react'
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import LoginForm from './pages/LoginForm'
import PostPage from './pages/PostPage'
import SignUpForm from './pages/SignUpForm'

function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Home onLogout={handleLogout} isAuthenticated={Boolean(token)} />}
        />
        <Route
          path="/login"
          element={token ? <Navigate to="/" replace /> : <LoginForm setToken={setToken} />}
        />
        <Route
          path="/signup"
          element={token ? <Navigate to="/" replace /> : <SignUpForm setToken={setToken} />}
        />
        <Route
          path="/posts/:id"
          element={<PostPage isAuthenticated={Boolean(token)} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
