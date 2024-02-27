# @jalik/hal

![GitHub package.json version](https://img.shields.io/github/package-json/v/jalik/js-hal.svg)
![Build Status](https://github.com/jalik/js-hal/actions/workflows/node.js.yml/badge.svg)
![Last commit](https://img.shields.io/github/last-commit/jalik/js-hal.svg)
[![GitHub issues](https://img.shields.io/github/issues/jalik/js-hal.svg)](https://github.com/jalik/js-hal/issues)
![GitHub](https://img.shields.io/github/license/jalik/js-hal.svg)
![npm](https://img.shields.io/npm/dt/@jalik/hal.svg)

H.A.L. (Hypertext Application Language) TypeScript declarations and functions.

## Features

* Create HAL resources
* Create HAL paginated resources
* Consume HAL embedded data
* TypeScript declarations ♥

## Installing

```shell
npm i -P @jalik/hal
```
```shell
yarn add @jalik/hal
```

## Creating an HAL resource

```ts
import { createHalResource } from '@jalik/hal'

const user = {
  username: 'admin'
}

const roles = [
  { name: 'administrator' }
]

// we can add links to roles (optional)
const rolesResources = roles.map((role) => createHalResource(role, undefined, {
  self: { href: `http://localhost/roles/${role.name}` }
}))

const embedded = {
  roles: rolesResources
}

const links = {
  self: { href: 'http://localhost/users/admin' }
}

const resource = createHalResource(user, embedded, links)
```

## Creating an HAL paged resource

```ts
import { createHalPagedResource } from '@jalik/hal'

const users = [
  { username: 'admin' },
  { username: 'john' }
]

// we can add links to users (optional)
const usersResources = users.map((user) => createHalResource(user, undefined, {
  self: { href: `http://localhost/users/${user.username}` }
}))

const embedded = {
  users: usersResources
}

const page = {
  number: 3,
  size: 2,
  totalElements: 10,
  totalPages: 5
}

const links = {
  first: 'http://localhost/users?p=1',
  prev: 'http://localhost/users?p=2',
  self: 'http://localhost/users?p=3',
  next: 'http://localhost/users?p=4',
  last: 'http://localhost/users?p=5',
}

const resource = createHalPagedResource(embedded, page, links)
```

## Getting the HAL embedded values

```ts
import { getHalEmbedded } from '@jalik/hal'

const doc = {
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
import { getHalLinks } from '@jalik/hal'

const doc = {
  username: 'admin',
  _links: {
    self: { href: 'http://localhost/users/admin' }
  }
}

const links = getHalLinks(doc)
// links = { self }
```

## Getting the HAL page information

```ts
import { getHalPage } from '@jalik/hal'

const doc = {
  _embedded: { users: [] },
  page: {
    number: 1,
    size: 0,
    totalElements: 0,
    totalPages: 1
  }
}

const page = getHalPage(doc)
// page = { number, size, totalElements, totalPages }
```

## Changelog

History of releases is in the [changelog](./CHANGELOG.md) on GitHub.

## License

The code is released under the [MIT License](http://www.opensource.org/licenses/MIT).
