/*
 * The MIT License (MIT)
 * Copyright (c) 2024 Karl STEIN
 */

export type HalLink = {
  // https://datatracker.ietf.org/doc/html/draft-kelly-json-hal-08#section-5.4
  deprecation?: string
  // https://datatracker.ietf.org/doc/html/draft-kelly-json-hal-08#section-5.1
  href: string
  // https://datatracker.ietf.org/doc/html/draft-kelly-json-hal-08#section-5.8
  hreflang?: string
  // https://datatracker.ietf.org/doc/html/draft-kelly-json-hal-08#section-5.5
  name?: string
  // https://datatracker.ietf.org/doc/html/draft-kelly-json-hal-08#section-5.6
  profile?: string
  // https://datatracker.ietf.org/doc/html/draft-kelly-json-hal-08#section-5.2
  templated?: boolean
  // https://datatracker.ietf.org/doc/html/draft-kelly-json-hal-08#section-5.7
  title?: string
  // https://datatracker.ietf.org/doc/html/draft-kelly-json-hal-08#section-5.3
  type?: string
}

type Links = Record<string, HalLink | HalLink[]>

export type HalLinks<L extends Links = Record<string, never>> = L & {
  // https://datatracker.ietf.org/doc/html/draft-kelly-json-hal-08#section-8.2
  curies?: HalLink[]
  // https://datatracker.ietf.org/doc/html/draft-kelly-json-hal-08#section-8.1
  self?: HalLink
}

export type HalDocument<E, L extends Links = Links> = {
  // https://datatracker.ietf.org/doc/html/draft-kelly-json-hal-08#section-4.1.2
  _embedded?: E
  // https://datatracker.ietf.org/doc/html/draft-kelly-json-hal-08#section-4.1.1
  _links?: HalLinks<L>
}

export type HalResource<R, E = any, L extends Links = Links> = R & HalDocument<E, L>

export type HalPage = {
  number: number
  size: number
  totalElements: number
  totalPages: number
}

export type HalPageLinks = HalLinks<{
  first?: HalLink
  last?: HalLink
  next?: HalLink
  prev?: HalLink
}>

export type HalPagedResource<E> = HalResource<{
  page?: HalPage
}, E, HalPageLinks>

/**
 * Creates a paged HAL resource.
 * @param embedded
 * @param page
 * @param links
 */
export function createHalPagedResource<E> (embedded: E, page: HalPage, links?: HalPageLinks): HalPagedResource<E> {
  const res: HalPagedResource<E> = {
    page,
    _embedded: embedded,
    _links: links
  }

  if (links == null) {
    delete res._links
  }
  return res
}

/**
 * Creates an HAL resource.
 * @param resource
 * @param embedded
 * @param links
 */
export function createHalResource<R, E, L extends Links = Links> (resource: R, embedded?: E, links?: L): HalResource<R, E, L> {
  const res: HalResource<R, E, L> = {
    ...resource,
    _embedded: embedded,
    _links: links
  }

  if (embedded == null) {
    delete res._embedded
  }
  if (links == null) {
    delete res._links
  }
  return res
}

/**
 * Returns embedded from an HAL document.
 * @param doc
 */
export function getHalEmbedded<E, L extends Links> (doc: HalDocument<E, L>): E | undefined {
  return doc._embedded
}

/**
 * Returns links from an HAL document.
 * @param doc
 */
export function getHalLinks<E, L extends Links> (doc: HalDocument<E, L>): L | undefined {
  return doc._links
}

/**
 * Returns a specific link from an HAL document.
 * @param doc
 * @param link
 */
export function getHalLink<E, L extends Links> (doc: HalDocument<E, L>, link: keyof L): HalLinks<L>[keyof L] | undefined {
  return doc._links?.[link]
}

/**
 * Returns page from an HAL document.
 * @param doc
 */
export function getHalPage<E> (doc: HalPagedResource<E>): HalPage | undefined {
  return doc.page
}

/**
 * Returns page number from an HAL document.
 * @param doc
 */
export function getHalPageNumber<E> (doc: HalPagedResource<E>): number | undefined {
  return doc.page?.number
}

/**
 * Returns page size from an HAL document.
 * @param doc
 */
export function getHalPageSize<E> (doc: HalPagedResource<E>): number | undefined {
  return doc.page?.size
}

/**
 * Returns total elements from an HAL document.
 * @param doc
 */
export function getHalPageTotalElements<E> (doc: HalPagedResource<E>): number | undefined {
  return doc.page?.totalElements
}

/**
 * Returns total pages from an HAL document.
 * @param doc
 */
export function getHalPageTotalPages<E> (doc: HalPagedResource<E>): number | undefined {
  return doc.page?.totalPages
}
