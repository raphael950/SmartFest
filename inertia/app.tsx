import '@/css/app.css'
import { ReactElement } from 'react'
import { client } from './client'
import DefaultLayout from '~/layouts/default'
import AuthLayout from '~/layouts/auth-layout'
import { Data } from '@generated/data'
import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import { TuyauProvider } from '@adonisjs/inertia/react'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import { NotificationProvider } from '@/contexts/NotificationContext'

const appName = import.meta.env.VITE_APP_NAME ?? ''
const pages = import.meta.glob('./pages/**/*.tsx')

const resolvePagePath = (name: string) => {
  const directPath = `./pages/${name}.tsx`
  if (pages[directPath]) {
    return directPath
  }

  const pageName = name.split('/').pop()
  const nestedPath = pageName ? `./pages/${name}/${pageName}.tsx` : directPath
  if (pages[nestedPath]) {
    return nestedPath
  }

  const indexPath = `./pages/${name}/index.tsx`
  return pages[indexPath] ? indexPath : directPath
}

createInertiaApp({
  title: (title) => {
    if (title) {
      return appName ? `${title} - ${appName}` : title
    }
    return appName || ''
  },
  resolve: (name) => {
    const Layout = name.startsWith('auth/') ? AuthLayout : DefaultLayout

    return resolvePageComponent(
      resolvePagePath(name),
      pages,
      (page: ReactElement<Data.SharedProps>) => <Layout children={page} />
    )
  },
  setup({ el, App, props }) {
    createRoot(el).render(
      <TuyauProvider client={client}>
        <NotificationProvider>
          <App {...props} />
        </NotificationProvider>
      </TuyauProvider>
    )
  },
  progress: {
    color: '#4B5563',
  },
})
