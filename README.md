# @jalik/hal

![GitHub package.json version](https://img.shields.io/github/package-json/v/jalik/js-hal.svg)
![Build Status](https://github.com/jalik/js-hal/actions/workflows/node.js.yml/badge.svg)
![Last commit](https://img.shields.io/github/last-commit/jalik/js-hal.svg)
[![GitHub issues](https://img.shields.io/github/issues/jalik/js-hal.svg)](https://github.com/jalik/js-hal/issues)
![GitHub](https://img.shields.io/github/license/jalik/js-hal.svg)
![npm](https://img.shields.io/npm/dt/@jalik/hal.svg)

H.A.L. (Hypertext Application Language) TypeScript declarations and functions.

## Features

* Create HAL single resources and paginated resources
* Consume HAL data
* TypeScript declarations ♥

## Installing

```shell
npm i -P @jalik/hal
```

```shell
yarn add @jalik/hal
```

## Creating a HAL resource

```ts
import { createHalLink, createHalResource } from '@jalik/hal'

const user = { id: 1, username: 'admin' }
const roles = [{ id: 1000, name: 'administrator' }]

const embedded = {
  roles: roles.map((role) => createHalResource(role, undefined, {
    // We can add links to roles (optional)
    self: createHalLink(`http://localhost/api/roles/${role.id}`)
  }))
}

// Create a HAL resource.
const resource = createHalResource(user)

// Create a HAL resource with embedded.
const resourceWithEmbedded = createHalResource(user, embedded)

// Create a HAL resource with embedded and links.
const resourceWithEmbeddedAndLinks = createHalResource(user, embedded, {
  self: createHalLink(`http://localhost/api/users/${user.id}`)
})
```

`createHalLink(href, attributes?)` creates a link object. The optional attributes can include
`title`, `type`, `name`, `profile`, `deprecation`, `hreflang`, and `templated`.

## Creating a HAL paged resource

```ts
import {
  createHalLink,
  createHalPagedResource,
  createHalPageLinks,
  createHalPageMetadata,
  createHalResource
} from '@jalik/hal'

const users = [
  { username: 'admin' },
  { username: 'john' }
]

const embedded = {
  users: users.map((user) => createHalResource(user, undefined, {
    // we can add links to users (optional)
    self: createHalLink(`http://localhost/users/${user.username}`)
  }))
}

// Page numbers start at 1; size should be a positive number.
const page = createHalPageMetadata(1, 2, 2)

const baseUrl = 'http://localhost/users?page=9&sort=name'
const links = createHalPageLinks(baseUrl, page.number, page.size, page.totalPages)
// Existing page and size query parameters are replaced; other query parameters are preserved.
const pagedResource = createHalPagedResource(embedded, page, baseUrl)
```

When `baseUrl` is omitted, `createHalPagedResource` does not add `_links`. The URL must be absolute;
other query parameters and the URL fragment are preserved when page links are created.

## Getting the HAL embedded content

```ts
import { getHalEmbedded, type HalResource } from '@jalik/hal'

type UserHalResource = { username: string } & HalResource

const doc: UserHalResource = {
  username: 'admin',
  _embedded: {
    roles: [
      { name: 'administrator' },
      { name: 'member' }
    ]
  }
}

const embedded = getHalEmbedded(doc)
// embedded = { roles[] }
```

## Getting the HAL links

```ts
import { getHalLink, getHalLinks, type HalResource } from '@jalik/hal'

type UserHalResource = { username: string } & HalResource

const doc: UserHalResource = {
  username: 'admin',
  _links: {
    self: { href: 'http://localhost/users/admin' }
  }
}

const links = getHalLinks(doc)
// links = { self }

const selfLink = getHalLink(doc, 'self')
// selfLink = { href: 'http://localhost/users/admin' }
```

## Getting the HAL page information

```ts
import {
  getHalPage,
  getHalPageNumber,
  getHalPageSize,
  getHalPageTotalElements,
  getHalPageTotalPages,
  type HalPagedResource,
  type HalResource
} from '@jalik/hal'

type UserHalResource = { username: string } & HalResource
type UsersHalResource = HalPagedResource<{ users: UserHalResource[] }>

const doc: UsersHalResource = {
  _embedded: { users: [] },
  page: {
    number: 1,
    size: 10,
    totalElements: 0,
    totalPages: 0
  }
}

const page = getHalPage(doc)
// page = { number, size, totalElements, totalPages }

const pageNumber = getHalPageNumber(doc)
const pageSize = getHalPageSize(doc)
const totalElements = getHalPageTotalElements(doc)
const totalPages = getHalPageTotalPages(doc)
```

The page metadata getters return `undefined` when the resource has no `page` metadata.
`createHalPageMetadata(number, size, totalElements)` calculates `totalPages` by rounding up; use a
positive `size` (the function does not validate it). For zero elements, the total page count is
zero.

## Changelog

History of releases is in the [changelog](./CHANGELOG.md) on GitHub.

## License

The code is released under the [MIT License](http://www.opensource.org/licenses/MIT).
