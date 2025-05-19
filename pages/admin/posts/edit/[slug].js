import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getCategories, getPostDetails } from '../../../../services';
import { getCurrentUser } from '../../../../utils/auth';

export default function EditPost() {
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    selectedCategories: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { slug } = router.query;

  useEffect(() => {
    // Check if user is authenticated
    const user = getCurrentUser();
    if (!user) {
      router.push('/admin');
      return;
    }

    if (slug) {
      fetchPostAndCategories();
    }
  }, [router, slug]);

  const fetchPostAndCategories = async () => {
    try {
      const [allCategories, postData] = await Promise.all([
        getCategories(),
        getPostDetails(slug)
      ]);

      setCategories(allCategories);
      
      // Transform post data into form data
      setFormData({
        title: postData.title || '',
        excerpt: postData.excerpt || '',
        content: postData.content?.raw?.children?.[0]?.children?.[0]?.text || '',
        featuredImage: postData.featuredImage?.url || '',
        selectedCategories: postData.category?.map(cat => cat.slug) || []
      });
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load post data. Please try again.');
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCategoryChange = (e) => {
    const options = e.target.options;
    const selectedValues = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    
    setFormData({
      ...formData,
      selectedCategories: selectedValues
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      // This is a simplified example - replace with your actual API call
      // For now, we'll just log the form data and redirect
      console.log('Submit form data:', formData);
      
      // Mock success - in a real app you would call your API
      // await updatePost(slug, formData);
      
      alert('This is a demo. In a real application, this would update the post.');
      router.push('/admin/posts');
    } catch (err) {
      console.error('Error updating post:', err);
      setError('Failed to update post. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-10 mb-8">
        <div className="bg-white shadow-lg rounded-lg p-8 pb-12 mb-8">
          <div className="text-center">
            <p className="text-lg">Loading post...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-10 mb-8">
      <Head>
        <title>Edit Post - Rivergrove 1st Ward</title>
      </Head>

      <div className="bg-white shadow-lg rounded-lg p-8 pb-12 mb-8">
        <div className="flex justify-between items-center border-b pb-4 mb-8">
          <h1 className="text-3xl font-semibold">Edit Post</h1>
          <Link href="/admin/posts">
            <span className="text-blue-500 hover:text-blue-700 cursor-pointer">
              Back to Posts
            </span>
          </Link>
        </div>
        
        {error && <div className="bg-red-100 text-red-700 p-4 mb-6 rounded">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="excerpt">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="3"
              required
            ></textarea>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="featuredImage">
              Featured Image URL
            </label>
            <input
              type="text"
              id="featuredImage"
              name="featuredImage"
              value={formData.featuredImage}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
            {formData.featuredImage && (
              <div className="mt-2">
                <img 
                  src={formData.featuredImage} 
                  alt="Featured image preview" 
                  className="w-32 h-32 object-cover" 
                />
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="categories">
              Categories
            </label>
            <select
              multiple
              id="categories"
              name="categories"
              value={formData.selectedCategories}
              onChange={handleCategoryChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">
              Content
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="12"
              required
            ></textarea>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="transition duration-500 transform hover:-translate-y-1 inline-block bg-pink-600 text-lg font-medium rounded-full text-white px-8 py-3 cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Update Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}