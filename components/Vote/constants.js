import {
  ELECTION_COOP_MEMBERS_SLUG,
  ELECTION_COOP_PRESIDENT_SLUG,
  VOTING_COOP_ACCOUNTS_SLUG,
  VOTING_COOP_BOARD_SLUG,
  VOTING_COOP_BUDGET_SLUG,
  VOTING_COOP_DISCHARGE_SLUG
} from '../../lib/constants'

export {
  ELECTION_COOP_MEMBERS_SLUG,
  ELECTION_COOP_PRESIDENT_SLUG
} from '../../lib/constants'

export const VOTINGS = [
  { slug: VOTING_COOP_ACCOUNTS_SLUG, id: 'accounts' },
  { slug: VOTING_COOP_DISCHARGE_SLUG, id: 'discharge' },
  { slug: VOTING_COOP_BUDGET_SLUG, id: 'budget' },
  { slug: VOTING_COOP_BOARD_SLUG, id: 'board' }
]

export const ELECTIONS = [
  { slug: ELECTION_COOP_PRESIDENT_SLUG, id: 'president' },
  { slug: ELECTION_COOP_MEMBERS_SLUG, id: 'members' }
]
