import { describe, expect, it } from 'vitest'
import {
  createHalPagedResource,
  createHalPageLinks,
  createHalPageMetadata,
  createHalResource,
  getHalEmbedded,
  getHalLink,
  getHalLinks,
  getHalPage,
  getHalPageNumber,
  getHalPageSize,
  getHalPageTotalElements,
  getHalPageTotalPages,
  HalLink,
  HalLinks,
  HalPagedResource,
  HalResource
} from '../src'

type Role = {
  name: string
}

type RoleResource = HalResource<Role, never>

type EmbeddedRoles = {
  roles: RoleResource[]
}

type User = {
  username: string
}

type UserLinks = HalLinks<{
  profile?: HalLink
}>

type UserResource = HalResource<User, EmbeddedRoles, UserLinks>

describe('HalResource', () => {
  const doc: UserResource = {
    username: 'admin',
    _embedded: {
      roles: [
        {
          name: 'administrator',
          _links: { self: { href: 'http://localhost/roles/administrator' } }
        }
      ]
    },
    _links: {
      self: { href: 'http://localhost/users/admin' },
      profile: { href: 'http://localhost/users/admin/profile' }
    }
  }

  describe('getHalEmbedded(doc)', () => {
    it('should return the value of "_embedded"', () => {
      expect(getHalEmbedded(doc)).toStrictEqual(doc._embedded)
    })

    it('should return undefined when "_embedded" is missing', () => {
      expect(getHalEmbedded({ username: 'admin' })).toBeUndefined()
    })
  })

  describe('getHalLinks(doc)', () => {
    it('should return the value of "_links"', () => {
      expect(getHalLinks(doc)).toStrictEqual(doc._links)
    })

    it('should return undefined when "_links" is missing', () => {
      expect(getHalLinks({ username: 'admin' })).toBeUndefined()
    })
  })

  describe('getHalLink(doc, link)', () => {
    it('should return the value of "_links[link]"', () => {
      expect(getHalLink(doc, 'profile')).toStrictEqual(doc._links?.profile)
      expect(getHalLink(doc, 'self')).toStrictEqual(doc._links?.self)
    })

    it('should return undefined when "_links" is missing', () => {
      expect(getHalLink({ username: 'admin' }, 'self')).toBeUndefined()
    })
  })
})

describe('HalPagedResource', () => {
  const doc: HalPagedResource<{ users: UserResource[] }> = {
    _embedded: {
      users: [
        { username: 'admin', _links: { self: { href: 'http://localhost/users/admin' } } }
      ]
    },
    page: {
      number: 1,
      size: 10,
      totalPages: 2,
      totalElements: 20
    },
    _links: {
      self: { href: 'http://localhost/users?p=3' },
      first: { href: 'http://localhost/users?p=1' },
      next: { href: 'http://localhost/users?p=4' },
      prev: { href: 'http://localhost/users?p=2' },
      last: { href: 'http://localhost/users?p=5' }
    }
  }

  describe('getHalPage(doc)', () => {
    it('should return the value of "page"', () => {
      expect(getHalPage(doc)).toStrictEqual(doc.page)
    })
  })

  describe('getHalPageNumber(doc)', () => {
    it('should return the value of "page.number"', () => {
      expect(getHalPageNumber(doc)).toBe(doc.page?.number)
    })
  })

  describe('getHalPageSize(doc)', () => {
    it('should return the value of "page.size"', () => {
      expect(getHalPageSize(doc)).toBe(doc.page?.size)
    })
  })

  describe('getHalPageTotalElements(doc)', () => {
    it('should return the value of "page.totalElements"', () => {
      expect(getHalPageTotalElements(doc)).toBe(doc.page?.totalElements)
    })
  })

  describe('getHalPageTotalPages(doc)', () => {
    it('should return the value of "page.totalPages"', () => {
      expect(getHalPageTotalPages(doc)).toBe(doc.page?.totalPages)
    })
  })

  describe('without page metadata', () => {
    const doc: HalPagedResource<never> = {}

    it('should return undefined from page getters', () => {
      expect(getHalPage(doc)).toBeUndefined()
      expect(getHalPageNumber(doc)).toBeUndefined()
      expect(getHalPageSize(doc)).toBeUndefined()
      expect(getHalPageTotalElements(doc)).toBeUndefined()
      expect(getHalPageTotalPages(doc)).toBeUndefined()
    })
  })
})

describe('createHalPageMetadata(number, size, totalElements)', () => {
  it('should calculate total pages when all pages are full', () => {
    expect(createHalPageMetadata(1, 10, 20)).toStrictEqual({
      number: 1,
      size: 10,
      totalElements: 20,
      totalPages: 2
    })
  })

  it('should round up when the last page is partially filled', () => {
    expect(createHalPageMetadata(2, 10, 21)).toStrictEqual({
      number: 2,
      size: 10,
      totalElements: 21,
      totalPages: 3
    })
  })

  it('should return zero total pages when there are no elements', () => {
    expect(createHalPageMetadata(1, 10, 0)).toStrictEqual({
      number: 1,
      size: 10,
      totalElements: 0,
      totalPages: 0
    })
  })
})

