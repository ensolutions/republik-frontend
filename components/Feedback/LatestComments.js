import React, { Component } from 'react'
import { compose } from 'react-apollo'
import { withComments } from './enhancers'
import withT from '../../lib/withT'
import timeago from '../../lib/timeago'

import { Link } from '../../lib/routes'
import PathLink from '../Link/Path'

import { GENERAL_FEEDBACK_DISCUSSION_ID } from '../../lib/constants'

import { CommentTeaser, Loader } from '@project-r/styleguide'

export const CommentLink = ({
  displayAuthor,
  commentId,
  children,
  discussion
}) => {
  let tab
  if (discussion) {
    if (discussion.document) {
      const meta = discussion.document.meta || {}
      const ownDiscussion = meta.ownDiscussion && !meta.ownDiscussion.closed
      const template = meta.template
      tab = ownDiscussion && template === 'article' && 'article'
    } else {
      tab = discussion.id === GENERAL_FEEDBACK_DISCUSSION_ID && 'general'
    }
  }
  if (displayAuthor && displayAuthor.username) {
    return (
      <Link
        route='profile'
        params={{ slug: displayAuthor.username }}
      >
        {children}
      </Link>
    )
  }
  if (tab) {
    return (
      <Link
        route='discussion'
        params={{ t: tab, id: discussion ? discussion.id : undefined, focus: commentId }}
        passHref
      >
        {children}
      </Link>
    )
  }
  if (discussion) {
    const focus = commentId
    const path = discussion &&
      discussion.document &&
      discussion.document.meta &&
      discussion.document.meta.path
    if (path) {
      return (
        <PathLink
          path={path}
          query={{ focus }}
          passHref
        >
          {children}
        </PathLink>
      )
    }
    return (
      <Link
        route='discussion'
        params={{ id: discussion.id, focus }}
      >
        {children}
      </Link>
    )
  }
  return children
}

class LatestComments extends Component {
  render () {
    const { t, data } = this.props

    const timeagoFromNow = createdAtString => {
      return timeago(t, (new Date() - Date.parse(createdAtString)) / 1000)
    }

    return (
      <Loader
        loading={data.loading}
        error={data.error}
        render={() => {
          const { comments } = data
          return (
            <div>
              {comments && comments.nodes
                .map(
                  node => {
                    const {
                      id,
                      discussion,
                      preview,
                      displayAuthor,
                      published,
                      createdAt,
                      updatedAt,
                      tags,
                      parentIds
                    } = node
                    const meta = (discussion && discussion.document && discussion.document.meta) || {}
                    const isGeneral = discussion.id === GENERAL_FEEDBACK_DISCUSSION_ID
                    const newPage = !isGeneral && meta.template === 'discussion'

                    return (
                      <CommentTeaser
                        key={id}
                        id={id}
                        t={t}
                        displayAuthor={displayAuthor}
                        preview={preview}
                        published={published}
                        createdAt={createdAt}
                        updatedAt={updatedAt}
                        timeago={timeagoFromNow}
                        tags={tags}
                        parentIds={parentIds}
                        Link={CommentLink}
                        discussion={discussion}
                        newPage={newPage}
                      />
                    )
                  }
                )}
            </div>
          )
        }} />
    )
  }
}

export default compose(
  withT,
  withComments
)(LatestComments)
