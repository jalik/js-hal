import { describe, expect, it } from '@jest/globals'
import {
  createHalPagedResource,
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
  })

  describe('getHalLinks(doc)', () => {
    it('should return the value of "_links"', () => {
      expect(getHalLinks(doc)).toStrictEqual(doc._links)
    })
  })

  describe('getHalLink(doc, link)', () => {
    it('should return the value of "_links[link]"', () => {
      expect(getHalLink(doc, 'profile')).toStrictEqual(doc._links?.profile)
      expect(getHalLink(doc, 'self')).toStrictEqual(doc._links?.self)
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
    })
  })
})
