// Replace your components/PostDetail.jsx with this version that handles missing images

import React from 'react'
import moment from 'moment';

const PostDetail = ({ post }) => {

    const getContentFragment = (index, text, obj, type) => {
        let modifiedText = text;
    
        if (obj) {
          if (obj.bold) {
            modifiedText = (<b key={index}>{text}</b>);
          }
    
          if (obj.italic) {
            modifiedText = (<em key={index}>{text}</em>);
          }
    
          if (obj.underline) {
            modifiedText = (<u key={index}>{text}</u>);
          }
        }
    
        switch (type) {
          case 'heading-three':
            return <h3 key={index} className="text-xl font-semibold mb-4">{modifiedText.map((item, i) => <React.Fragment key={i}>{item}</React.Fragment>)}</h3>;
          case 'paragraph':
            return <p key={index} className="mb-8">{modifiedText.map((item, i) => <React.Fragment key={i}>{item}</React.Fragment>)}</p>;
          case 'heading-four':
            return <h4 key={index} className="text-md font-semibold mb-4">{modifiedText.map((item, i) => <React.Fragment key={i}>{item}</React.Fragment>)}</h4>;
          case 'image':
            return (
              <img
                key={index}
                alt={obj.title}
                height={obj.height}
                width={obj.width}
                src={obj.src}
              />
            );
          default:
            return modifiedText;
        }
      };

  return (
    
    <div className="bg-white shadow-lg rounded-lg lg:p-8 pb-12 mb-8">
        {/* Handle missing featured image */}
        {post.featuredImage && post.featuredImage.url ? (
          <div className='relative overflow-hidden shadow-md mb-6'>
              <img
                  src={post.featuredImage.url}
                  alt={post.title}
                  className="object-top h-full w-full rounded-t-lg"
              />
          </div>
        ) : (
          <div className='relative overflow-hidden shadow-md mb-6 bg-gray-200 rounded-t-lg' style={{height: '300px'}}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-gray-500 text-center">
                  <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2 text-lg">No Featured Image</p>
                </div>
              </div>
          </div>
        )}
        
        <div className="px-4 lg:px-0">
            <div className="flex items-center mb-8">
                <div className="flex items-center mb-4 lg:mb-0 w-full lg:w-auto mr-8">
                    {/* Handle missing author photo */}
                    {post.author?.photo?.url ? (
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
            <h1 className="mb-8 text-3xl font-semibold">{post.title}</h1>
            {post.content?.raw?.children?.map((typeObj, index) => {
                const children = typeObj.children.map((item, itemIndex) => getContentFragment(itemIndex, item.text, item))
            
                return getContentFragment(index, children, typeObj, typeObj.type)
            })}
        </div>
    </div>
  )
}

export default PostDetail