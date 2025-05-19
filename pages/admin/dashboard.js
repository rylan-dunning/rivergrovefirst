// pages/admin/dashboard.js
import React, { useState, useEffect } from 'react';
import { Auth } from 'aws-amplify';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { getPosts } from '../../services';
import withAuth from '../../utils/auth';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await Auth.currentAuthenticatedUser();
        setUser(userData);
        fetchPosts();
      } catch (err) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const fetchPosts = async () => {
    const allPosts = await getPosts();
    setPosts(allPosts);
  };

  const handleSignOut = async () => {
    try {
      await Auth.signOut();
      router.push('/login');
    } catch (err) {
      console.error('Error signing out: ', err);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-10 py-20">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-10 mb-8">
      <Head>
        <title>Admin Dashboard - Rivergrove 1st Ward</title>
      </Head>

      <div className="bg-white shadow-lg rounded-lg p-8 mb-8">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
          <div>
            <span className="mr-4">Welcome, {user?.attributes?.email}</span>
            <button
              onClick={handleSignOut}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="mb-8">
          <Link href="/admin/posts/new">
            <span className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              Create New Post
            </span>
          </Link>
        </div>

        <h2 className="text-xl font-semibold mb-4">Your Posts</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-3 px-4 border-b text-left">Title</th>
                <th className="py-3 px-4 border-b text-left">Category</th>
                <th className="py-3 px-4 border-b text-left">Date</th>
                <th className="py-3 px-4 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.node.slug}>
                  <td className="py-3 px-4 border-b">{post.node.title}</td>
                  <td className="py-3 px-4 border-b">
                    {post.node.category.map(cat => cat.name).join(', ')}
                  </td>
                  <td className="py-3 px-4 border-b">
                    {new Date(post.node.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 border-b">
                    <Link href={`/admin/posts/edit/${post.node.slug}`}>
                      <span className="text-blue-500 hover:text-blue-700 mr-3">
                        Edit
                      </span>
                    </Link>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeletePost(post.node.slug)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default withAuth(Dashboard);