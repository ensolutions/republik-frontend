import React, { Component, Fragment } from 'react'
import { css, merge } from 'glamor'
import { compose } from 'react-apollo'
import { withRouter } from 'next/router'

import withT from '../../lib/withT'
import withInNativeApp, { postMessage } from '../../lib/withInNativeApp'
import { Router } from '../../lib/routes'

import { AudioPlayer, Logo, colors, mediaQueries } from '@project-r/styleguide'

import { withMembership } from '../Auth/checkRoles'

import Toggle from './Toggle'
import User from './User'
import Popover from './Popover'
import NavBar, { getNavBarStateFromRouter } from './NavBar'
import NavPopover from './Popover/Nav'
import LoadingBar from './LoadingBar'
import Pullable from './Pullable'

import Search from 'react-icons/lib/md/search'
import BackIcon from '../Icons/Back'

import { shouldIgnoreClick } from '../Link/utils'

import {
  HEADER_HEIGHT,
  HEADER_HEIGHT_MOBILE,
  NAVBAR_HEIGHT,
  NAVBAR_HEIGHT_MOBILE,
  ZINDEX_HEADER,
  LOGO_WIDTH,
  LOGO_PADDING,
  LOGO_WIDTH_MOBILE,
  LOGO_PADDING_MOBILE
} from '../constants'
import { negativeColors } from './constants'

const SEARCH_BUTTON_WIDTH = 28

const styles = {
  bar: css({
    zIndex: ZINDEX_HEADER,
    position: 'fixed',
    '@media print': {
      position: 'absolute'
    },
    top: 0,
    left: 0,
    right: 0
  }),
  barOpaque: css({
    height: HEADER_HEIGHT_MOBILE,
    [mediaQueries.mUp]: {
      height: HEADER_HEIGHT
    },
    '@media print': {
      backgroundColor: 'transparent'
    }
  }),
  center: css({
    margin: '0 auto 0',
    padding: '0 60px',
    textAlign: 'center',
    transition: 'opacity .2s ease-in-out'
  }),
  logo: css({
    position: 'relative',
    display: 'inline-block',
    padding: LOGO_PADDING_MOBILE,
    width: LOGO_WIDTH_MOBILE + LOGO_PADDING_MOBILE * 2,
    [mediaQueries.mUp]: {
      padding: LOGO_PADDING,
      width: LOGO_WIDTH + LOGO_PADDING * 2
    },
    verticalAlign: 'middle'
  }),
  leftItem: css({
    '@media print': {
      display: 'none'
    },
    transition: 'opacity .2s ease-in-out'
  }),
  back: css({
    display: 'block',
    position: 'absolute',
    left: 0,
    top: -1,
    padding: '10px 10px 10px 15px',
    [mediaQueries.mUp]: {
      top: -1 + 8
    }
  }),
  hamburger: css({
    '@media print': {
      display: 'none'
    },
    position: 'absolute',
    overflow: 'hidden',
    top: 0,
    right: 0,
    display: 'inline-block',
    height: HEADER_HEIGHT_MOBILE - 2,
    width: HEADER_HEIGHT_MOBILE - 2 + 5,
    [mediaQueries.mUp]: {
      height: HEADER_HEIGHT - 2,
      width: HEADER_HEIGHT - 2 + 5
    }
  }),
  search: css({
    outline: 'none',
    WebkitAppearance: 'none',
    background: 'transparent',
    border: 'none',
    padding: '0',
    cursor: 'pointer',
    '@media print': {
      display: 'none'
    },
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    overflow: 'hidden',
    top: 0,
    right: HEADER_HEIGHT_MOBILE - 1,
    height: HEADER_HEIGHT_MOBILE - 2,
    width: SEARCH_BUTTON_WIDTH,
    [mediaQueries.mUp]: {
      height: HEADER_HEIGHT - 2,
      width: HEADER_HEIGHT - 2 - 10,
      right: HEADER_HEIGHT - 2 + 5
    }
  }),
  secondary: css({
    position: 'absolute',
    top: 0,
    left: 15,
    display: 'inline-block',
    height: HEADER_HEIGHT_MOBILE,
    right: `${HEADER_HEIGHT_MOBILE + SEARCH_BUTTON_WIDTH}px`,
    paddingTop: '10px',
    [mediaQueries.mUp]: {
      height: HEADER_HEIGHT,
      right: `${HEADER_HEIGHT + HEADER_HEIGHT}px`,
      paddingTop: '18px'
    },
    transition: 'opacity .2s ease-in-out'
  }),
  sticky: css({
    position: 'sticky'
  }),
  stickyWithFallback: css({
    // auto prefix does not with multiple values :(
    // - -webkit-sticky would be missing if not defined explicitly
    // - glamor 2.20.40 / inline-style-prefixer 3.0.8
    position: ['fixed', '-webkit-sticky', 'sticky']
    // - this will produce three position statements
    // { position: fixed; position: -webkit-sticky; position: sticky; }
  }),
  hr: css({
    margin: 0,
    display: 'block',
    border: 0,
    width: '100%',
    zIndex: ZINDEX_HEADER
  }),
  hrThin: css({
    height: 1,
    top: HEADER_HEIGHT_MOBILE - 1,
    [mediaQueries.mUp]: {
      top: HEADER_HEIGHT - 1
    }
  }),
  hrThick: css({
    height: 3,
    top: HEADER_HEIGHT_MOBILE - 3,
    [mediaQueries.mUp]: {
      top: HEADER_HEIGHT - 3
    }
  }),
  hrFixedAfterNavBar: css({
    position: 'fixed',
    marginTop: NAVBAR_HEIGHT_MOBILE,
    [mediaQueries.mUp]: {
      marginTop: NAVBAR_HEIGHT
    }
  })
}

