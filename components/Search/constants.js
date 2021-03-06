export const DEFAULT_FILTERS = [{ key: 'template', value: 'front', not: true }]

export const SUPPORTED_FILTER = {
  template: [
    'article',
    'discussion',
    'editorialNewsletter',
    'format',
    'dossier'
  ],
  kind: ['meta', 'scribble'],
  textLength: ['short', 'medium', 'long', 'epic'],
  type: ['Comment', 'User'],
  audioSource: ['true'],
  hasAudio: ['true'],
  hasVideo: ['true'],
  isSeriesMaster: ['true']
}

export const SUPPORTED_SORT = {
  relevance: [],
  publishedAt: ['ASC', 'DESC']
}
