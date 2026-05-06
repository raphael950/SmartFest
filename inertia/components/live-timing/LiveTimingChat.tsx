import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Clock3, Send, Trash2, UserRound } from 'lucide-react'
import type { LiveTimingChatMessage } from '@/types/live-timing.types'
import '@/css/components/live-timing/LiveTimingChat.css'

interface LiveTimingChatProps {
  chatMessages: LiveTimingChatMessage[]
  isConnected: boolean
  onSendChatMessage: (message: {
    authorName: string
    authorInitials: string
    avatarPath?: string | null
    text: string
    clientId: string
  }) => boolean
  onDeleteChatMessage: (payload: { messageId: string; requesterRole: string }) => boolean
  currentUserName: string
  currentUserInitials: string | null
  currentUserAvatarPath: string | null
  currentUserRole: string | null
}

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp)
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 3)
    .toUpperCase()
}

  function buildClientId(name: string) {
    const normalized = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'spectateur'
    const sessionSuffix = Math.random().toString(36).slice(2, 8)
    return `chat-${normalized}-${sessionSuffix}`
  }

function groupMessages(messages: LiveTimingChatMessage[]) {
  return messages.reduce<
    Array<{
      key: string
      authorName: string
      authorInitials: string
      authorAvatarPath?: string | null
      clientId: string
      items: LiveTimingChatMessage[]
    }>
  >((groups, message) => {
    const previousGroup = groups[groups.length - 1]
    const sameAuthor = previousGroup && previousGroup.clientId === message.clientId && previousGroup.authorName === message.authorName

    if (sameAuthor) {
      previousGroup.items.push(message)
      return groups
    }

    groups.push({
      key: message.id,
      authorName: message.authorName,
      authorInitials: message.authorInitials,
      authorAvatarPath: (message as any).avatarPath ?? null,
      authorRole: (message as any).authorRole ?? null,
      clientId: message.clientId,
      items: [message],
    })

    return groups
  }, [])
}

export default function LiveTimingChat({
  chatMessages,
  isConnected,
  onSendChatMessage,
  onDeleteChatMessage,
  currentUserName,
  currentUserInitials,
  currentUserAvatarPath,
  currentUserRole,
}: LiveTimingChatProps) {
  const [draft, setDraft] = useState('')
  const listRef = useRef<HTMLDivElement | null>(null)
  const [clientId] = useState(() => buildClientId(currentUserName))
  const [isAvatarBroken, setIsAvatarBroken] = useState(false)
  const [brokenAvatars, setBrokenAvatars] = useState<Record<string, boolean>>({})
  const isAdmin = currentUserRole === 'admin'
  const groupedMessages = useMemo(() => groupMessages(chatMessages), [chatMessages])

  useEffect(() => {
    setIsAvatarBroken(false)
  }, [currentUserAvatarPath])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [chatMessages])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const text = draft.trim()
    const authorName = currentUserName || 'Spectateur'

    if (!text || !isConnected) return

    const sent = onSendChatMessage({
      authorName,
      authorInitials: currentUserInitials || getInitials(authorName),
      avatarPath: currentUserAvatarPath ?? null,
      authorRole: currentUserRole ?? null,
      text,
      clientId,
    })

    if (sent) {
      setDraft('')
    }
  }

  return (
    <section className="lt-chat">
      <header className="lt-chat__hero">
        <div>
          <p className="lt-chat__eyebrow">Radio paddock</p>
          <h3 className="lt-chat__title">Discussion en direct</h3>
        </div>
        <div className={`lt-chat__live ${isConnected ? 'lt-chat__live--on' : 'lt-chat__live--off'}`}>
          <Clock3 size={13} />
          {isConnected ? 'Flux ouvert' : 'Hors ligne'}
        </div>
      </header>

      <div className="lt-chat__messages lt-scroll" ref={listRef}>
        {chatMessages.length === 0 ? (
          <div className="lt-chat__empty">
            <p className="lt-chat__empty-title">Le canal est vide pour l’instant.</p>
            <p>Ouvre la discussion avec un message rapide, une stratégie, un pronostic ou un cri du cœur.</p>
          </div>
        ) : null}

        {groupedMessages.map((group) => (
          <div key={group.key} className="lt-chat__message-row">
            <div className="lt-chat__message-avatar">
              {group.authorAvatarPath && !brokenAvatars[group.key] ? (
                <img
                  src={`/${group.authorAvatarPath}`}
                  alt={`Avatar de ${group.authorName}`}
                  className="lt-chat__message-avatar-image"
                  onError={(e) => {
                    setBrokenAvatars((prev) => ({ ...prev, [group.key]: true }))
                    ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                  }}
                />
              ) : (
                <span className="lt-chat__message-avatar-fallback">{group.authorInitials}</span>
              )}
            </div>

            <div className="lt-chat__message-content">
              <div className="lt-chat__message-meta">
                <span className={`lt-chat__message-author lt-chat__author--${(group as any).authorRole ? String((group as any).authorRole).toLowerCase().replace(/[^a-z0-9_-]/g, '-') : 'user'}`}>{group.authorName}</span>
              </div>

              <div className="lt-chat__message-group-lines">
                {group.items.map((message) => (
                  <div key={message.id} className="lt-chat__message-line">
                    <div className="lt-chat__message-text">{message.text}</div>
                    <div className="lt-chat__message-line-meta">
                      {isAdmin ? (
                        <button
                          type="button"
                          className="lt-chat__delete lt-chat__delete--inline"
                          onClick={() => onDeleteChatMessage({ messageId: message.id, requesterRole: currentUserRole || 'simple' })}
                          aria-label={`Supprimer le message de ${group.authorName}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form className="lt-chat__composer-card" onSubmit={handleSubmit}>
        <div className="lt-chat__avatar" aria-hidden="true">
          {currentUserAvatarPath && !isAvatarBroken ? (
            <img
              src={`/${currentUserAvatarPath}`}
              alt="Avatar utilisateur"
              className="lt-chat__avatar-image"
              onError={() => setIsAvatarBroken(true)}
            />
          ) : (
            (currentUserInitials || getInitials(currentUserName || 'SF')).slice(0, 3) || <UserRound size={16} />
          )}
        </div>
        <div className="lt-chat__composer-copy">
          <div className="lt-chat__composer-head">
            <span className="lt-chat__composer-name">{currentUserName || 'Spectateur'}</span>
            {isAdmin ? <span className="lt-chat__composer-badge">Admin</span> : null}
          </div>
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="lt-chat__input lt-chat__input--inline"
            placeholder={isConnected ? 'Ecrire un message...' : 'Connexion en attente...'}
            maxLength={160}
            disabled={!isConnected}
          />
        </div>
        <button type="submit" className="lt-chat__send" disabled={!isConnected || !draft.trim()}>
          <Send size={15} />
          Envoyer
        </button>
      </form>

    </section>
  )
}