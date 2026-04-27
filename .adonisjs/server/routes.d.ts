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
    'networking.index': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'admin.users.index': { paramsTuple?: []; params?: {} }
    'admin.users.password': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.users.verify': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.users.grant_admin': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
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
    'networking.index': { paramsTuple?: []; params?: {} }
    'admin.users.index': { paramsTuple?: []; params?: {} }
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
    'networking.index': { paramsTuple?: []; params?: {} }
    'admin.users.index': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'incidents.store': { paramsTuple?: []; params?: {} }
    'objets.store': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'profile.update': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'admin.users.verify': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.users.grant_admin': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PUT: {
    'objets.update': { paramsTuple: [ParamValue]; params: {'identifier': ParamValue} }
    'admin.users.password': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'objets.destroy': { paramsTuple: [ParamValue]; params: {'identifier': ParamValue} }
    'admin.users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}