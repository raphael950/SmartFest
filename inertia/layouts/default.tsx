import { Data } from '@generated/data'
import { toast, Toaster } from 'sonner'
import { usePage } from '@inertiajs/react'
import { ReactElement, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Upbar from '@/components/Upbar'

export default function Layout({ children }: { children: ReactElement<Data.SharedProps> }) {
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
    <div className="sf-shell">
      <Navbar />
      <div className="sf-shell__main">
        <Upbar />
        <main className="sf-shell__content">{children}</main>
      </div>
      <Toaster position="top-center" richColors />
    </div>
  )
}
