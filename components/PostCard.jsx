// Replace your components/PostCard.jsx with this version that handles missing images

import React from 'react';
import moment from 'moment';
import Link from 'next/link';

const PostCard = ({ post }) => {
  console.log(post);

  return (
    <div className="bg-white shadow-lg rounded-lg p-0 lg:p-8 pb-12 mb-8">
        {/* Only show image if featuredImage exists */}
        {post.featuredImage && post.featuredImage.url ? (
          <div className="relative overflow-hidden shadow-md pb-80 mb-6">
            <img 
              src={post.featuredImage.url} 
              alt={post.title} 
              className="object-top absolute h-80 w-full object-cover shadow-lg rounded-t-lg lg:rounded-lg"
            />
          </div>
        ) : (
          <div className="relative overflow-hidden shadow-md pb-80 mb-6 bg-gray-200 rounded-t-lg lg:rounded-lg">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-gray-500 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-2 text-sm">No Image</p>
              </div>
            </div>
          </div>
        )}
        
        <h1 className="transition duration-500 text-center mb-8 cursor-pointer hover:text-pink-600 text-3xl font-semibold">
          <Link href={`/post/${post.slug}`}>
            {post.title}
          </Link>
        </h1>
        
        <div className='block lg:flex text-center items-center justify-center mb-8 w-full'>
          <div className="flex items-center justify-center mb-4 lg:mb-0 w-full lg:w-auto mr-8">
            {/* Handle missing author photo */}
            {post.author && post.author.photo && post.author.photo.url ? (
              <img 
                alt={post.author.name} 
                height="30px" 
                width="30px" 
                className="align-middle rounded-full" 
                src={post.author.photo.url}
              />
            ) : (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-sm font-bold">
                  {post.author?.name?.charAt(0) || '?'}
                </span>
              </div>
            )}
            <p className="inline align-middle text-gray-700 ml-2 text-lg">
              {post.author?.name || 'Unknown Author'}
            </p>
          </div>
          
          <div className="font-medium text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline mr-2 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="align-middle">{moment(post.createdAt).format('MMM DD, YYYY')}</span>
          </div>
        </div>
        
        <p className="text-center text-lg text-gray-700 font-normal px-4 lg:px-20 mb-8">{post.excerpt}</p>
        
        <div className="text-center">
          <Link href={`/post/${post.slug}`}>
            <span className="transition duration-500 transform hover:-translate-y-1 inline-block bg-pink-600 text-lg font-medium rounded-full text-white px-8 py-3 cursor-pointer">Continue Reading</span>
          </Link>
        </div>
    </div>
  )
}

export default PostCard;