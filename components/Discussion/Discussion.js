import React, { Fragment, PureComponent } from 'react'
import { css } from 'glamor'
import withT from '../../lib/withT'
import { A, colors, fontStyles, mediaQueries } from '@project-r/styleguide'

import DiscussionCommentComposer from './DiscussionCommentComposer'
import NotificationOptions from './NotificationOptions'
import Comments from './Comments'

const styles = {
  orderByContainer: css({
    margin: '20px 0'
  }),
  orderBy: css({
    ...fontStyles.sansSerifRegular16,
    outline: 'none',
    color: colors.text,
    WebkitAppearance: 'none',
    background: 'transparent',
    border: 'none',
    padding: '0',
    cursor: 'pointer',
    marginRight: '20px',
    [mediaQueries.mUp]: {
      marginRight: '40px'
    }
  }),
  selectedOrderBy: css({
    textDecoration: 'underline'
  })
}

class Discussion extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      orderBy: 'DATE', // DiscussionOrder
      reload: 0,
      now: Date.now()
    }
  }

  componentDidMount () {
    this.intervalId = setInterval(() => {
      this.setState({ now: Date.now() })
    }, 30 * 1000)
  }

  componentWillUnmount () {
    clearInterval(this.intervalId)
  }

  render () {
    const { t, discussionId, focusId = null, mute, meta, sharePath } = this.props
    const { orderBy, reload, now } = this.state

    const OrderBy = ({ children, value }) => (
      <button {...styles.orderBy} {...(orderBy === value ? styles.selectedOrderBy : {})} onClick={() => {
        this.setState({ orderBy: value })
      }}>
        {t(`components/Discussion/OrderBy/${value}`)}
      </button>
    )

    return (
      <Fragment>
        <div data-discussion-id={discussionId}>
          <DiscussionCommentComposer
            discussionId={discussionId}
            orderBy={orderBy}
            focusId={focusId}
            depth={1}
            parentId={null}
            now={now}
          />

          <NotificationOptions discussionId={discussionId} mute={mute} />

          <div {...styles.orderByContainer}>
            <OrderBy value='DATE' />
            <OrderBy value='VOTES' />
            <OrderBy value='REPLIES' />
            <A style={{ float: 'right', lineHeight: '25px', cursor: 'pointer' }} href='' onClick={(e) => {
              e.preventDefault()
              this.setState(({ reload }) => ({ reload: reload + 1 }))
            }}>
              {t('components/Discussion/reload')}
            </A>
            <br style={{ clear: 'both' }} />
          </div>

          <Comments
            depth={1}
            key={orderBy}
            discussionId={discussionId}
            focusId={focusId}
            parentId={null}
            reload={reload}
            orderBy={orderBy}
            now={now}
            meta={meta}
            sharePath={sharePath}
          />
        </div>
      </Fragment>
    )
  }
}

export default withT(Discussion)
