import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getCategories, createPost, getAuthors, debugImageConnection, testImageConnectionSyntax, publishPost, testExistingAssetConnection } from '../../../services';
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
    selectedCategories: [],
    selectedAuthor: '',
    featuredPost: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  const [authors, setAuthors] = useState([]);
  const router = useRouter();

  //////////////////////////test
// Replace your test function with this updated version that includes slug and content

const testCreatePostStepByStep = async () => {
    console.log('=== STEP BY STEP MUTATION TEST ===');
    
    const contentEndpoint = process.env.NEXT_PUBLIC_GRAPHCMS_ENDPOINT;
    const authToken = process.env.NEXT_PUBLIC_GRAPHCMS_TOKEN;
    
    const apiEndpoint = contentEndpoint.includes('cdn.hygraph.com') 
      ? contentEndpoint.replace('us-west-2.cdn.hygraph.com/content', 'api-us-west-2.hygraph.com/v2')
      : contentEndpoint;
    
    // Test 1: Minimal post creation with ALL required fields
    console.log('Test 1: Minimal post creation with required fields...');
    const minimalTest = {
      query: `
        mutation CreateMinimalPost(
          $title: String!,
          $slug: String!,
          $excerpt: String!,
          $content: RichTextAST!,
          $featuredPost: Boolean!,
          $authorId: ID!
        ) {
          createPost(
            data: {
              title: $title,
              slug: $slug,
              excerpt: $excerpt,
              content: { 
                json: $content 
              },
              featuredPost: $featuredPost,
              author: { 
                connect: { id: $authorId } 
              }
            }
          ) {
            id
            slug
            title
          }
        }
      `,
      variables: {
        title: "Test Minimal Post",
        slug: "test-minimal-post-" + Date.now(),
        excerpt: "Test excerpt",
        content: {
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  text: 'Test content',
                },
              ],
            },
          ],
        },
        featuredPost: false,
        authorId: "cm3m8gk8tpsie06myl2t8ulas"
      }
    };
    
    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(minimalTest)
      });
      
      const result = await response.json();
      console.log('Minimal test result:', result);
      
      if (result.errors) {
        console.error('❌ Minimal test failed:', result.errors);
      } else {
        console.log('✅ Minimal test worked! Post creation is working');
      }
    } catch (error) {
      console.error('❌ Minimal test error:', error);
    }
    
    console.log('=== STEP BY STEP TEST COMPLETE ===');
  };
  //////////////////////////

  useEffect(() => {
    // Check if user is authenticated
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/admin');
      return;
    }

    setUser(currentUser);
    fetchCategoriesAndAuthors();
    
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

  const fetchCategoriesAndAuthors = async () => {
    try {
      const [allCategories, allAuthors] = await Promise.all([
        getCategories(),
        getAuthors()
      ]);
      
      setCategories(allCategories);
      setAuthors(allAuthors);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
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

  const handleAuthorChange = (e) => {
    setFormData({
      ...formData,
      selectedAuthor: e.target.value
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

  // getUserEmail
  // Add this function to your new post page to properly get the user's email

const getUserEmail = async () => {
    console.log('=== GETTING USER EMAIL ===');
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('No user logged in');
    }
    
    console.log('Current user:', currentUser);
    console.log('Username:', currentUser.username);
    
    // Try to get email from attributes first
    if (currentUser.attributes && currentUser.attributes.email) {
      console.log('Found email in attributes:', currentUser.attributes.email);
      return currentUser.attributes.email;
    }
    
    // If not in attributes, try to get it from the session
    return new Promise((resolve, reject) => {
      currentUser.getSession((err, session) => {
        if (err) {
          console.error('Session error:', err);
          reject(err);
          return;
        }
        
        console.log('Session:', session);
        
        if (session && session.idToken && session.idToken.payload) {
          const payload = session.idToken.payload;
          console.log('Token payload:', payload);
          
          if (payload.email) {
            console.log('Found email in token payload:', payload.email);
            resolve(payload.email);
            return;
          }
        }
        
        // If we still can't find email, get user attributes explicitly
        currentUser.getUserAttributes((attrErr, attributes) => {
          if (attrErr) {
            console.error('Error getting attributes:', attrErr);
            reject(attrErr);
            return;
          }
          
          console.log('User attributes:', attributes);
          
          const emailAttr = attributes.find(attr => attr.Name === 'email');
          if (emailAttr) {
            console.log('Found email in user attributes:', emailAttr.Value);
            resolve(emailAttr.Value);
          } else {
            reject(new Error('No email found in user attributes'));
          }
        });
      });
    });
  };

// Replace your handleSubmit with this clean, working version:

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  setError('');
  
  try {
    // 1. Upload image first if provided
    let featuredImageId = null;
    
    if (formData.featuredImage) {
      try {
        console.log('🖼️ Starting image upload...');
        const uploadResult = await uploadImage(formData.featuredImage);
        featuredImageId = uploadResult.id;
        console.log('✅ Image uploaded successfully!');
        console.log('Image ID:', featuredImageId);
        
      } catch (uploadError) {
        console.error('❌ Image upload failed:', uploadError);
        setError(`Image upload failed: ${uploadError.message}`);
        setIsSubmitting(false);
        return;
      }
    } else {
      setError('Please upload an image file.');
      setIsSubmitting(false);
      return;
    }
    
    // 2. Check if author is selected
    if (!formData.selectedAuthor) {
      setError('Please select an author.');
      setIsSubmitting(false);
      return;
    }
    
    // 3. Create the post
    console.log('📝 Creating post with image ID:', featuredImageId);
    const result = await createPost({
      title: formData.title,
      excerpt: formData.excerpt,
      content: formData.content,
      featuredImageId,
      categories: formData.selectedCategories,
      authorId: formData.selectedAuthor,
      featuredPost: formData.featuredPost || false
    });
    
    console.log('✅ Post created successfully:', result);
    
    // 4. Success! Redirect to posts list
    router.push('/admin/posts');
    
  } catch (err) {
    console.error('❌ Error creating post:', err);
    setError(`Failed to create post: ${err.message}`);
    setIsSubmitting(false);
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


            <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="author">
                Author
            </label>
            <select
                id="author"
                name="author"
                value={formData.selectedAuthor}
                onChange={handleAuthorChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
            >
                <option value="">Select an author...</option>
                {authors.map(author => (
                <option key={author.id} value={author.id}>
                    {author.name}
                </option>
                ))}
            </select>
            </div>

            <div className="mb-6">
            <label className="flex items-center">
                <input
                type="checkbox"
                name="featuredPost"
                checked={formData.featuredPost || false}
                onChange={(e) => setFormData({
                    ...formData,
                    featuredPost: e.target.checked
                })}
                className="mr-2"
                />
                <span className="text-gray-700 text-sm font-bold">Featured Post</span>
            </label>
            <p className="text-sm text-gray-500 mt-1">Check this to make this a featured post</p>
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
