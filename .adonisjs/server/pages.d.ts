import '@adonisjs/inertia/types'

import type React from 'react'
import type { Prettify } from '@adonisjs/core/types/common'

type ExtractProps<T> =
  T extends React.FC<infer Props>
    ? Prettify<Omit<Props, 'children'>>
    : T extends React.Component<infer Props>
      ? Prettify<Omit<Props, 'children'>>
      : never

declare module '@adonisjs/inertia/types' {
  export interface InertiaPages {
    'admin/users': ExtractProps<(typeof import('@/pages/admin/users.tsx'))['default']>
    'auth/login': ExtractProps<(typeof import('@/pages/auth/login.tsx'))['default']>
    'auth/signup': ExtractProps<(typeof import('@/pages/auth/signup.tsx'))['default']>
    'errors/not_found': ExtractProps<(typeof import('@/pages/errors/not_found.tsx'))['default']>
    'errors/server_error': ExtractProps<(typeof import('@/pages/errors/server_error.tsx'))['default']>
    'flags': ExtractProps<(typeof import('@/pages/flags/flags.tsx'))['default']>
    'home': ExtractProps<(typeof import('@/pages/home.tsx'))['default']>
    'incidents': ExtractProps<(typeof import('@/pages/incidents/incidents.tsx'))['default']>
    'live-timing': ExtractProps<(typeof import('@/pages/live-timing/live-timing.tsx'))['default']>
    'networking': ExtractProps<(typeof import('@/pages/networking/networking.tsx'))['default']>
    'objets': ExtractProps<(typeof import('@/pages/objets/objets.tsx'))['default']>
    'profile/edit': ExtractProps<(typeof import('@/pages/profile/edit.tsx'))['default']>
    'profile/show': ExtractProps<(typeof import('@/pages/profile/show.tsx'))['default']>
  }
}
