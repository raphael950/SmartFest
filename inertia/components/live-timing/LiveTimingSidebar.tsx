import { useState } from 'react'
import { MessageSquareMore, Radio, Trophy } from 'lucide-react'
import Leaderboard from './Leaderboard'
import LiveTimingChat from './LiveTimingChat'
import '@/css/components/live-timing/LiveTimingSidebar.css'
import type { Driver, LiveTimingChatMessage } from '@/types/live-timing.types'

interface LiveTimingSidebarProps {
  drivers: Driver[]
  selectedDriverIds: number[]
  onDriverClick: (id: number) => void
  chatMessages: LiveTimingChatMessage[]
  isConnected: boolean
  onSendChatMessage: (message: {
    authorName: string
    authorInitials: string
    avatarPath?: string | null
    authorRole?: string | null
    text: string
    clientId: string
  }) => boolean
  onDeleteChatMessage: (payload: { messageId: string; requesterRole: string }) => boolean
  currentUserName: string
  currentUserInitials: string | null
  currentUserAvatarPath: string | null
  currentUserRole: string | null
}

export default function LiveTimingSidebar({
  drivers,
  selectedDriverIds,
  onDriverClick,
  chatMessages,
  isConnected,
  onSendChatMessage,
  onDeleteChatMessage,
  currentUserName,
  currentUserInitials,
  currentUserAvatarPath,
  currentUserRole,
}: LiveTimingSidebarProps) {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'chat'>('leaderboard')

  return (
    <div className="lt-sidebar lt-glass lt-glass--bright lt-panel-section">
      <div className="lt-sidebar__topline">
        <span className="lt-sidebar__eyebrow">Paddock radio</span>
        <span className="lt-sidebar__status">
          <Radio size={12} /> Live
        </span>
      </div>

      <div className="lt-sidebar__tabs">
        <div className="lt-sidebar__tablist" role="tablist" aria-label="Classement et chat live">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'leaderboard'}
            className={`lt-sidebar__tab ${activeTab === 'leaderboard' ? 'lt-sidebar__tab--active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            <Trophy size={14} /> Classement
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'chat'}
            className={`lt-sidebar__tab ${activeTab === 'chat' ? 'lt-sidebar__tab--active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquareMore size={14} /> Chat
          </button>
        </div>

        <div className="lt-sidebar__content" role="tabpanel">
          {activeTab === 'leaderboard' ? (
            <Leaderboard
              drivers={drivers}
              selectedDriverIds={selectedDriverIds}
              onDriverClick={onDriverClick}
            />
          ) : (
            <LiveTimingChat
              chatMessages={chatMessages}
              isConnected={isConnected}
              onSendChatMessage={onSendChatMessage}
              onDeleteChatMessage={onDeleteChatMessage}
              currentUserName={currentUserName}
              currentUserInitials={currentUserInitials}
              currentUserAvatarPath={currentUserAvatarPath}
              currentUserRole={currentUserRole}
            />
          )}
        </div>
      </div>
    </div>
  )
}