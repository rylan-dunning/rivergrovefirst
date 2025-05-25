// services/index.js - Updated with proper authentication
import { request, gql } from 'graphql-request';

// Use content API for read operations
const contentAPI = process.env.NEXT_PUBLIC_GRAPHCMS_ENDPOINT;

// Use management API for create/update/delete operations
const managementAPI = process.env.NEXT_PUBLIC_GRAPHCMS_MANAGEMENT_ENDPOINT;

// Auth token
const authToken = process.env.NEXT_PUBLIC_GRAPHCMS_TOKEN;

// Headers with authentication
const authHeaders = {
  Authorization: `Bearer ${authToken}`
};

// Read operations (no authentication required for public content)
export const getPosts = async () => {
  const query = gql`
    query MyQuery {
      postsConnection {
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
  
  const result = await request(contentAPI, query);
  return result.postsConnection.edges;
};

export const getRecentPosts = async () => {
  const query = gql`
    query getPostDetails {
      posts(
        orderBy: createdAt_ASC
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

export const getPostDetails = async (slug) => {
  const query = gql`
    query GetPostDetails($slug : String!) {
      post(where: {slug: $slug }) {
        author {
          bio
          name
          id
          email
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
  const result = await request(contentAPI, query, variables);
  return result.post;
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

// Mutation operations (require authentication)
export const createPost = async (postData) => {
  const { title, excerpt, content, featuredImageId, categories, authorId } = postData;
  
  console.log('Creating post with data:', {
    title,
    excerpt,
    contentLength: content?.length,
    featuredImageId,
    categories,
    authorId
  });

  const mutation = gql`
    mutation CreatePost(
      $title: String!,
      $excerpt: String!,
      $content: RichTextAST!,
      $featuredImageId: ID!,
      $categories: [CategoryWhereUniqueInput!]!,
      $authorId: ID!
    ) {
      createPost(
        data: {
          title: $title,
          excerpt: $excerpt,
          content: { 
            json: $content 
          },
          featuredImage: { 
            connect: { id: $featuredImageId } 
          },
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
      }
    }
  `;
  
  // Prepare content as RichTextAST
  const contentJson = {
    children: [
      {
        type: 'paragraph',
        children: [
          {
            text: content,
          },
        ],
      },
    ],
  };
  
  // Prepare categories for connection
  const categoryConnections = categories.map(slug => ({ 
    slug 
  }));
  
  const variables = {
    title,
    excerpt,
    content: contentJson,
    featuredImageId,
    categories: categoryConnections,
    authorId,
  };
  
  try {
    console.log('Making GraphQL mutation to:', managementAPI);
    const result = await request(managementAPI, mutation, variables, authHeaders);
    console.log('Create post result:', result);
    return result;
  } catch (error) {
    console.error('Error creating post:', error);
    if (error.response && error.response.errors) {
      console.error('GraphQL errors:', JSON.stringify(error.response.errors, null, 2));
    }
    throw error;
  }
};

export const updatePost = async (slug, postData) => {
  const { title, excerpt, content, featuredImageId, categories } = postData;
  
  const mutation = gql`
    mutation UpdatePost(
      $slug: String!,
      $title: String!,
      $excerpt: String!,
      $content: RichTextAST!,
      $featuredImageId: ID!,
      $categories: [CategoryWhereUniqueInput!]!
    ) {
      updatePost(
        where: { slug: $slug },
        data: {
          title: $title,
          excerpt: $excerpt,
          content: { 
            json: $content 
          },
          featuredImage: { 
            connect: { id: $featuredImageId } 
          },
          category: { 
            connect: $categories 
          }
        }
      ) {
        id
        slug
        title
      }
    }
  `;
  
  // Prepare content as RichTextAST
  const contentJson = {
    children: [
      {
        type: 'paragraph',
        children: [
          {
            text: content,
          },
        ],
      },
    ],
  };
  
  // Prepare categories for connection
  const categoryConnections = categories.map(slug => ({ 
    slug 
  }));
  
  const variables = {
    slug,
    title,
    excerpt,
    content: contentJson,
    featuredImageId,
    categories: categoryConnections,
  };
  
  try {
    const result = await request(managementAPI, mutation, variables, authHeaders);
    return result;
  } catch (error) {
    console.error('Error updating post:', error);
    if (error.response && error.response.errors) {
      console.error('GraphQL errors:', JSON.stringify(error.response.errors, null, 2));
    }
    throw error;
  }
};

export const deletePost = async (slug) => {
  const mutation = gql`
    mutation DeletePost($slug: String!) {
      deletePost(where: { slug: $slug }) {
        id
        title
      }
    }
  `;
  
  const variables = { slug };
  
  try {
    const result = await request(managementAPI, mutation, variables, authHeaders);
    return result;
  } catch (error) {
    console.error('Error deleting post:', error);
    if (error.response && error.response.errors) {
      console.error('GraphQL errors:', JSON.stringify(error.response.errors, null, 2));
    }
    throw error;
  }
};

// Get author ID by email
export const getAuthorIdByEmail = async (email) => {
  const query = gql`
    query GetAuthorByEmail($email: String!) {
      author(where: { email: $email }) {
        id
        name
      }
    }
  `;
  
  const variables = { email };
  
  try {
    // This query may need authentication if authors are not public
    const result = await request(contentAPI, query, variables, authHeaders);
    return result.author?.id;
  } catch (error) {
    console.error('Error getting author ID:', error);
    throw error;
  }
};