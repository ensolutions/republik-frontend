import React from 'react'
import { CommentTeaser, Interaction } from '@project-r/styleguide'
import timeago from '../../lib/timeago'
import withT from '../../lib/withT'
import { CommentLink } from '../Feedback/LatestComments'

const Comments = ({ t, comments }) => {
  if (!comments || !comments.totalCount) {
    return null
  }
  const timeagoFromNow = createdAtString => {
    return timeago(t, (new Date() - Date.parse(createdAtString)) / 1000)
  }
  return (
    <div>
      <Interaction.H3 style={{ marginBottom: 20 }}>
        {t.pluralize('profile/comments/title', {
          count: comments.totalCount
        })}
      </Interaction.H3>
      {comments.nodes.filter(comment => comment.content).map((comment) => {
        const discussion = comment.discussion || {}
        const context = {
          title: discussion.title
        }
        return (
          <CommentTeaser
            key={comment.id}
            id={comment.id}
            context={context}
            preview={comment.preview}
            createdAt={comment.createdAt}
            tags={comment.tags}
            parentIds={comment.parentIds}
            discussion={discussion}
            timeago={timeagoFromNow}
            Link={CommentLink}
            t={t}
          />
        )
      })}
    </div>
  )
}

export default withT(Comments)
