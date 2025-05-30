// services/index.js - Read-only version
import { request, gql } from 'graphql-request';

// Use your public CDN endpoint (no auth token needed for published content)
const graphqlAPI = process.env.NEXT_PUBLIC_GRAPHCMS_ENDPOINT;

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
  
  const result = await request(graphqlAPI, query);
  return result.postsConnection.edges;
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
  
  const result = await request(graphqlAPI, query);
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
  const result = await request(graphqlAPI, query, variables);
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
  const result = await request(graphqlAPI, query, variables);
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
  
  const result = await request(graphqlAPI, query);
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
  const result = await request(graphqlAPI, query, variables);
  return result.postsConnection.edges;
};