import React, { Fragment } from 'react'
import { compose } from 'react-apollo'

import withT from '../../lib/withT'
import { Link } from '../../lib/routes'
import withInNativeApp from '../../lib/withInNativeApp'

import Frame from '../Frame'
import SignIn from './SignIn'
import Me from './Me'

import { Interaction, linkRule } from '@project-r/styleguide'

import withAuthorization, { PageCenter } from './withAuthorization'
import { withMembership } from './checkRoles'

export const UnauthorizedMessage = compose(
  withT,
  withInNativeApp
)(({ t, me, inNativeIOSApp, unauthorizedTexts: { title, description } = {} }) => {
  if (inNativeIOSApp) {
    return (
      <Fragment>
        {me && <Interaction.H1 style={{ marginBottom: 10 }}>
          {t('withMembership/ios/unauthorized/title')}
        </Interaction.H1>}
        <br />
        <Me
          beforeSignedInAs={(
            <Interaction.P style={{ marginBottom: 20 }}>
              {t('withMembership/ios/unauthorized/noMembership')}
            </Interaction.P>
          )}
          beforeSignInForm={(
            <Interaction.P style={{ marginBottom: 20 }}>
              {t('withMembership/ios/unauthorized/signIn')}
            </Interaction.P>
          )} />
      </Fragment>
    )
  }
  if (me) {
    return (
      <Fragment>
        <Interaction.H1>{t('withMembership/title')}</Interaction.H1>
        <Interaction.P>
          {t.elements('withMembership/unauthorized', {
            buyLink: (
              <Link key='pledge' route='pledge'>
                <a {...linkRule}>{t('withMembership/unauthorized/buyText')}</a>
              </Link>
            ),
            accountLink: (
              <Link key='account' route='account'>
                <a {...linkRule}>{t('withMembership/unauthorized/accountText')}</a>
              </Link>
            )
          })}
          <br />
        </Interaction.P>
        <br />
        <Me />
      </Fragment>
    )
  }
  return (
    <Fragment>
      <Interaction.H1>{title || t('withMembership/title')}</Interaction.H1>
      <br />
      <SignIn beforeForm={(
        <Interaction.P style={{ marginBottom: 20 }}>
          { description ||
            t.elements('withMembership/signIn/note', {
              buyLink: (
                <Link key='pledge' route='pledge'>
                  <a {...linkRule}>{t('withMembership/signIn/note/buyText')}</a>
                </Link>
              ),
              moreLink: (
                <Link route='index'>
                  <a {...linkRule}>
                    {t('withMembership/signIn/note/moreText')}
                  </a>
                </Link>
              )
            }
            )}
        </Interaction.P>
      )} />
    </Fragment>
  )
})

export const UnauthorizedPage = ({ me, meta, unauthorizedTexts }) => (
  <Frame meta={meta} raw>
    <PageCenter>
      <UnauthorizedMessage {...{ me, unauthorizedTexts }} />
    </PageCenter>
  </Frame>
)

export const WithoutMembership = withAuthorization(['member'])(({
  isAuthorized, render
}) => {
  if (!isAuthorized) {
    return render()
  }
  return null
})
export const WithMembership = withAuthorization(['member'])(({
  isAuthorized, render
}) => {
  if (isAuthorized) {
    return render()
  }
  return null
})

export const enforceMembership = (meta, unauthorizedTexts) => WrappedComponent => withAuthorization(['member'])(({ isAuthorized, me, ...props }) => {
  if (isAuthorized) {
    return <WrappedComponent meta={meta} {...props} />
  }
  return <UnauthorizedPage {...{ me, meta, unauthorizedTexts }} />
})

export default withMembership
