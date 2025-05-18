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

  // Create a new post
export const createPost = async (postData) => {
    const token = localStorage.getItem('token'); // You'll need to store this after login
    
    const mutation = gql`
      mutation CreatePost(
        $title: String!,
        $excerpt: String!,
        $content: RichTextAST!,
        $featuredImage: String!,
        $categories: [String!]!,
        $author: String!
      ) {
        createPost(
          data: {
            title: $title,
            excerpt: $excerpt,
            content: { raw: $content },
            featuredImage: { connect: { id: $featuredImage } },
            category: { connect: $categories },
            author: { connect: { id: $author } }
          }
        ) {
          id
          slug
        }
      }
    `;
    
    const variables = {
      title: postData.title,
      excerpt: postData.excerpt,
      content: postData.content,
      featuredImage: postData.featuredImage,
      categories: postData.categories.map(slug => ({ slug })),
      author: postData.author
    };
    
    const headers = {
      Authorization: `Bearer ${token}`
    };
    
    const result = await request(graphqlAPI, mutation, variables, headers);
    return result;
  };
  
  // Update an existing post
  export const updatePost = async (slug, postData) => {
    const token = localStorage.getItem('token');
    
    const mutation = gql`
      mutation UpdatePost(
        $slug: String!,
        $title: String!,
        $excerpt: String!,
        $content: RichTextAST!,
        $featuredImage: String!,
        $categories: [String!]!
      ) {
        updatePost(
          where: { slug: $slug },
          data: {
            title: $title,
            excerpt: $excerpt,
            content: { raw: $content },
            featuredImage: { connect: { id: $featuredImage } },
            category: { connect: $categories }
          }
        ) {
          id
          slug
        }
      }
    `;
    
    const variables = {
      slug,
      title: postData.title,
      excerpt: postData.excerpt,
      content: postData.content,
      featuredImage: postData.featuredImage,
      categories: postData.categories.map(slug => ({ slug }))
    };
    
    const headers = {
      Authorization: `Bearer ${token}`
    };
    
    const result = await request(graphqlAPI, mutation, variables, headers);
    return result;
  };
  
  // Delete a post
  export const deletePost = async (slug) => {
    const token = localStorage.getItem('token');
    
    const mutation = gql`
      mutation DeletePost($slug: String!) {
        deletePost(where: { slug: $slug }) {
          id
        }
      }
    `;
    
    const variables = { slug };
    
    const headers = {
      Authorization: `Bearer ${token}`
    };
    
    const result = await request(graphqlAPI, mutation, variables, headers);
    return result;
  };