const isPositionStickySupported = () => {
  const style = document.createElement('a').style
  style.cssText = 'position:sticky;position:-webkit-sticky;'
  return style.position.indexOf('sticky') !== -1
}

// Workaround for WKWebView fixed 0 rendering hickup
// - iOS 11.4: header is transparent and only appears after triggering a render by scrolling down enough
const forceRefRedraw = ref => {
  if (ref) {
    const redraw = () => {
      const display = ref.style.display
      // offsetHeight
      ref.style.display = 'none'
      /* eslint-disable-next-line no-unused-expressions */
      ref.offsetHeight // this force webkit to flush styles (render them)
      ref.style.display = display
    }
    const msPerFrame = 1000 / 30 // assuming 30 fps
    const frames = [1, 10, 20, 30]
    // force a redraw on frame x after initial dom mount
    frames.forEach(frame => {
      setTimeout(redraw, msPerFrame * frame)
    })
  }
}

const hasBackButton = props => (
  props.inNativeIOSApp &&
  props.me &&
  !getNavBarStateFromRouter(props.router).hasActiveLink
)

let routeChangeStarted

class Header extends Component {
  constructor (props) {
    super(props)

    this.state = {
      opaque: !this.props.cover,
      mobile: false,
      expanded: false,
      backButton: hasBackButton(props)
    }

    this.onScroll = () => {
      const y = window.pageYOffset

      const yOpaque = this.state.mobile ? 70 : 150
      const opaque = y > yOpaque || !this.props.cover
      if (opaque !== this.state.opaque) {
        this.setState(() => ({ opaque }))
      }
    }

    this.measure = () => {
      const mobile = window.innerWidth < mediaQueries.mBreakPoint
      if (mobile !== this.state.mobile) {
        this.setState(() => ({ mobile }))
      }
      this.onScroll()
    }

    this.close = () => {
      this.setState({ expanded: false })
    }
  }

  componentDidMount () {
    window.addEventListener('scroll', this.onScroll)
    window.addEventListener('resize', this.measure)
    this.measure()

    const withoutSticky = !isPositionStickySupported()
    if (withoutSticky) {
      this.setState({ withoutSticky })
    }
  }

  componentDidUpdate () {
    this.measure()
  }

  componentWillUnmount () {
    window.removeEventListener('scroll', this.onScroll)
    window.removeEventListener('resize', this.measure)
  }

  componentWillReceiveProps (nextProps) {
    const backButton = hasBackButton(nextProps)
    if (this.state.backButton !== backButton) {
      this.setState({
        backButton
      })
    }
  }

