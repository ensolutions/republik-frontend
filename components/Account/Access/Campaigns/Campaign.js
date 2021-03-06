import { A, Interaction } from '@project-r/styleguide'
import { compose } from 'react-apollo'

import withT from '../../../../lib/withT'
import { Link } from '../../../../lib/routes'

import Form from './Form'
import Grants from './Grants'

const { H2, P } = Interaction

const Campaign = ({ campaign, grantAccess, revokeAccess, t }) => {
  return (
    <div style={{ marginBottom: 40 }}>
      <H2>{campaign.title}</H2>
      <P>{campaign.description}</P>
      <P>{t.elements(
        'Account/Access/Campaigns/Campaign/claimNotice', {
          linkClaim: <Link
            route='claim'
            params={{ context: 'access' }}
            passHref>
            <A>{t('Account/Access/Campaigns/Campaign/claimNotice/linkClaim')}</A>
          </Link>
        })}
      </P>
      <Grants campaign={campaign} revokeAccess={revokeAccess} />
      <Form campaign={campaign} grantAccess={grantAccess} />
    </div>
  )
}

export default compose(withT)(Campaign)
