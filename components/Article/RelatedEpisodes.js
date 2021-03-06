import React from 'react'
import { Link } from '../../lib/routes'
import withT from '../../lib/withT'
import { romanize } from '../../lib/utils/romanize'
import { timeFormat } from '../../lib/utils/format'

import {
  colors,
  Breakout,
  Center,
  Editorial,
  TeaserFrontTile,
  TeaserFrontTileHeadline,
  TeaserFrontTileRow,
  TeaserFrontCredit
} from '@project-r/styleguide'

const dayFormat = timeFormat('%d. %B %Y')

const DefaultLink = ({ children }) => children

const Tile = ({ t, episode, index, LinkComponent = DefaultLink }) => {
  const date = episode && episode.publishDate
  const label = episode && episode.label
  const meta = episode && episode.document && episode.document.meta
  const route = meta && meta.path
  const image = (episode && episode.image) || (meta && meta.image)
  const align = image ? { align: 'top' } : {}

  if (route) {
    LinkComponent = ({ children }) => <Link route={route}>{children}</Link>
  }
  return (
    <LinkComponent>
      <TeaserFrontTile
        color={route ? colors.text : colors.lightText}
        image={image}
        {...align}
      >
        <Editorial.Format>
          {label || t('article/series/episode', { count: romanize(index + 1) })}
        </Editorial.Format>
        <TeaserFrontTileHeadline.Editorial>
          {episode.title}
        </TeaserFrontTileHeadline.Editorial>
        {!!date && (
          <TeaserFrontCredit>{dayFormat(Date.parse(date))}</TeaserFrontCredit>
        )}
      </TeaserFrontTile>
    </LinkComponent>
  )
}

const RelatedEpisodes = ({ t, episodes, path }) => {
  let nextEpisode, previousEpisode

  const currentEpisodeIndex = episodes
    .map(episode => episode.document && episode.document.meta.path)
    .indexOf(path)
  previousEpisode = currentEpisodeIndex > 0 && episodes[currentEpisodeIndex - 1]
  nextEpisode = episodes[currentEpisodeIndex + 1]

  return !!(previousEpisode || nextEpisode) && (
    <Center>
      <Breakout size='breakout'>
        <TeaserFrontTileRow columns={2} mobileReverse>
          {previousEpisode && (
            <Tile
              t={t}
              episode={previousEpisode}
              index={currentEpisodeIndex - 1}
            />
          )}
          {nextEpisode && (
            <Tile
              t={t}
              episode={nextEpisode}
              index={currentEpisodeIndex + 1}
            />
          )}
        </TeaserFrontTileRow>
      </Breakout>
    </Center>
  )
}

export default withT(RelatedEpisodes)
