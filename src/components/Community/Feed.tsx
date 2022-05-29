import { gql, useQuery } from '@apollo/client'
import SinglePost from '@components/Post/SinglePost'
import { EmptyState } from '@components/UI/EmptyState'
import { ErrorMessage } from '@components/UI/ErrorMessage'
import { Spinner } from '@components/UI/Spinner'
import { LensterPost } from '@generated/lenstertypes'
import { PaginatedResultInfo } from '@generated/types'
import { CommentFields } from '@gql/CommentFields'
import { CollectionIcon } from '@heroicons/react/outline'
import consoleLog from '@lib/consoleLog'
import { useRouter } from 'next/router'
import React, { FC, useState, useMemo } from 'react'
import { useInView } from 'react-cool-inview'

const COMMENT_FEED_QUERY = gql`
  query CommentFeed($request: PublicationsQueryRequest!) {
    publications(request: $request) {
      items {
        ... on Comment {
          ...CommentFields
        }
      }
      pageInfo {
        totalCount
        next
      }
    }
  }
  ${CommentFields}
`

interface Props {
  post: LensterPost
  sortCriteria: String
}

const Feed: FC<Props> = ({ post, sortCriteria }) => {
  const {
    query: { id }
  } = useRouter()
  const [pageInfo, setPageInfo] = useState<PaginatedResultInfo>()
  const { data, loading, error, fetchMore } = useQuery(COMMENT_FEED_QUERY, {
    variables: {
      request: { commentsOf: id, limit: 10 }
    },
    skip: !id,
    fetchPolicy: 'no-cache',
    onCompleted(data) {
      console.log('COMMENT_FEED_QUERY', data.publications)
      setPageInfo(data?.publications?.pageInfo)
      consoleLog(
        'Query',
        '#8b5cf6',
        `Fetched first 10 comments of Publication:${id}`
      )
    }
  })

  const { observe } = useInView({
    onEnter: () => {
      console.log('post', post)
      fetchMore({
        variables: {
          request: {
            commentsOf: post?.id,
            cursor: pageInfo?.next,
            limit: 10
          }
        }
      }).then(({ data }: any) => {
        setPageInfo(data?.publications?.pageInfo)
        consoleLog(
          'Query',
          '#8b5cf6',
          `Fetched next 10 comments of Publication:${id} Next:${pageInfo?.next}`
        )
      })
    }
  })

  const links = useMemo(() => {
    if (!data) return
    return data.publications.items.sort((a: any, b: any) => {
      if (sortCriteria == 'LATEST')
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sortCriteria == 'TOP')
        return b.stats.totalAmountOfMirrors - a.stats.totalAmountOfMirrors
    })
  }, [data, sortCriteria])

  return (
    <>
      {loading && (
        <div className="flex flex-grow justify-center items-center h-screen animate-pulse">
          <span className="flex justify-center p-5">
            <Spinner size="sm" />
          </span>
        </div>
      )}
      {links?.items?.length === 0 && (
        <EmptyState
          message={<span>Be the first one to comment!</span>}
          icon={<CollectionIcon className="w-8 h-8 text-brand" />}
        />
      )}
      <ErrorMessage title="Failed to load comment feed" error={error} />
      {!error && !loading && (
        <>
          <div className="space-y-3">
            {links?.map((post: LensterPost, index: number) => (
              <SinglePost
                key={`${post?.id}_${index}`}
                index={index}
                post={post}
                hideType={false}
              />
            ))}
          </div>
          {pageInfo?.next && links?.items?.length !== pageInfo?.totalCount && (
            <span ref={observe} className="flex justify-center p-5">
              <Spinner size="sm" />
            </span>
          )}
        </>
      )}
    </>
  )
}

export default Feed
