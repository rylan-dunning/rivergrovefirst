// pages/admin/posts/new.js
import React, { useState, useEffect } from 'react';
import { Auth } from 'aws-amplify';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getCategories, createPost } from '../../../services';

const NewPost = () => {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    selectedCategories: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await Auth.currentAuthenticatedUser();
        setUser(userData);
        fetchCategories();
      } catch (err) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const fetchCategories = async () => {
    const allCategories = await getCategories();
    setCategories(allCategories);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCategoryChange = (e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({
      ...formData,
      selectedCategories: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // This function would be added to your services/index.js
      await createPost({
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        featuredImage: formData.featuredImage,
        categories: formData.selectedCategories,
        author: user.username // or however you identify the author
      });
      
      router.push('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'An error occurred while creating the post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-10 mb-8">
      <Head>
        <title>Create New Post - Rivergrove 1st Ward</title>
      </Head>

      <div className="bg-white shadow-lg rounded-lg p-8 pb-12 mb-8">
        <h1 className="text-3xl mb-8 font-semibold border-b pb-4">Create New Post</h1>
        
        {error && <div className="text-red-500 mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Excerpt
            </label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="3"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Featured Image URL
            </label>
            <input
              type="text"
              name="featuredImage"
              value={formData.featuredImage}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Categories
            </label>
            <select
              multiple
              name="categories"
              value={formData.selectedCategories}
              onChange={handleCategoryChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              {categories.map(category => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple categories</p>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Content
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="10"
              required
            />
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPost;