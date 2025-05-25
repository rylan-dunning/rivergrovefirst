import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getCategories, createPost, getAuthorIdByEmail } from '../../../services';
import { uploadImage } from '../../../services/uploadService';
import { getCurrentUser } from '../../../utils/auth';

export default function NewPost() {
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    featuredImage: null,
    featuredImageUrl: '',
    selectedCategories: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/admin');
      return;
    }
    
    setUser(currentUser);
    fetchCategories();
    
    // Check environment variables and show them in debug panel
    const graphcmsEndpoint = process.env.NEXT_PUBLIC_GRAPHCMS_ENDPOINT;
    const graphcmsToken = process.env.NEXT_PUBLIC_GRAPHCMS_TOKEN;
    
    // Extract project ID for debugging
    let projectId = null;
    try {
      if (graphcmsEndpoint) {
        const matches = graphcmsEndpoint.match(/\/v2\/([^\/]+)/);
        if (matches && matches[1]) {
          projectId = matches[1];
        }
      }
    } catch (e) {
      console.error('Failed to extract project ID:', e);
    }
    
    setDebugInfo({
      env: {
        GRAPHCMS_ENDPOINT: graphcmsEndpoint ? '✓' : '✗',
        GRAPHCMS_TOKEN: graphcmsToken ? '✓' : '✗',
        PROJECT_ID: projectId || 'Could not extract',
        // Show masked token for debugging
        TOKEN_PREVIEW: graphcmsToken ? 
          `${graphcmsToken.substring(0, 5)}...${graphcmsToken.substring(graphcmsToken.length - 5)}` : 
          'Not available'
      },
      userInfo: currentUser ? {
        username: currentUser.username,
        hasEmail: currentUser.attributes && currentUser.attributes.email ? '✓' : '✗',
        email: currentUser.attributes?.email,
      } : 'Not authenticated',
      actions: []
    });
    
  }, [router]);

  const fetchCategories = async () => {
    try {
      const allCategories = await getCategories();
      setCategories(allCategories);
      setIsLoading(false);
      
      // Add categories to debug info
      setDebugInfo(prev => ({
        ...prev,
        categories: {
          count: allCategories.length,
          items: allCategories.map(c => c.name)
        }
      }));
      
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Please try again.');
      setIsLoading(false);
      
      setDebugInfo(prev => ({
        ...prev,
        errors: [...(prev.errors || []), {
          source: 'fetchCategories',
          message: err.message,
          stack: err.stack
        }]
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        featuredImage: file
      });
      
      // Add file info to debug info
      setDebugInfo(prev => ({
        ...prev,
        selectedFile: {
          name: file.name,
          type: file.type,
          size: `${Math.round(file.size / 1024)} KB`
        }
      }));
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
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
    
    // Log action to debug
    setDebugInfo(prev => ({
      ...prev,
      actions: [...(prev.actions || []), {
        type: 'handleSubmit',
        timestamp: new Date().toISOString(),
        formData: { 
          title: formData.title,
          excerpt: formData.excerpt,
          contentLength: formData.content.length,
          selectedCategories: formData.selectedCategories,
          featuredImage: formData.featuredImage ? {
            name: formData.featuredImage.name,
            type: formData.featuredImage.type,
            size: `${Math.round(formData.featuredImage.size / 1024)} KB`
          } : null
        }
      }]
    }));
    
    try {
      // 1. Upload image first if provided
      let featuredImageId = null;
      
      if (formData.featuredImage) {
        try {
          setDebugInfo(prev => ({
            ...prev,
            actions: [...(prev.actions || []), {
              type: 'uploadImage',
              timestamp: new Date().toISOString(),
              file: {
                name: formData.featuredImage.name,
                type: formData.featuredImage.type,
                size: `${Math.round(formData.featuredImage.size / 1024)} KB`
              }
            }]
          }));
          
          const uploadResult = await uploadImage(formData.featuredImage);
          featuredImageId = uploadResult.id;
          
          setDebugInfo(prev => ({
            ...prev,
            actions: [...(prev.actions || []), {
              type: 'uploadImageSuccess',
              timestamp: new Date().toISOString(),
              result: uploadResult
            }]
          }));
        } catch (uploadError) {
          setDebugInfo(prev => ({
            ...prev,
            errors: [...(prev.errors || []), {
              source: 'uploadImage',
              message: uploadError.message,
              stack: uploadError.stack
            }]
          }));
          throw uploadError;
        }
      } else {
        setError('Please upload an image file.');
        setIsSubmitting(false);
        return;
      }
      
      // 2. Get author ID based on the current user
      const userEmail = user.attributes?.email || 'default@example.com';
      
      setDebugInfo(prev => ({
        ...prev,
        actions: [...(prev.actions || []), {
          type: 'getAuthorIdByEmail',
          timestamp: new Date().toISOString(),
          email: userEmail
        }]
      }));
      
      const authorId = await getAuthorIdByEmail(userEmail);
      
      setDebugInfo(prev => ({
        ...prev,
        actions: [...(prev.actions || []), {
          type: 'getAuthorIdByEmailSuccess',
          timestamp: new Date().toISOString(),
          authorId: authorId
        }]
      }));
      
      if (!authorId) {
        setError('Author not found. Please make sure an author with your email exists in Hygraph.');
        setIsSubmitting(false);
        return;
      }
      
      // 3. Create the post
      setDebugInfo(prev => ({
        ...prev,
        actions: [...(prev.actions || []), {
          type: 'createPost',
          timestamp: new Date().toISOString(),
          postData: {
            title: formData.title,
            excerpt: formData.excerpt,
            contentLength: formData.content.length,
            featuredImageId,
            categories: formData.selectedCategories,
            authorId
          }
        }]
      }));
      
      const result = await createPost({
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        featuredImageId,
        categories: formData.selectedCategories,
        authorId
      });
      
      setDebugInfo(prev => ({
        ...prev,
        actions: [...(prev.actions || []), {
          type: 'createPostSuccess',
          timestamp: new Date().toISOString(),
          result
        }]
      }));
      
      console.log('Post created:', result);
      
      // 4. Redirect to the posts list
      router.push('/admin/posts');
    } catch (err) {
      console.error('Error creating post:', err);
      setError(`Failed to create post: ${err.message}`);
      setIsSubmitting(false);
      
      setDebugInfo(prev => ({
        ...prev,
        errors: [...(prev.errors || []), {
          source: 'handleSubmit',
          message: err.message,
          stack: err.stack
        }]
      }));
    }
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

  return (
    <div className="container mx-auto px-10 mb-8">
      <Head>
        <title>Create New Post - Rivergrove 1st Ward</title>
      </Head>

      <div className="bg-white shadow-lg rounded-lg p-8 pb-12 mb-8">
        <div className="flex justify-between items-center border-b pb-4 mb-8">
          <h1 className="text-3xl font-semibold">Create New Post</h1>
          <div className="flex space-x-4">
            <button 
              onClick={() => setShowDebug(!showDebug)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {showDebug ? 'Hide Debug' : 'Show Debug'}
            </button>
            <Link href="/admin/posts">
              <span className="text-blue-500 hover:text-blue-700 cursor-pointer">
                Back to Posts
              </span>
            </Link>
          </div>
        </div>
        
        {error && <div className="bg-red-100 text-red-700 p-4 mb-6 rounded">{error}</div>}
        
        {showDebug && debugInfo && (
          <div className="bg-gray-100 p-4 mb-6 rounded overflow-auto max-h-96">
            <h3 className="font-bold mb-2">Debug Information</h3>
            <pre className="text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
        
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
              Featured Image
            </label>
            <input
              type="file"
              id="featuredImage"
              name="featuredImage"
              accept="image/*"
              onChange={handleImageChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
            {imagePreview && (
              <div className="mt-4">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-64 h-auto object-cover mt-2 border"
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
              {isSubmitting ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}