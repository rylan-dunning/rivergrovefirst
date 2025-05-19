import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import moment from 'moment';
import { getPosts, deletePost } from '../../../services';
import { getCurrentUser } from '../../../utils/auth';

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const user = getCurrentUser();
    if (!user) {
      router.push('/admin');
      return;
    }

    fetchPosts();
  }, [router]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const allPosts = await getPosts();
      setPosts(allPosts);
      setError('');
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPost) return;
    
    try {
      await deletePost(selectedPost.slug);
      setShowDeleteModal(false);
      setSelectedPost(null);
      await fetchPosts(); // Refresh posts list
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Failed to delete post. Please try again.');
    }
  };

  const openDeleteModal = (post) => {
    setSelectedPost(post);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedPost(null);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-10 mb-8">
        <div className="bg-white shadow-lg rounded-lg p-8 pb-12 mb-8">
          <div className="text-center">
            <p className="text-lg">Loading posts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-10 mb-8">
      <Head>
        <title>Manage Posts - Rivergrove 1st Ward</title>
      </Head>
      
      <div className="bg-white shadow-lg rounded-lg p-8 pb-12 mb-8">
        <div className="flex justify-between items-center border-b pb-4 mb-8">
          <h1 className="text-3xl font-semibold">Manage Posts</h1>
          <div>
            <Link href="/admin/posts/new">
              <span className="transition duration-500 transform hover:-translate-y-1 inline-block bg-pink-600 text-lg font-medium rounded-full text-white px-8 py-3 cursor-pointer">
                Create New Post
              </span>
            </Link>
          </div>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-4 mb-6 rounded">{error}</div>}

        {posts.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-600">No posts found. Create your first post!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-3 px-4 border-b text-left">Title</th>
                  <th className="py-3 px-4 border-b text-left">Date</th>
                  <th className="py-3 px-4 border-b text-left">Category</th>
                  <th className="py-3 px-4 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.node.slug}>
                    <td className="py-3 px-4 border-b">
                      <Link href={`/post/${post.node.slug}`}>
                        <span className="text-blue-600 hover:text-blue-800 cursor-pointer">
                          {post.node.title}
                        </span>
                      </Link>
                    </td>
                    <td className="py-3 px-4 border-b">
                      {moment(post.node.createdAt).format('MMM DD, YYYY')}
                    </td>
                    <td className="py-3 px-4 border-b">
                      {post.node.category.map(cat => cat.name).join(', ')}
                    </td>
                    <td className="py-3 px-4 border-b">
                      <Link href={`/admin/posts/edit/${post.node.slug}`}>
                        <span className="text-blue-500 hover:text-blue-700 mr-4 cursor-pointer">
                          Edit
                        </span>
                      </Link>
                      <button
                        onClick={() => openDeleteModal(post.node)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-6">
              Are you sure you want to delete "{selectedPost?.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 rounded-md text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}