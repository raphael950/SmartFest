import { Data } from '@generated/data'
import { toast, Toaster } from 'sonner'
import { usePage } from '@inertiajs/react'
import { Menu } from 'lucide-react'
import { ReactElement, useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import NotificationGateway from '@/components/NotificationGateway'
import NotificationPanel from '@/components/ui/NotificationPanel'

export default function Layout({ children }: { children: ReactElement<Data.SharedProps> }) {
  const page = usePage<Data.SharedProps>()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  useEffect(() => {
    toast.dismiss()
    setIsMobileNavOpen(false)
  }, [page.url])

  useEffect(() => {
    if (!isMobileNavOpen) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileNavOpen(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isMobileNavOpen])

  useEffect(() => {
    document.body.style.overflow = isMobileNavOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileNavOpen])

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
      <NotificationGateway />
      <Navbar isMobileOpen={isMobileNavOpen} onMobileClose={() => setIsMobileNavOpen(false)} />
      <div className="sf-shell__main">
        <button
          type="button"
          className={`sf-shell__mobile-fab ${isMobileNavOpen ? 'is-open' : ''}`}
          aria-label="Ouvrir le menu"
          aria-expanded={isMobileNavOpen}
          onClick={() => setIsMobileNavOpen((prev) => !prev)}
        >
          <Menu className="sf-shell__mobile-nav-icon" />
        </button>
        <main className="sf-shell__content">{children}</main>
      </div>
      <NotificationPanel />
      <Toaster position="top-center" richColors />
    </div>
  )
}
