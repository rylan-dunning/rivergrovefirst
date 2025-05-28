// services/index.js - Updated for Legacy Asset System
import { request, gql } from 'graphql-request';

const getConfig = (key) => {
  // Try runtime config first, fall back to env vars for development
  if (typeof window !== 'undefined' && window.CONFIG) {
    return window.CONFIG[key];
  }
  
  // Fallback to environment variables for development
  switch (key) {
    case 'GRAPHCMS_ENDPOINT':
      return process.env.NEXT_PUBLIC_GRAPHCMS_ENDPOINT;
    case 'GRAPHCMS_TOKEN':
      return process.env.NEXT_PUBLIC_GRAPHCMS_TOKEN;
    case 'USER_POOL_ID':
      return process.env.NEXT_PUBLIC_USER_POOL_ID;
    case 'USER_POOL_CLIENT_ID':
      return process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID;
    default:
      return null;
  }
};

// Use the config helper
const contentAPI = getConfig('GRAPHCMS_ENDPOINT');
const authToken = getConfig('GRAPHCMS_TOKEN');

// Headers with authentication
const authHeaders = {
  Authorization: `Bearer ${authToken}`
};

const debugConfig = () => {
  console.log('API Configuration:', {
    contentAPI: contentAPI ? '✓ Set' : '✗ Missing',
    authToken: authToken ? '✓ Set' : '✗ Missing',
    contentAPIPreview: contentAPI ? contentAPI.substring(0, 50) + '...' : 'Not set',
    configSource: typeof window !== 'undefined' && window.CONFIG ? 'Runtime Config' : 'Environment Variables'
  });
};


// Read operations
export const getPosts = async () => {
  const query = gql`
    query MyQuery {
      postsConnection(orderBy: createdAt_DESC) {
        edges {
          node {
            author {
              bio
              name
              id
              photo {
                url
              }
            }
            createdAt
            slug
            title
            excerpt
            featuredImage {
              url
              id
            }
            category {
              name
              slug
            }
          }
        }
      }
    }
  `;
  
  try {
    const result = await request(contentAPI, query);
    return result.postsConnection.edges;
  } catch (error) {
    console.error('Error fetching posts:', error);
    debugConfig();
    throw error;
  }
};

export const getRecentPosts = async () => {
  const query = gql`
    query getPostDetails {
      posts(
        orderBy: createdAt_DESC
        first: 3
      ) {
        title
        featuredImage {
          url
        }
        createdAt
        slug
      }
    }  
  `;
  
  const result = await request(contentAPI, query);
  return result.posts;
};

export const getSimilarPosts = async (categories, slug) => {
  const query = gql`
    query GetPostDetails($slug: String!, $categories: [String!]) {
      posts(
        where: { slug_not: $slug, AND: { category_some: { slug_in: $categories }}} 
        last: 3
      ) {
        title
        featuredImage {
          url
        }
        createdAt
        slug
      }
    }
  `;
  
  const variables = { categories, slug };
  const result = await request(contentAPI, query, variables);
  return result.posts;
};

// In your services/index.js, replace the getPostDetails function with this fixed version:

export const getPostDetails = async (slug) => {
  // Convert CDN endpoint to API endpoint if needed
  const apiEndpoint = contentAPI.includes('cdn.hygraph.com') 
    ? contentAPI.replace('us-west-2.cdn.hygraph.com/content', 'api-us-west-2.hygraph.com/v2')
    : contentAPI;

  const query = gql`
    query GetPostDetails($slug : String!) {
      post(where: {slug: $slug }) {
        author {
          bio
          name
          id
          photo {
            url
          }
        }
        createdAt
        slug
        title
        excerpt
        featuredImage {
          url
          id
        }
        category {
          name
          slug
        }
        content {
          raw
        }
      }
    }
  `;

  const variables = { slug };
  
  try {
    // Use the API endpoint and include auth headers for individual post queries
    const result = await request(apiEndpoint, query, variables, authHeaders);
    return result.post;
  } catch (error) {
    console.error('Error fetching post details:', error);
    debugConfig();
    throw error;
  }
};

