import { useState, useEffect } from 'react';
import Head from 'next/head';
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
    return (
      <div className="container mx-auto px-10 mb-8">
        <div className="bg-white shadow-lg rounded-lg p-8 pb-12 mb-8">
          <div className="text-center">
            <p className="text-lg">Loading...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-10 mb-8">
        <Head>
          <title>Admin Login - Rivergrove 1st Ward</title>
        </Head>
        <div className="bg-white shadow-lg rounded-lg p-8 pb-12 mb-8">
          <h1 className="text-3xl mb-8 font-semibold border-b pb-4">Admin Login</h1>
          {error && <div className="bg-red-100 text-red-700 p-4 mb-6 rounded">{error}</div>}
          <form onSubmit={handleSignIn}>
            <div className="mb-6">
              <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
              <input
                type="email"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password</label>
              <input
                type="password"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <button 
                type="submit" 
                className="transition duration-500 transform hover:-translate-y-1 inline-block bg-pink-600 text-lg font-medium rounded-full text-white px-8 py-3 cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-10 mb-8">
      <Head>
        <title>Admin Dashboard - Rivergrove 1st Ward</title>
      </Head>
      <div className="bg-white shadow-lg rounded-lg p-8 pb-12 mb-8">
        <div className="flex justify-between items-center border-b pb-4 mb-8">
          <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
          <button 
            onClick={handleSignOut} 
            className="transition duration-500 transform hover:-translate-y-1 inline-block bg-red-600 text-lg font-medium rounded-full text-white px-8 py-3 cursor-pointer"
          >
            Sign Out
          </button>
        </div>
        
        <div className="mb-8">
          <a 
            href="/admin/posts" 
            className="transition duration-500 transform hover:-translate-y-1 inline-block bg-pink-600 text-lg font-medium rounded-full text-white px-8 py-3 cursor-pointer"
          >
            Manage Posts
          </a>
        </div>
      </div>
    </div>
  );
}