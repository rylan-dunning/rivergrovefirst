import { request, gql } from 'graphql-request';

const graphqlAPI = process.env.NEXT_PUBLIC_GRAPHCSM_ENDPOINT;

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
                        }
                        category {
                            name
                            slug
                        }
                    }
                }
            }
        }
    `
    const result = await request(graphqlAPI, query);
    

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
    `
    const result = await request(graphqlAPI, query);

    return result.posts;
}

export const getSimilarPosts = async ( categories, slug ) => {
    const query = gql`
        query GetPostDetails($slug: String!, $category: [String!]) {
            posts(
                where: { slug_not: $slug, AND: { category_some: { slug_in: $category}}} 
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
    const result = await request(graphqlAPI, query, { categories, slug });

    return result.posts;
}
// 
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

    const result = await request(graphqlAPI, query, { slug });
    
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
    `
    const result = await request(graphqlAPI, query);

    return result.categories;
}

// Add this function to services/index.js
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
  
    const result = await request(graphqlAPI, query, { slug });
  
    return result.postsConnection.edges;
  };