export const getCategories = async () => {
  const query = gql`
    query GetCategories {
      categories {
        name
        slug
      }
    }
  `;
  
  const result = await request(contentAPI, query);
  return result.categories;
};

export const getCategoryPost = async (slug) => {
  const query = gql`
    query GetCategoryPost($slug: String!) {
      postsConnection(where: {category_some: {slug: $slug}}) {
        edges {
          node {
            author {
              bio
              name
              id
              photo {
                url
              }
            }
            createdAt
            slug
            title
            excerpt
            featuredImage {
              url
            }
            category {
              name
              slug
            }
          }
        }
      }
    }
  `;

  const variables = { slug };
  const result = await request(contentAPI, query, variables);
  return result.postsConnection.edges;
};

export const getAuthors = async () => {
  const query = gql`
    query GetAuthors {
      authors {
        id
        name
        bio
      }
    }
  `;
  
  try {
    const result = await request(contentAPI, query);
    return result.authors;
  } catch (error) {
    console.error('Error fetching authors:', error);
    throw error;
  }
};


// CREATE POST

// Update your createPost function in services/index.js to include the featuredImage in the response:

export const createPost = async (postData) => {
  if (!contentAPI) {
    throw new Error('Content API endpoint not configured');
  }
  
  if (!authToken) {
    throw new Error('Auth token not configured');
  }
  
  const { title, excerpt, content, featuredImageId, categories, authorId } = postData;
  
  console.log('Creating post with data:', postData);

  // Convert CDN endpoint to API endpoint if needed
  const apiEndpoint = contentAPI.includes('cdn.hygraph.com') 
    ? contentAPI.replace('us-west-2.cdn.hygraph.com/content', 'api-us-west-2.hygraph.com/v2')
    : contentAPI;

  const mutation = gql`
    mutation CreatePost(
      $title: String!,
      $slug: String!,
      $excerpt: String!,
      $content: RichTextAST!,
      $featuredImageId: ID!,
      $featuredPost: Boolean!,
      $categories: [CategoryWhereUniqueInput!]!,
      $authorId: ID!
    ) {
      createPost(
        data: {
          title: $title,
          slug: $slug,
          excerpt: $excerpt,
          content: $content,
          featuredImage: { 
            connect: { id: $featuredImageId } 
          },
          featuredPost: $featuredPost,
          category: { 
            connect: $categories 
          },
          author: { 
            connect: { id: $authorId } 
          }
        }
      ) {
        id
        slug
        title
        featuredImage {
          id
          url
        }
      }
    }
  `;
  
  // Generate slug from title
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
  const uniqueSlug = `${slug}-${Date.now()}`;
  
  // Use the EXACT same format as your existing posts
  const contentRaw = {
    children: [
      {
        type: 'paragraph',
        children: [
          {
            text: content || ''
          }
        ]
      }
    ]
  };
  
  // Prepare categories for connection
  const categoryConnections = categories.map(slug => ({ 
    slug 
  }));
  
  const variables = {
    title,
    slug: uniqueSlug,
    excerpt,
    content: contentRaw,
    featuredImageId,
    featuredPost: false,
    categories: categoryConnections,
    authorId,
  };
  
  try {
    console.log('🔍 DETAILED DEBUG - Making GraphQL mutation to:', apiEndpoint);
    console.log('🔍 DETAILED DEBUG - Variables being sent:', JSON.stringify(variables, null, 2));
    
    const result = await request(apiEndpoint, mutation, variables, authHeaders);
    console.log('🔍 DETAILED DEBUG - Full result received:', JSON.stringify(result, null, 2));
    
    // Check if featuredImage was connected
    if (result.createPost.featuredImage) {
      console.log('✅ Featured image connected successfully:', result.createPost.featuredImage);
    } else {
      console.error('❌ Featured image was NOT connected to the post!');
      console.error('This means the GraphQL mutation failed to connect the image');
    }
    
    // Automatically publish the post after creation
    if (result.createPost && result.createPost.id) {
      console.log('Publishing post...');
      try {
        await publishPost(result.createPost.id);
        console.log('✅ Post published successfully!');
      } catch (publishError) {
        console.error('⚠️ Post created but failed to publish:', publishError);
        // Don't throw here - the post was created successfully, just not published
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error creating post:', error);
    if (error.response && error.response.errors) {
      console.error('GraphQL errors:', JSON.stringify(error.response.errors, null, 2));
    }
    throw error;
  }
};


// PUBLISH POST



export const publishPost = async (postId) => {
  if (!contentAPI) {
    throw new Error('Content API endpoint not configured');
  }
  
  if (!authToken) {
    throw new Error('Auth token not configured');
  }
  
  console.log('Publishing post with ID:', postId);

  // Convert CDN endpoint to API endpoint if needed
  const apiEndpoint = contentAPI.includes('cdn.hygraph.com') 
    ? contentAPI.replace('us-west-2.cdn.hygraph.com/content', 'api-us-west-2.hygraph.com/v2')
    : contentAPI;

  const mutation = gql`
    mutation PublishPost($id: ID!) {
      publishPost(where: { id: $id }, to: PUBLISHED) {
        id
        stage
      }
    }
  `;
  
  const variables = {
    id: postId
  };
  
  try {
    console.log('Publishing post to PUBLISHED stage');
    
    const result = await request(apiEndpoint, mutation, variables, authHeaders);
    console.log('Post published successfully:', result);
    return result;
  } catch (error) {
    console.error('Error publishing post:', error);
    if (error.response && error.response.errors) {
      console.error('GraphQL errors:', JSON.stringify(error.response.errors, null, 2));
    }
    throw error;
  }
};

// PUBLISH ASSETS

// Add this function to services/index.js to publish assets

// Replace your publishAsset function in services/index.js with this version:

export const publishAsset = async (assetId) => {
  if (!contentAPI) {
    throw new Error('Content API endpoint not configured');
  }
  
  if (!authToken) {
    throw new Error('Auth token not configured');
  }
  
  console.log('Publishing asset with ID:', assetId);

  // Convert CDN endpoint to API endpoint if needed
  const apiEndpoint = contentAPI.includes('cdn.hygraph.com') 
    ? contentAPI.replace('us-west-2.cdn.hygraph.com/content', 'api-us-west-2.hygraph.com/v2')
    : contentAPI;

  // Try different mutation syntax
  const mutation = gql`
    mutation PublishAsset($id: ID!) {
      publishAsset(where: { id: $id }) {
        id
        stage
        url
      }
    }
  `;
  
  const variables = {
    id: assetId
  };
  
  try {
    console.log('Publishing asset...');
    
    const result = await request(apiEndpoint, mutation, variables, authHeaders);
    console.log('Asset published successfully:', result);
    return result;
  } catch (error) {
    console.error('Error publishing asset:', error);
    
    // If the first syntax fails, try without specifying stage
    console.log('Trying alternative publish syntax...');
    
    const alternativeMutation = gql`
      mutation PublishAssetAlt($id: ID!) {
        publishAsset(where: { id: $id }, to: PUBLISHED) {
          id
          stage
        }
      }
    `;
    
    try {
      const altResult = await request(apiEndpoint, alternativeMutation, variables, authHeaders);
      console.log('Asset published with alternative syntax:', altResult);
      return altResult;
    } catch (altError) {
      console.error('Alternative publish syntax also failed:', altError);
      throw new Error(`Asset publishing failed: ${altError.message}`);
    }
  }
};


// UPDATE POST
// Replace the updatePost function in services/index.js with this simplified version:

export const updatePost = async (slug, postData) => {
  if (!contentAPI) {
    throw new Error('Content API endpoint not configured');
  }
  
  if (!authToken) {
    throw new Error('Auth token not configured');
  }
  
  const { title, excerpt, content, featuredImageId, categories } = postData;
  
  console.log('Updating post with slug:', slug);
  console.log('Post data:', postData);

  // Convert CDN endpoint to API endpoint if needed
  const apiEndpoint = contentAPI.includes('cdn.hygraph.com') 
    ? contentAPI.replace('us-west-2.cdn.hygraph.com/content', 'api-us-west-2.hygraph.com/v2')
    : contentAPI;

  // Simplified mutation - only update basic fields first
  const mutation = gql`
    mutation UpdatePost(
      $slug: String!,
      $title: String!,
      $excerpt: String!,
      $content: RichTextAST!
    ) {
      updatePost(
        where: { slug: $slug }
        data: {
          title: $title,
          excerpt: $excerpt,
          content: $content
        }
      ) {
        id
        slug
        title
        featuredImage {
          id
          url
        }
      }
    }
  `;
  
  const variables = {
    slug,
    title,
    excerpt,
    content: {
      children: [
        {
          type: 'paragraph',
          children: [
            {
              text: content || ''
            }
          ]
        }
      ]
    }
  };
  
  try {
    console.log('Making update request with variables:', JSON.stringify(variables, null, 2));
    
    const result = await request(apiEndpoint, mutation, variables, authHeaders);
    
    console.log('Update result:', result);
    
    // If we have a featured image ID, update it separately
    if (featuredImageId && result.updatePost) {
      try {
        const imageUpdateMutation = gql`
          mutation UpdatePostImage($slug: String!, $featuredImageId: ID!) {
            updatePost(
              where: { slug: $slug }
              data: {
                featuredImage: { 
                  connect: { id: $featuredImageId } 
                }
              }
            ) {
              id
              featuredImage {
                id
                url
              }
            }
          }
        `;
        
        const imageResult = await request(apiEndpoint, imageUpdateMutation, { 
          slug, 
          featuredImageId 
        }, authHeaders);
        
        console.log('Image update result:', imageResult);
      } catch (imageError) {
        console.error('Image update failed:', imageError);
      }
    }
    
    // Replace just the category update section in your updatePost function with this:

// Update categories separately if provided
if (categories && categories.length > 0 && result.updatePost) {
  try {
    // Skip disconnect and just set the categories directly
    const categoryUpdateMutation = gql`
      mutation UpdatePostCategories($slug: String!, $categories: [CategoryWhereUniqueInput!]!) {
        updatePost(
          where: { slug: $slug }
          data: {
            category: { 
              set: $categories 
            }
          }
        ) {
          id
          category {
            name
            slug
          }
        }
      }
    `;
    
    const categoryResult = await request(apiEndpoint, categoryUpdateMutation, { 
      slug, 
      categories: categories.map(catSlug => ({ slug: catSlug }))
    }, authHeaders);
    
    console.log('Category update result:', categoryResult);
  } catch (categoryError) {
    console.error('Category update failed:', categoryError);
    // Don't throw - the main update succeeded
  }
}
    
    // Publish the updated post
    if (result.updatePost && result.updatePost.id) {
      try {
        await publishPost(result.updatePost.id);
        console.log('✅ Post updated and published successfully!');
      } catch (publishError) {
        console.error('⚠️ Post updated but failed to publish:', publishError);
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error updating post:', error);
    if (error.response && error.response.errors) {
      console.error('GraphQL errors:', JSON.stringify(error.response.errors, null, 2));
    }
    throw error;
  }
};

// DELETE POST
export const deletePost = async (slug) => {
  if (!contentAPI) {
    throw new Error('Content API endpoint not configured');
  }
  
  if (!authToken) {
    throw new Error('Auth token not configured');
  }
  
  console.log('Deleting post with slug:', slug);

  // Convert CDN endpoint to API endpoint if needed
  const apiEndpoint = contentAPI.includes('cdn.hygraph.com') 
    ? contentAPI.replace('us-west-2.cdn.hygraph.com/content', 'api-us-west-2.hygraph.com/v2')
    : contentAPI;

  const mutation = gql`
    mutation DeletePost($slug: String!) {
      deletePost(where: { slug: $slug }) {
        id
        slug
        title
      }
    }
  `;
  
  const variables = {
    slug
  };
  
  try {
    const result = await request(apiEndpoint, mutation, variables, authHeaders);
    console.log('✅ Post deleted successfully!');
    return result;
  } catch (error) {
    console.error('Error deleting post:', error);
    if (error.response && error.response.errors) {
      console.error('GraphQL errors:', JSON.stringify(error.response.errors, null, 2));
    }
    throw error;
  }
};