import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
    'incidents': { paramsTuple?: []; params?: {} }
    'incidents.store': { paramsTuple?: []; params?: {} }
    'objets': { paramsTuple?: []; params?: {} }
    'objets.store': { paramsTuple?: []; params?: {} }
    'objets.update': { paramsTuple: [ParamValue]; params: {'identifier': ParamValue} }
    'objets.destroy': { paramsTuple: [ParamValue]; params: {'identifier': ParamValue} }
    'profile.show': { paramsTuple: [ParamValue]; params: {'pseudo': ParamValue} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'profile.me': { paramsTuple?: []; params?: {} }
    'profile.edit': { paramsTuple?: []; params?: {} }
    'profile.update': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'home': { paramsTuple?: []; params?: {} }
    'incidents': { paramsTuple?: []; params?: {} }
    'objets': { paramsTuple?: []; params?: {} }
    'profile.show': { paramsTuple: [ParamValue]; params: {'pseudo': ParamValue} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'profile.me': { paramsTuple?: []; params?: {} }
    'profile.edit': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
    'incidents': { paramsTuple?: []; params?: {} }
    'objets': { paramsTuple?: []; params?: {} }
    'profile.show': { paramsTuple: [ParamValue]; params: {'pseudo': ParamValue} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'profile.me': { paramsTuple?: []; params?: {} }
    'profile.edit': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'incidents.store': { paramsTuple?: []; params?: {} }
    'objets.store': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'profile.update': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'objets.update': { paramsTuple: [ParamValue]; params: {'identifier': ParamValue} }
  }
  DELETE: {
    'objets.destroy': { paramsTuple: [ParamValue]; params: {'identifier': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}