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
    'admin/users': ExtractProps<(typeof import('../../inertia/pages/admin/users.tsx'))['default']>
    'auth/login': ExtractProps<(typeof import('../../inertia/pages/auth/login.tsx'))['default']>
    'auth/signup': ExtractProps<(typeof import('../../inertia/pages/auth/signup.tsx'))['default']>
    'errors/not_found': ExtractProps<(typeof import('../../inertia/pages/errors/not_found.tsx'))['default']>
    'errors/server_error': ExtractProps<(typeof import('../../inertia/pages/errors/server_error.tsx'))['default']>
    'flags/flags': ExtractProps<(typeof import('../../inertia/pages/flags/flags.tsx'))['default']>
    'home': ExtractProps<(typeof import('../../inertia/pages/home.tsx'))['default']>
    'incidents/incidents': ExtractProps<(typeof import('../../inertia/pages/incidents/incidents.tsx'))['default']>
    'live-timing/live-timing': ExtractProps<(typeof import('../../inertia/pages/live-timing/live-timing.tsx'))['default']>
    'networking/networking': ExtractProps<(typeof import('../../inertia/pages/networking/networking.tsx'))['default']>
    'objets/objets': ExtractProps<(typeof import('../../inertia/pages/objets/objets.tsx'))['default']>
    'profile/edit': ExtractProps<(typeof import('../../inertia/pages/profile/edit.tsx'))['default']>
    'profile/show': ExtractProps<(typeof import('../../inertia/pages/profile/show.tsx'))['default']>
  }
}
