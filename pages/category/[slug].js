// pages/category/[slug].js
import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { PostCard, Categories, PostWidget } from '../../components';
import { getCategories, getCategoryPost } from '../../services';

const CategoryPost = ({ posts }) => {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-10 mb-8">
      <Head>
        <title>{router.query.slug} - Rivergrove 1st Ward</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 col-span-1">
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard post={post.node} key={post.node.title} />
            ))
          ) : (
            <div className="bg-white shadow-lg rounded-lg p-8 mb-8">
              No posts found in this category.
            </div>
          )}
        </div>
        <div className="lg:col-span-4 col-span-1">
          <div className="lg:sticky relative top-8">
            <PostWidget />
            <Categories />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPost;

export async function getStaticProps({ params }) {
  const posts = await getCategoryPost(params.slug);

  return {
    props: { posts },
  };
}

export async function getStaticPaths() {
  const categories = await getCategories();
  
  return {
    paths: categories.map(({ slug }) => ({ params: { slug } })),
    fallback: true,
  };
}