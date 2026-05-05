import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
    'profile.show': { paramsTuple: [ParamValue]; params: {'pseudo': ParamValue} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'profile.me': { paramsTuple?: []; params?: {} }
    'profile.edit': { paramsTuple?: []; params?: {} }
    'profile.update': { paramsTuple?: []; params?: {} }
    'profile.level.upgrade': { paramsTuple?: []; params?: {} }
    'networking.index': { paramsTuple?: []; params?: {} }
    'live-timing': { paramsTuple?: []; params?: {} }
    'api.live-timing': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'admin.users.index': { paramsTuple?: []; params?: {} }
    'admin.users.password': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.users.verify': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.users.role': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'incidents': { paramsTuple?: []; params?: {} }
    'incidents.store': { paramsTuple?: []; params?: {} }
    'flags': { paramsTuple?: []; params?: {} }
    'flags.store': { paramsTuple?: []; params?: {} }
    'objets': { paramsTuple?: []; params?: {} }
    'objets.store': { paramsTuple?: []; params?: {} }
    'objets.update': { paramsTuple: [ParamValue]; params: {'identifier': ParamValue} }
    'objets.destroy': { paramsTuple: [ParamValue]; params: {'identifier': ParamValue} }
  }
  GET: {
    'home': { paramsTuple?: []; params?: {} }
    'profile.show': { paramsTuple: [ParamValue]; params: {'pseudo': ParamValue} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'profile.me': { paramsTuple?: []; params?: {} }
    'profile.edit': { paramsTuple?: []; params?: {} }
    'networking.index': { paramsTuple?: []; params?: {} }
    'live-timing': { paramsTuple?: []; params?: {} }
    'api.live-timing': { paramsTuple?: []; params?: {} }
    'admin.users.index': { paramsTuple?: []; params?: {} }
    'incidents': { paramsTuple?: []; params?: {} }
    'flags': { paramsTuple?: []; params?: {} }
    'objets': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
    'profile.show': { paramsTuple: [ParamValue]; params: {'pseudo': ParamValue} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'profile.me': { paramsTuple?: []; params?: {} }
    'profile.edit': { paramsTuple?: []; params?: {} }
    'networking.index': { paramsTuple?: []; params?: {} }
    'live-timing': { paramsTuple?: []; params?: {} }
    'api.live-timing': { paramsTuple?: []; params?: {} }
    'admin.users.index': { paramsTuple?: []; params?: {} }
    'incidents': { paramsTuple?: []; params?: {} }
    'flags': { paramsTuple?: []; params?: {} }
    'objets': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'profile.update': { paramsTuple?: []; params?: {} }
    'profile.level.upgrade': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'admin.users.verify': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.users.role': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'incidents.store': { paramsTuple?: []; params?: {} }
    'flags.store': { paramsTuple?: []; params?: {} }
    'objets.store': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'admin.users.password': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'objets.update': { paramsTuple: [ParamValue]; params: {'identifier': ParamValue} }
  }
  DELETE: {
    'admin.users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'objets.destroy': { paramsTuple: [ParamValue]; params: {'identifier': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}