  render () {
    const {
      router,
      t,
      me,
      cover,
      secondaryNav,
      showSecondary,
      onPrimaryNavExpandedChange,
      primaryNavExpanded,
      formatColor,
      audioSource,
      audioCloseHandler,
      inNativeApp,
      inNativeIOSApp,
      isMember
    } = this.props
    const { withoutSticky, backButton } = this.state

    // If onPrimaryNavExpandedChange is defined, expanded state management is delegated
    // up to the higher-order component. Otherwise it's managed inside the component.
    const expanded = !!(onPrimaryNavExpandedChange
      ? primaryNavExpanded
      : this.state.expanded
    )
    const secondaryVisible = showSecondary && !expanded
    const dark = this.props.dark && !expanded

    const opaque = this.state.opaque || expanded
    const barStyle = opaque ? merge(styles.bar, styles.barOpaque) : styles.bar

    const bgStyle = opaque ? {
      backgroundColor: dark ? negativeColors.primaryBg : '#fff'
    } : undefined
    const hrColor = dark ? negativeColors.containerBg : colors.divider
    const hrColorStyle = {
      color: hrColor,
      backgroundColor: hrColor
    }
    const textFill = dark ? negativeColors.text : colors.text
    const logoFill = dark ? '#fff' : '#000'

    const showNavBar = isMember

    const toggleExpanded = () => {
      if (onPrimaryNavExpandedChange) {
        onPrimaryNavExpandedChange(!expanded)
      } else {
        this.setState({ expanded: !expanded })
      }
    }

    return (
      <Fragment>
        <div {...barStyle} ref={inNativeIOSApp ? forceRefRedraw : undefined} style={bgStyle}>
          {opaque && <Fragment>
            <div {...styles.center} style={{ opacity: secondaryVisible ? 0 : 1 }}>
              <a
                {...styles.logo}
                aria-label={t('header/logo/magazine/aria')}
                href={'/'}
                onClick={e => {
                  if (shouldIgnoreClick(e)) {
                    return
                  }
                  e.preventDefault()
                  if (router.pathname === '/') {
                    window.scrollTo(0, 0)
                    if (expanded) {
                      toggleExpanded()
                    }
                  } else {
                    Router.pushRoute('index').then(() => window.scrollTo(0, 0))
                  }
                }}
              >
                <Logo fill={logoFill} />
              </a>
            </div>
            <div {...styles.leftItem} style={{
              opacity: (secondaryVisible || backButton) ? 0 : 1
            }}>
              <User
                dark={dark}
                me={me}
                title={t(`header/nav/${expanded ? 'close' : 'open'}/aria`)}
                onClick={toggleExpanded}
              />
            </div>
            {inNativeIOSApp && <a
              style={{
                opacity: backButton ? 1 : 0,
                pointerEvents: backButton ? undefined : 'none',
                href: '#back'
              }}
              title={t('header/back')}
              onClick={(e) => {
                e.preventDefault()
                if (backButton) {
                  routeChangeStarted = false
                  window.history.back()
                  setTimeout(
                    () => {
                      if (!routeChangeStarted) {
                        Router.replaceRoute(
                          'feed'
                        ).then(() => window.scrollTo(0, 0))
                      }
                    },
                    200
                  )
                }
              }}
              {...styles.leftItem} {...styles.back}>
              <BackIcon size={25} fill={textFill} />
            </a>}
            {secondaryNav && !audioSource && (
              <div {...styles.secondary} style={{
                left: backButton ? 40 : undefined,
                opacity: secondaryVisible ? 1 : 0,
                pointerEvents: secondaryVisible ? undefined : 'none'
              }}>
                {secondaryNav}
              </div>
            )}
            {isMember && <button
              {...styles.search}
              role='button'
              title={t('header/nav/search/aria')}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (router.pathname === '/search') {
                  window.scrollTo(0, 0)
                } else {
                  Router.pushRoute('search').then(() => window.scrollTo(0, 0))
                }
              }}>
              <Search
                fill={textFill}
                size={28} />
            </button>}
            <div {...styles.hamburger} style={bgStyle}>
              <Toggle
                dark={dark}
                expanded={expanded}
                id='primary-menu'
                title={t(`header/nav/${expanded ? 'close' : 'open'}/aria`)}
                onClick={toggleExpanded}
              />
            </div>
          </Fragment>}
          {audioSource && (
            <AudioPlayer
              src={audioSource}
              closeHandler={() => { audioCloseHandler && audioCloseHandler() }}
              autoPlay
              download
              scrubberPosition='bottom'
              timePosition='left'
              t={t}
              style={{ ...bgStyle, position: 'absolute', width: '100%', bottom: 0 }}
              controlsPadding={this.state.mobile ? 10 : 20}
              height={this.state.mobile ? HEADER_HEIGHT_MOBILE : HEADER_HEIGHT}
            />
          )}
        </div>
        {showNavBar && opaque && (
          <Fragment>
            <hr
              {...styles.stickyWithFallback}
              {...styles.hr}
              {...styles.hrThin}
              style={hrColorStyle} />
            <NavBar fixed={withoutSticky} dark={dark} router={router} />
          </Fragment>
        )}
        {opaque && <hr
          {...styles[showNavBar ? 'sticky' : 'stickyWithFallback']}
          {...((showNavBar && withoutSticky && styles.hrFixedAfterNavBar) || undefined)}
          {...styles.hr}
          {...styles[formatColor ? 'hrThick' : 'hrThin']}
          style={formatColor ? {
            color: formatColor,
            backgroundColor: formatColor
          } : hrColorStyle} />}
        <Popover expanded={expanded}>
          <NavPopover
            me={me}
            router={router}
            closeHandler={this.close}
          />
        </Popover>
        <LoadingBar onRouteChangeStart={() => {
          routeChangeStarted = true
        }} />
        {!!cover && <div {...styles.cover}>{cover}</div>}
        {inNativeApp && <Pullable dark={dark} onRefresh={() => {
          if (inNativeIOSApp) {
            postMessage({ type: 'haptic', payload: { type: 'impact' } })
          }
          // give the browser 3 frames (1000/30fps) to start animating the spinner
          setTimeout(
            () => {
              window.location.reload(true)
            },
            33 * 3
          )
        }} />}
      </Fragment>
    )
  }
}

export default compose(
  withT,
  withMembership,
  withRouter,
  withInNativeApp
)(Header)
