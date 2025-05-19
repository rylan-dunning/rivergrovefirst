import { useState, useEffect } from 'react';
import { getCurrentUser, signIn, signOut } from '../utils/auth';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = getCurrentUser();
        if (user) {
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Auth check error:', err);
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);
  
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await signIn(email, password);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err.message || 'Failed to sign in');
      console.error('Sign in error:', err);
    }
  };
  
  const handleSignOut = () => {
    signOut();
    setIsAuthenticated(false);
  };
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return (
      <div className="container">
        <h1>Admin Login</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSignIn}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">Sign In</button>
        </form>
      </div>
    );
  }
  
  return (
    <div className="container">
      <h1>Admin Dashboard</h1>
      <p>You are signed in!</p>
      <button onClick={handleSignOut} className="btn btn-secondary">Sign Out</button>
      
      {/* Your admin content goes here */}
    </div>
  );
}