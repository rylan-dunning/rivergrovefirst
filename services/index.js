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





// ERROR HANDLING



// Add this test function to try different image connection syntaxes

export const testImageConnectionSyntax = async () => {
  console.log('=== TESTING IMAGE CONNECTION SYNTAX ===');
  
  const contentEndpoint = process.env.NEXT_PUBLIC_GRAPHCMS_ENDPOINT;
  const authToken = process.env.NEXT_PUBLIC_GRAPHCMS_TOKEN;
  
  const apiEndpoint = contentEndpoint.includes('cdn.hygraph.com') 
    ? contentEndpoint.replace('us-west-2.cdn.hygraph.com/content', 'api-us-west-2.hygraph.com/v2')
    : contentEndpoint;
  
  // Use a known working image ID from your previous uploads
  const testImageId = "cmb6xvo7zelus07lqdweuza2w"; // Replace with your actual image ID
  
  const testMutation = {
    query: `
      mutation TestImageConnection(
        $title: String!,
        $slug: String!,
        $excerpt: String!,
        $content: RichTextAST!,
        $featuredImageId: ID!,
        $featuredPost: Boolean!,
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
    `,
    variables: {
      title: "Image Connection Test",
      slug: "image-connection-test-" + Date.now(),
      excerpt: "Testing image connection",
      content: {
        children: [
          {
            type: 'paragraph',
            children: [
              {
                text: 'Testing if image connects properly'
              }
            ]
          }
        ]
      },
      featuredImageId: testImageId,
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
      body: JSON.stringify(testMutation)
    });
    
    const result = await response.json();
    console.log('Image connection test result:', result);
    
    if (result.errors) {
      console.error('❌ Image connection failed:', result.errors);
    } else if (result.data?.createPost?.featuredImage) {
      console.log('✅ SUCCESS! Image connected properly');
      console.log('Connected image:', result.data.createPost.featuredImage);
    } else {
      console.log('🤔 Post created but no featured image in response');
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  console.log('=== IMAGE CONNECTION TEST COMPLETE ===');
};

// The error says "array of objects containing raw rich text values"
// This suggests each array item should have a "raw" property

// Add this debug function to your new post page to check if images are being connected properly

export const debugImageConnection = async () => {
  console.log('=== DEBUGGING IMAGE CONNECTION ===');
  
  // Check if the last post has a featured image
  const posts = await getPosts();
  const latestPost = posts[0]; // Should be newest first now
  
  console.log('Latest post:', latestPost.node.title);
  console.log('Featured Image:', latestPost.node.featuredImage);
  
  if (!latestPost.node.featuredImage) {
    console.error('❌ Latest post has no featured image!');
    console.error('This means the image connection failed during post creation');
  } else if (!latestPost.node.featuredImage.url) {
    console.error('❌ Latest post has featured image but no URL');
    console.error('Featured image object:', latestPost.node.featuredImage);
  } else {
    console.log('✅ Latest post has valid featured image');
    console.log('Image URL:', latestPost.node.featuredImage.url);
  }
  
  console.log('=== DEBUG COMPLETE ===');
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





///error handling for existing images

// Add this test function to your new post page to test connecting existing assets

export const testExistingAssetConnection = async () => {
  console.log('=== TESTING EXISTING ASSET CONNECTION ===');
  
  const contentEndpoint = process.env.NEXT_PUBLIC_GRAPHCMS_ENDPOINT;
  const authToken = process.env.NEXT_PUBLIC_GRAPHCMS_TOKEN;
  
  const apiEndpoint = contentEndpoint.includes('cdn.hygraph.com') 
    ? contentEndpoint.replace('us-west-2.cdn.hygraph.com/content', 'api-us-west-2.hygraph.com/v2')
    : contentEndpoint;
  
  // Use an existing published asset ID from your working posts
  const existingAssetId = "cm3m8olnzpw0n06my5338zbyp"; // From your Christmas post
  
  const testMutation = {
    query: `
      mutation TestExistingAsset(
        $title: String!,
        $slug: String!,
        $excerpt: String!,
        $content: RichTextAST!,
        $featuredImageId: ID!,
        $featuredPost: Boolean!,
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
    `,
    variables: {
      title: "Test Existing Asset",
      slug: "test-existing-asset-" + Date.now(),
      excerpt: "Testing existing asset connection",
      content: {
        children: [
          {
            type: 'paragraph',
            children: [
              {
                text: 'Testing with existing published asset'
              }
            ]
          }
        ]
      },
      featuredImageId: existingAssetId,
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
      body: JSON.stringify(testMutation)
    });
    
    const result = await response.json();
    console.log('Existing asset test result:', result);
    
    if (result.errors) {
      console.error('❌ Even existing asset failed:', result.errors);
    } else if (result.data?.createPost?.featuredImage) {
      console.log('✅ SUCCESS! Existing asset connected:', result.data.createPost.featuredImage);
      console.log('This confirms connection syntax works with published assets');
    } else {
      console.log('🤔 Post created but no featured image connected');
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  console.log('=== EXISTING ASSET TEST COMPLETE ===');
};