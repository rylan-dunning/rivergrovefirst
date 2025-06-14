import React from 'react'
import Head from 'next/head'

import { getPosts, getPostDetails } from '../../services'
import { PostDetail, Categories, PostWidget, Author } from '../../components';

const PostDetails = ({ post }) => {
    console.log(post);
    
    return (
        <div className="container mx-auto px-10 mb-8">
            <Head>
                <title>{post.title} - Rivergrove 1st Ward</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="col-span-1 lg:col-span-8">
                    <PostDetail post={post}/>
                    <Author author={post.author}/>
                </div>
                <div className="col-span-1 lg:col-span-4">
                    <div className="relative lg:sticky top-8">
                        <PostWidget slug={post.slug} categories={post.category.map((category) => category.slug)} />
                        <Categories />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PostDetails

export async function getStaticProps({ params }) {
    const data = await getPostDetails(params.slug)
    
    return {
        props: { post: data }
    }
}

export async function getStaticPaths() {
    const posts = await getPosts();

    return {
        paths: posts.map(({ node: { slug }}) => ({ params: { slug }})),
        fallback: false,
    }
}