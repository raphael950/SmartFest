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
  'new_account.store_identity': {
    methods: ["POST"],
    pattern: '/signup/identity',
    tokens: [{"old":"/signup/identity","type":0,"val":"signup","end":""},{"old":"/signup/identity","type":0,"val":"identity","end":""}],
    types: placeholder as Registry['new_account.store_identity']['types'],
  },
  'new_account.email_step': {
    methods: ["GET","HEAD"],
    pattern: '/signup/email',
    tokens: [{"old":"/signup/email","type":0,"val":"signup","end":""},{"old":"/signup/email","type":0,"val":"email","end":""}],
    types: placeholder as Registry['new_account.email_step']['types'],
  },
  'new_account.send_verification': {
    methods: ["POST"],
    pattern: '/signup/send-verification',
    tokens: [{"old":"/signup/send-verification","type":0,"val":"signup","end":""},{"old":"/signup/send-verification","type":0,"val":"send-verification","end":""}],
    types: placeholder as Registry['new_account.send_verification']['types'],
  },
  'new_account.waiting_step': {
    methods: ["GET","HEAD"],
    pattern: '/signup/waiting',
    tokens: [{"old":"/signup/waiting","type":0,"val":"signup","end":""},{"old":"/signup/waiting","type":0,"val":"waiting","end":""}],
    types: placeholder as Registry['new_account.waiting_step']['types'],
  },
  'new_account.finalization_step': {
    methods: ["GET","HEAD"],
    pattern: '/signup/finalization',
    tokens: [{"old":"/signup/finalization","type":0,"val":"signup","end":""},{"old":"/signup/finalization","type":0,"val":"finalization","end":""}],
    types: placeholder as Registry['new_account.finalization_step']['types'],
  },
  'new_account.store': {
    methods: ["POST"],
    pattern: '/signup',
    tokens: [{"old":"/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['new_account.store']['types'],
  },
  'verify.email': {
    methods: ["GET","HEAD"],
    pattern: '/verify-email',
    tokens: [{"old":"/verify-email","type":0,"val":"verify-email","end":""}],
    types: placeholder as Registry['verify.email']['types'],
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
  'password.send_reset': {
    methods: ["POST"],
    pattern: '/forgot-password',
    tokens: [{"old":"/forgot-password","type":0,"val":"forgot-password","end":""}],
    types: placeholder as Registry['password.send_reset']['types'],
  },
  'password.reset': {
    methods: ["GET","HEAD"],
    pattern: '/reset-password',
    tokens: [{"old":"/reset-password","type":0,"val":"reset-password","end":""}],
    types: placeholder as Registry['password.reset']['types'],
  },
  'password.update': {
    methods: ["POST"],
    pattern: '/reset-password',
    tokens: [{"old":"/reset-password","type":0,"val":"reset-password","end":""}],
    types: placeholder as Registry['password.update']['types'],
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
  'profile.level.upgrade': {
    methods: ["POST"],
    pattern: '/mon-profil/niveau',
    tokens: [{"old":"/mon-profil/niveau","type":0,"val":"mon-profil","end":""},{"old":"/mon-profil/niveau","type":0,"val":"niveau","end":""}],
    types: placeholder as Registry['profile.level.upgrade']['types'],
  },
  'networking.index': {
    methods: ["GET","HEAD"],
    pattern: '/networking',
    tokens: [{"old":"/networking","type":0,"val":"networking","end":""}],
    types: placeholder as Registry['networking.index']['types'],
  },
  'live-timing': {
    methods: ["GET","HEAD"],
    pattern: '/live-timing',
    tokens: [{"old":"/live-timing","type":0,"val":"live-timing","end":""}],
    types: placeholder as Registry['live-timing']['types'],
  },
  'api.live-timing': {
    methods: ["GET","HEAD"],
    pattern: '/api/live-timing',
    tokens: [{"old":"/api/live-timing","type":0,"val":"api","end":""},{"old":"/api/live-timing","type":0,"val":"live-timing","end":""}],
    types: placeholder as Registry['api.live-timing']['types'],
  },
  'session.destroy': {
    methods: ["POST"],
    pattern: '/logout',
    tokens: [{"old":"/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['session.destroy']['types'],
  },
  'admin.users.index': {
    methods: ["GET","HEAD"],
    pattern: '/admin/users',
    tokens: [{"old":"/admin/users","type":0,"val":"admin","end":""},{"old":"/admin/users","type":0,"val":"users","end":""}],
    types: placeholder as Registry['admin.users.index']['types'],
  },
  'admin.index': {
    methods: ["GET","HEAD"],
    pattern: '/admin',
    tokens: [{"old":"/admin","type":0,"val":"admin","end":""}],
    types: placeholder as Registry['admin.index']['types'],
  },
  'admin.users.password': {
    methods: ["PUT"],
    pattern: '/admin/users/:id/password',
    tokens: [{"old":"/admin/users/:id/password","type":0,"val":"admin","end":""},{"old":"/admin/users/:id/password","type":0,"val":"users","end":""},{"old":"/admin/users/:id/password","type":1,"val":"id","end":""},{"old":"/admin/users/:id/password","type":0,"val":"password","end":""}],
    types: placeholder as Registry['admin.users.password']['types'],
  },
  'admin.users.verify': {
    methods: ["POST"],
    pattern: '/admin/users/:id/verify',
    tokens: [{"old":"/admin/users/:id/verify","type":0,"val":"admin","end":""},{"old":"/admin/users/:id/verify","type":0,"val":"users","end":""},{"old":"/admin/users/:id/verify","type":1,"val":"id","end":""},{"old":"/admin/users/:id/verify","type":0,"val":"verify","end":""}],
    types: placeholder as Registry['admin.users.verify']['types'],
  },
  'admin.users.role': {
    methods: ["POST"],
    pattern: '/admin/users/:id/role',
    tokens: [{"old":"/admin/users/:id/role","type":0,"val":"admin","end":""},{"old":"/admin/users/:id/role","type":0,"val":"users","end":""},{"old":"/admin/users/:id/role","type":1,"val":"id","end":""},{"old":"/admin/users/:id/role","type":0,"val":"role","end":""}],
    types: placeholder as Registry['admin.users.role']['types'],
  },
  'admin.users.destroy': {
    methods: ["DELETE"],
    pattern: '/admin/users/:id',
    tokens: [{"old":"/admin/users/:id","type":0,"val":"admin","end":""},{"old":"/admin/users/:id","type":0,"val":"users","end":""},{"old":"/admin/users/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.users.destroy']['types'],
  },
  'admin.objets.index': {
    methods: ["GET","HEAD"],
    pattern: '/admin/objets',
    tokens: [{"old":"/admin/objets","type":0,"val":"admin","end":""},{"old":"/admin/objets","type":0,"val":"objets","end":""}],
    types: placeholder as Registry['admin.objets.index']['types'],
  },
  'admin.objets.approve_destroy': {
    methods: ["POST"],
    pattern: '/admin/objets/:id/approve-destroy',
    tokens: [{"old":"/admin/objets/:id/approve-destroy","type":0,"val":"admin","end":""},{"old":"/admin/objets/:id/approve-destroy","type":0,"val":"objets","end":""},{"old":"/admin/objets/:id/approve-destroy","type":1,"val":"id","end":""},{"old":"/admin/objets/:id/approve-destroy","type":0,"val":"approve-destroy","end":""}],
    types: placeholder as Registry['admin.objets.approve_destroy']['types'],
  },
  'admin.objets.reject_destroy': {
    methods: ["POST"],
    pattern: '/admin/objets/:id/reject-destroy',
    tokens: [{"old":"/admin/objets/:id/reject-destroy","type":0,"val":"admin","end":""},{"old":"/admin/objets/:id/reject-destroy","type":0,"val":"objets","end":""},{"old":"/admin/objets/:id/reject-destroy","type":1,"val":"id","end":""},{"old":"/admin/objets/:id/reject-destroy","type":0,"val":"reject-destroy","end":""}],
    types: placeholder as Registry['admin.objets.reject_destroy']['types'],
  },
  'incidents': {
    methods: ["GET","HEAD"],
    pattern: '/incidents',
    tokens: [{"old":"/incidents","type":0,"val":"incidents","end":""}],
    types: placeholder as Registry['incidents']['types'],
  },
  'incidents.store': {
    methods: ["POST"],
    pattern: '/incidents',
    tokens: [{"old":"/incidents","type":0,"val":"incidents","end":""}],
    types: placeholder as Registry['incidents.store']['types'],
  },
  'race': {
    methods: ["GET","HEAD"],
    pattern: '/course',
    tokens: [{"old":"/course","type":0,"val":"course","end":""}],
    types: placeholder as Registry['race']['types'],
  },
  'race.store': {
    methods: ["POST"],
    pattern: '/course',
    tokens: [{"old":"/course","type":0,"val":"course","end":""}],
    types: placeholder as Registry['race.store']['types'],
  },
  'race.start': {
    methods: ["POST"],
    pattern: '/course/start',
    tokens: [{"old":"/course/start","type":0,"val":"course","end":""},{"old":"/course/start","type":0,"val":"start","end":""}],
    types: placeholder as Registry['race.start']['types'],
  },
  'race.stop': {
    methods: ["POST"],
    pattern: '/course/stop',
    tokens: [{"old":"/course/stop","type":0,"val":"course","end":""},{"old":"/course/stop","type":0,"val":"stop","end":""}],
    types: placeholder as Registry['race.stop']['types'],
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