describe('createHalPageLinks', () => {
  it('should include first, last, and next links on the first page', () => {
    expect(createHalPageLinks('http://localhost/users?sort=name#results', 1, 10, 3)).toStrictEqual({
      self: { href: 'http://localhost/users?sort=name&page=1&size=10#results' },
      first: { href: 'http://localhost/users?sort=name&page=1&size=10#results' },
      last: { href: 'http://localhost/users?sort=name&page=3&size=10#results' },
      next: { href: 'http://localhost/users?sort=name&page=2&size=10#results' }
    })
  })

  it('should include previous and next links on a middle page', () => {
    expect(createHalPageLinks('http://localhost/users', 2, 10, 3)).toStrictEqual({
      self: { href: 'http://localhost/users?page=2&size=10' },
      first: { href: 'http://localhost/users?page=1&size=10' },
      last: { href: 'http://localhost/users?page=3&size=10' },
      prev: { href: 'http://localhost/users?page=1&size=10' },
      next: { href: 'http://localhost/users?page=3&size=10' }
    })
  })

  it('should include a previous link but no next link on the last page', () => {
    expect(createHalPageLinks('http://localhost/users', 3, 10, 3)).toStrictEqual({
      self: { href: 'http://localhost/users?page=3&size=10' },
      first: { href: 'http://localhost/users?page=1&size=10' },
      last: { href: 'http://localhost/users?page=3&size=10' },
      prev: { href: 'http://localhost/users?page=2&size=10' }
    })
  })

  it('should omit previous and next links when there is only one page', () => {
    expect(createHalPageLinks('http://localhost/users', 1, 10, 1)).toStrictEqual({
      self: { href: 'http://localhost/users?page=1&size=10' },
      first: { href: 'http://localhost/users?page=1&size=10' },
      last: { href: 'http://localhost/users?page=1&size=10' }
    })
  })

  it('should link to the first page when there are no pages', () => {
    expect(createHalPageLinks('http://localhost/users', 1, 10, 0)).toStrictEqual({
      self: { href: 'http://localhost/users?page=1&size=10' },
      first: { href: 'http://localhost/users?page=1&size=10' },
      last: { href: 'http://localhost/users?page=1&size=10' }
    })
  })

  it('should throw for an invalid base URL', () => {
    expect(() => createHalPageLinks('/users', 1, 10, 1)).toThrow()
  })
})

describe('createHalResource(resource, embedded, links)', () => {
  const user: User = {
    username: 'admin'
  }
  const embedded = {
    roles: [
      {
        name: 'administrator',
        _links: { self: { href: 'http://localhost/roles/administrator' } }
      }
    ]
  }
  const links = {
    self: { href: 'http://localhost/users/admin' }
  }

  describe('with embedded and links', () => {
    const doc = createHalResource(user, embedded, links)

    it('should return an HalResource', () => {
      expect(doc.username).toStrictEqual(user.username)
      expect(doc._embedded).toStrictEqual(embedded)
      expect(doc._links).toStrictEqual(links)
    })
  })

  describe('without embedded and links', () => {
    const doc = createHalResource(user, undefined, undefined)

    it('should return an HalResource', () => {
      expect(doc.username).toStrictEqual(user.username)
      expect(doc._embedded).toBeUndefined()
      expect(doc._links).toBeUndefined()
      expect(doc).not.toHaveProperty('_embedded')
      expect(doc).not.toHaveProperty('_links')
    })
  })
})

describe('createHalPagedResource(embedded, page, links)', () => {
  const embedded = {
    users: [
      { username: 'admin' },
      { username: 'member' }
    ]
  }
  const page = {
    number: 1,
    size: 2,
    totalElements: 2,
    totalPages: 1
  }
  const links = {
    self: { href: 'http://localhost/users?p=1' }
  }

  describe('with links', () => {
    const doc = createHalPagedResource<{ users: UserResource[] }>(embedded, page, links)

    it('should return an HalPagedResource', () => {
      expect(doc.page).toStrictEqual(page)
      expect(doc._embedded).toStrictEqual(embedded)
      expect(doc._links).toStrictEqual(links)
    })
  })

  describe('without links', () => {
    const doc = createHalPagedResource<{ users: UserResource[] }>(embedded, page, undefined)

    it('should return an HalPagedResource', () => {
      expect(doc.page).toStrictEqual(page)
      expect(doc._embedded).toStrictEqual(embedded)
      expect(doc._links).toBeUndefined()
      expect(doc).not.toHaveProperty('_links')
    })
  })
})
