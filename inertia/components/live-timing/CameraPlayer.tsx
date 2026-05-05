import { useEffect, useRef, useState } from 'react'
import type { LiveTimingCamera } from '@/types/live-timing.types'

import type { RaceState } from '@/types/race-state.types'

type CameraPlayerProps = {
    camera: LiveTimingCamera
    sourceUrl: string
    raceState?: RaceState
}

const STATUS_LABEL: Record<'online' | 'alert' | 'maintenance' | 'offline', string> = {
    online: 'Caméra en direct',
    alert: 'Flux sous surveillance',
    maintenance: 'Caméra en maintenance',
    offline: 'Caméra hors ligne',
}

const STATUS_MESSAGE: Record<'maintenance' | 'offline', string> = {
    maintenance: 'Le flux vidéo de ce secteur est temporairement indisponible. Réessaie un peu plus tard.',
    offline: 'La caméra de ce secteur n’est actuellement pas disponible.',
}

export default function CameraPlayer({ camera, sourceUrl, raceState }: CameraPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const liveAnchorRef = useRef<number>(0)
    const [isPlaying, setIsPlaying] = useState(true)
    const [volume, setVolume] = useState(1)

    const isRaceStopped = raceState?.status === 'stopped'
    const isUnavailable = camera.status === 'maintenance' || camera.status === 'offline' || isRaceStopped

    useEffect(() => {
        if (isUnavailable) return

        // Use race start time as sync anchor for all clients, fallback to current time
        liveAnchorRef.current = raceState?.startedAt ?? Date.now()
        const video = videoRef.current
        if (!video) return

        video.pause()
        video.currentTime = 0
        video.load()
        void video.play().catch(() => { })
    }, [camera.id, sourceUrl, isUnavailable, raceState?.startedAt])

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        video.volume = volume
        video.muted = volume === 0
    }, [volume])

    useEffect(() => {
        if (isUnavailable) return

        const video = videoRef.current
        if (!video) return

        const anchor = raceState?.startedAt ?? Date.now()
        liveAnchorRef.current = anchor

        const syncVideo = () => {
            if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return
            const elapsedSeconds = (Date.now() - liveAnchorRef.current) / 1000
            const targetTime = elapsedSeconds % video.duration
            // Tolérance de 0.5s — au delà on recale, sinon on laisse tourner
            if (Math.abs(video.currentTime - targetTime) > 0.5) {
                video.currentTime = targetTime
            }
        }

        video.pause()
        video.currentTime = 0
        video.load()

        const onLoaded = () => {
            syncVideo()
            void video.play().catch(() => { })
        }

        video.addEventListener('loadedmetadata', onLoaded)

        // Resync toutes les 5 secondes pour rattraper la dérive
        const syncInterval = setInterval(syncVideo, 5000)

        return () => {
            video.removeEventListener('loadedmetadata', onLoaded)
            clearInterval(syncInterval)
        }
    }, [camera.id, sourceUrl, isUnavailable, raceState?.startedAt])

    const seekToLivePoint = () => {
        const video = videoRef.current
        if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return
        const elapsedSeconds = (Date.now() - liveAnchorRef.current) / 1000
        video.currentTime = elapsedSeconds % video.duration
    }

    const togglePlayback = () => {
        const video = videoRef.current
        if (!video) return

        if (video.paused) {
            seekToLivePoint()
            void video.play().catch(() => { })
            setIsPlaying(true)
            return
        }

        video.pause()
        setIsPlaying(false)
    }

    const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const nextVolume = Number(event.target.value)
        setVolume(nextVolume)
        const video = videoRef.current
        if (video) {
            video.volume = nextVolume
            video.muted = nextVolume === 0
        }
    }

    if (isUnavailable) {
        let title = 'Flux indisponible'
        let message = 'La caméra est actuellement indisponible.'

        if (isRaceStopped) {
            title = 'Course arrêtée'
            message = 'Le flux vidéo n\'est disponible que pendant la course.'
        } else if (camera.status === 'maintenance') {
            title = STATUS_LABEL[camera.status]
            message = STATUS_MESSAGE[camera.status]
        } else if (camera.status === 'offline') {
            title = STATUS_LABEL[camera.status]
            message = STATUS_MESSAGE[camera.status]
        }

        return (
            <div className="lt-camera-player lt-camera-player--unavailable">
                <div className="lt-camera-player__status-panel" role="status" aria-live="polite">
                    <p className="lt-camera-player__status-title">{title}</p>
                    <p className="lt-camera-player__status-text">{message}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="lt-camera-player">
            <div className="lt-camera-player__frame">
                <video
                    ref={videoRef}
                    className="lt-camera-player__video"
                    muted
                    autoPlay
                    loop
                    playsInline
                    preload="metadata"
                    controls={false}
                    disablePictureInPicture
                    controlsList="nodownload noplaybackrate noremoteplayback"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                >
                    <source src={sourceUrl} type="video/mp4" />
                </video>

                <div className="lt-camera-player__progress" aria-hidden="true">
                    <div className="lt-camera-player__progress-track">
                        <div className="lt-camera-player__progress-fill" />
                    </div>
                </div>

                <div className="lt-camera-player__controls" aria-label="Contrôles du lecteur caméra">
                    <button type="button" className="lt-camera-player__control-button" onClick={togglePlayback}>
                        {isPlaying ? 'Pause' : 'Lecture'}
                    </button>

                    <label className="lt-camera-player__volume" aria-label="Volume du lecteur caméra">
                        <span className="lt-camera-player__volume-label">Volume</span>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="lt-camera-player__volume-range"
                        />
                    </label>
                </div>
            </div>

        </div>
    )
}