/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  home: typeof routes['home']
  profile: {
    show: typeof routes['profile.show']
    me: typeof routes['profile.me']
    edit: typeof routes['profile.edit']
    update: typeof routes['profile.update']
  }
  newAccount: {
    create: typeof routes['new_account.create']
    store: typeof routes['new_account.store']
  }
  session: {
    create: typeof routes['session.create']
    store: typeof routes['session.store']
    destroy: typeof routes['session.destroy']
  }
  networking: {
    index: typeof routes['networking.index']
  }
  liveTiming: typeof routes['live-timing']
  admin: {
    users: {
      index: typeof routes['admin.users.index']
      password: typeof routes['admin.users.password']
      verify: typeof routes['admin.users.verify']
      role: typeof routes['admin.users.role']
      destroy: typeof routes['admin.users.destroy']
    }
  }
  incidents: typeof routes['incidents'] & {
    store: typeof routes['incidents.store']
  }
  flags: typeof routes['flags'] & {
    store: typeof routes['flags.store']
  }
  objets: typeof routes['objets'] & {
    store: typeof routes['objets.store']
    update: typeof routes['objets.update']
    destroy: typeof routes['objets.destroy']
  }
}
