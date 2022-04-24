import 'linkify-plugin-mention'
import 'linkify-plugin-hashtag'
import { LensterPost } from '@generated/lenstertypes'
import linkifyOptions from '@lib/linkifyOptions'
import clsx from 'clsx'
import Linkify from 'linkify-react'
import { useRouter } from 'next/router'
import React, { FC, useState } from 'react'

interface Props {
  post: LensterPost
}

const PostBody: FC<Props> = ({ post }) => {
  const { pathname } = useRouter()
  const [showMore, setShowMore] = useState<boolean>(
    post?.metadata?.content?.length > 250
  )

  return (
    <div className="break-words">
      <Linkify tagName="div" options={linkifyOptions}>
        <div
          className={clsx({
            'line-clamp-5 text-transparent bg-clip-text bg-gradient-to-b from-black dark:from-white to-gray-400 dark:to-gray-900':
              showMore && pathname !== '/posts/[id]'
          })}
        >
          <a
            target="_blank"
            rel="noreferrer"
            href={
              post?.metadata?.description ? post?.metadata?.description : ''
            }
            className="leading-7 whitespace-pre-wrap break-words linkify"
          >
            {post?.metadata?.content?.replace(/\n\s*\n/g, '\n\n').trim()}
            {post?.metadata?.description&&<span className='text-sm ml-2 hover:underline text-gray-500'>{'('+ post?.metadata?.description+')'}</span>}
          </a>
        </div>
        {showMore && pathname !== '/posts/[id]' && (
          <button
            type="button"
            className="mt-2 text-sm font-bold"
            onClick={() => setShowMore(!showMore)}
          >
            Show more
          </button>
        )}
      </Linkify>
    </div>
  )
}

export default PostBody
