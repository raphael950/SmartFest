/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'home': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [{"old":"/","type":0,"val":"/","end":""}],
    types: placeholder as Registry['home']['types'],
  },
  'objets': {
    methods: ["GET","HEAD"],
    pattern: '/objets',
    tokens: [{"old":"/objets","type":0,"val":"objets","end":""}],
    types: placeholder as Registry['objets']['types'],
  },
  'objets.store': {
    methods: ["POST"],
    pattern: '/objets',
    tokens: [{"old":"/objets","type":0,"val":"objets","end":""}],
    types: placeholder as Registry['objets.store']['types'],
  },
  'objets.update': {
    methods: ["PUT"],
    pattern: '/objets/:identifier',
    tokens: [{"old":"/objets/:identifier","type":0,"val":"objets","end":""},{"old":"/objets/:identifier","type":1,"val":"identifier","end":""}],
    types: placeholder as Registry['objets.update']['types'],
  },
  'objets.destroy': {
    methods: ["DELETE"],
    pattern: '/objets/:identifier',
    tokens: [{"old":"/objets/:identifier","type":0,"val":"objets","end":""},{"old":"/objets/:identifier","type":1,"val":"identifier","end":""}],
    types: placeholder as Registry['objets.destroy']['types'],
  },
  'profile.show': {
    methods: ["GET","HEAD"],
    pattern: '/profil/:pseudo',
    tokens: [{"old":"/profil/:pseudo","type":0,"val":"profil","end":""},{"old":"/profil/:pseudo","type":1,"val":"pseudo","end":""}],
    types: placeholder as Registry['profile.show']['types'],
  },
  'new_account.create': {
    methods: ["GET","HEAD"],
    pattern: '/signup',
    tokens: [{"old":"/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['new_account.create']['types'],
  },
  'new_account.store': {
    methods: ["POST"],
    pattern: '/signup',
    tokens: [{"old":"/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['new_account.store']['types'],
  },
  'session.create': {
    methods: ["GET","HEAD"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['session.create']['types'],
  },
  'session.store': {
    methods: ["POST"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['session.store']['types'],
  },
  'profile.me': {
    methods: ["GET","HEAD"],
    pattern: '/mon-profil',
    tokens: [{"old":"/mon-profil","type":0,"val":"mon-profil","end":""}],
    types: placeholder as Registry['profile.me']['types'],
  },
  'profile.edit': {
    methods: ["GET","HEAD"],
    pattern: '/mon-profil/edition',
    tokens: [{"old":"/mon-profil/edition","type":0,"val":"mon-profil","end":""},{"old":"/mon-profil/edition","type":0,"val":"edition","end":""}],
    types: placeholder as Registry['profile.edit']['types'],
  },
  'profile.update': {
    methods: ["POST"],
    pattern: '/mon-profil/edition',
    tokens: [{"old":"/mon-profil/edition","type":0,"val":"mon-profil","end":""},{"old":"/mon-profil/edition","type":0,"val":"edition","end":""}],
    types: placeholder as Registry['profile.update']['types'],
  },
  'session.destroy': {
    methods: ["POST"],
    pattern: '/logout',
    tokens: [{"old":"/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['session.destroy']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
