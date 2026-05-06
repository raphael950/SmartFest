import { Data } from '@generated/data'
import { toast, Toaster } from 'sonner'
import { usePage, Head } from '@inertiajs/react'
import { ReactElement, useEffect } from 'react'
import AuthBar from '@/components/auth/AuthBar'

export default function Layout({ children }: { children: ReactElement<Data.SharedProps> }) {
  const page = usePage<Data.SharedProps>()

  const computeTitle = () => {
    const childTitle = (children as any)?.props?.title
    const propsTitle = (page.props as any)?.title
    if (childTitle) return childTitle
    if (propsTitle) return propsTitle
    const componentName = page.component?.split('/')?.pop() ?? ''
    const human = componentName
      .replace(/[-_]/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, (c) => c.toUpperCase())
    return human || ''
  }

  useEffect(() => {
    toast.dismiss()
  }, [usePage().url])

  useEffect(() => {
    if (children.props.flash.error) {
      toast.error(children.props.flash.error)
    }
    if (children.props.flash.success) {
      toast.success(children.props.flash.success)
    }
  })

  return (
    <div className="auth-shell">
      <Head title={computeTitle()} />
      <AuthBar />
      <main className="auth-shell__main">{children}</main>
      <Toaster position="top-center" richColors />
    </div>
  )
}
