// In your pages/index.js file, update the Home component like this:

import Head from "next/head";
import { PostCard, Categories, PostWidget } from '../components/';
import { getPosts } from '../services/'

export default function Home({ posts }) {
  // Debug: Log posts to see which ones are missing featured images
  console.log('=== DEBUGGING POSTS ===');
  console.log('Total posts:', posts.length);
  
  posts.forEach((post, index) => {
    console.log(`\nPost ${index + 1}: ${post.node.title}`);
    console.log('- Slug:', post.node.slug);
    console.log('- Featured Image:', post.node.featuredImage);
    console.log('- Author:', post.node.author);
    
    if (!post.node.featuredImage) {
      console.log('❌ This post is missing a featured image!');
    } else if (!post.node.featuredImage.url) {
      console.log('❌ This post has featuredImage but no URL!');
    } else {
      console.log('✅ This post has a valid featured image');
    }
  });
  console.log('=== DEBUG COMPLETE ===');

  return (
    <div className="container mx-auto px-10 mb-8">
      <Head>
        <title>Rivergrove 1st Ward</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 col-span-1">
          {posts.map((post) => 
            <PostCard post={post.node} key={post.title} />
        )}
        </div>
        <div className = "lg:col-span-4 col-span-1">
          <div className="lg:sticky relative top-8">
            <PostWidget />
            <Categories />
          </div>
        </div>
      </div>
    </div>
  )
}

export async function getStaticProps() {
  const posts = (await getPosts()) || [];

  return {
    props: { posts }
  }
}