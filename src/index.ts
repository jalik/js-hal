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

export type HalResource<E = any, L extends Links = Links> = {
  // https://datatracker.ietf.org/doc/html/draft-kelly-json-hal-08#section-4.1.2
  _embedded?: E
  // https://datatracker.ietf.org/doc/html/draft-kelly-json-hal-08#section-4.1.1
  _links?: HalLinks<L>
}

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

export type HalPagedResource<E = any> = HalResource<E, HalPageLinks> & {
  page?: HalPage
}

/**
 * Creates a HAL link.
 * @param href
 * @param attributes
 */
export function createHalLink (href: string, attributes?: Omit<HalLink, 'href'>): HalLink {
  return { href, ...attributes }
}

/**
 * Creates a paged HAL resource.
 * @param embedded
 * @param page
 * @param baseUrl
 */
export function createHalPagedResource<E> (embedded: E, page: HalPage, baseUrl?: string): HalPagedResource<E> {
  const links = baseUrl == null
    ? undefined
    : createHalPageLinks(baseUrl, page.number, page.size, page.totalPages)

  const resource: HalPagedResource<E> = {
    page,
    _embedded: embedded,
    _links: links
  }

  if (baseUrl == null) {
    delete resource._links
  }
  return resource
}

/**
 * Creates links for a HAL resource.
 * @param baseUrl
 * @param number
 * @param size
 * @param totalPages
 */
export function createHalPageLinks (
  baseUrl: string,
  number: number,
  size: number,
  totalPages: number
): HalPageLinks {
  const createLink = (page: number) => {
    const url = new URL(baseUrl)
    url.searchParams.set('page', String(page))
    url.searchParams.set('size', String(size))
    return { href: url.toString() }
  }
  return {
    self: createLink(number),
    first: createLink(1),
    last: createLink(Math.max(totalPages, 1)),
    ...(number > 1 ? { prev: createLink(number - 1) } : {}),
    ...(number < totalPages ? { next: createLink(number + 1) } : {})
  }
}

/**
 * Create a page metadata for a HAL resource.
 * @param number
 * @param size
 * @param totalElements
 */
export function createHalPageMetadata (number: number, size: number, totalElements: number): HalPage {
  return {
    number,
    size,
    totalElements,
    totalPages: Math.ceil(totalElements / size)
  }
}

/**
 * Creates a HAL resource.
 * @param resource
 * @param embedded
 * @param links
 */
export function createHalResource<T, E, L extends Links = Links> (resource: T, embedded?: E, links?: L): T & HalResource<E, L> {
  const res: T & HalResource<E, L> = {
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
 * Returns embedded from a HAL resource.
 * @param resource
 */
export function getHalEmbedded<T, E, L extends Links = Links> (resource: T & HalResource<E, L>): E | undefined {
  return resource._embedded
}

/**
 * Returns links from a HAL resource.
 * @param resource
 */
export function getHalLinks<T, E extends Record<string, unknown>, L extends Links = Links> (resource: T & HalResource<E, L>): L | undefined {
  return resource._links
}

/**
 * Returns a specific link from a HAL resource.
 * @param resource
 * @param link
 */
export function getHalLink<T, E, L extends Links = Links> (resource: T & HalResource<E, L>, link: keyof L): HalLinks<L>[keyof L] | undefined {
  return resource._links?.[link]
}

/**
 * Returns page from a HAL resource.
 * @param resource
 */
export function getHalPage<T, E> (resource: T & HalPagedResource<E>): HalPage | undefined {
  return resource.page
}

/**
 * Returns page number from a HAL resource.
 * @param resource
 */
export function getHalPageNumber<E> (resource: HalPagedResource<E>): number | undefined {
  return resource.page?.number
}

/**
 * Returns page size from a HAL resource.
 * @param resource
 */
export function getHalPageSize<E> (resource: HalPagedResource<E>): number | undefined {
  return resource.page?.size
}

/**
 * Returns total elements from a HAL resource.
 * @param resource
 */
export function getHalPageTotalElements<E> (resource: HalPagedResource<E>): number | undefined {
  return resource.page?.totalElements
}

/**
 * Returns total pages from a HAL resource.
 * @param resource
 */
export function getHalPageTotalPages<E> (resource: HalPagedResource<E>): number | undefined {
  return resource.page?.totalPages
}
