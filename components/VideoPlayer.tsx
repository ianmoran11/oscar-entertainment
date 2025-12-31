'use client'

import { useEffect, useRef, useState } from 'react'
import YouTube, { YouTubeEvent, YouTubePlayer } from 'react-youtube'
import { useStore } from '@/store/useStore'
import { getYouTubeID } from '@/lib/utils'
import { Play, Pause } from 'lucide-react'

export function VideoPlayer() {
  const { 
    playlists,
    activePlaylistId,
    currentVideoIndex, 
    interruptionMode, 
    interruptionIntervalMinutes,
    isInterrupted, 
    setInterrupted,
    nextVideo,
    lastInterruptionTimestamp,
    resetInterruptionTimer
  } = useStore()

  const activePlaylist = playlists.find(p => p.id === activePlaylistId)
  const videos = activePlaylist?.videos || []

  const playerRef = useRef<YouTubePlayer | null>(null)
  
  const currentVideo = videos[currentVideoIndex]
  const [videoId, setVideoId] = useState<string | null>(null)
  const [isPlayingLocal, setIsPlayingLocal] = useState(false)

  // Update video ID when current video changes
  useEffect(() => {
    if (currentVideo) {
      const id = getYouTubeID(currentVideo.url) || currentVideo.url
      setVideoId(id)
    }
  }, [currentVideo])

  // Monitor Wall-Clock Time for interruptions
  useEffect(() => {
    if (interruptionMode === 'time' && !isInterrupted) {
      const interval = setInterval(() => {
         const elapsed = Date.now() - lastInterruptionTimestamp
         const limit = interruptionIntervalMinutes * 60 * 1000
         
         if (elapsed >= limit && limit > 0) {
           triggerInterruption()
         }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [interruptionMode, interruptionIntervalMinutes, isInterrupted, lastInterruptionTimestamp])

  const triggerInterruption = () => {
    if (playerRef.current) {
        playerRef.current.pauseVideo()
        setIsPlayingLocal(false)
    }
    setInterrupted(true)
  }

  // Handle Pause/Resume logic based on interruption state
  useEffect(() => {
    if (isInterrupted && playerRef.current) {
      playerRef.current.pauseVideo()
      setIsPlayingLocal(false)
    } else if (!isInterrupted && playerRef.current) {
        // Reset the timer when we resume/start normal playback state
        resetInterruptionTimer()
        
        // Attempt to play, catching potential abort errors
        // Adding a small delay to ensure player is ready and state is clean
        setTimeout(() => {
            try {
                if (playerRef.current) {
                    playerRef.current.playVideo()
                }
            } catch (e) {
                console.error("Error resuming video:", e)
            }
        }, 100)
    }
  }, [isInterrupted, resetInterruptionTimer])

  const onReady = (event: YouTubeEvent) => {
    playerRef.current = event.target
    // Auto-play
    event.target.playVideo()
    
    // Ensure quality/settings?
    // Note: 'modestbranding' and 'rel' are handled in opts
  }

  const onStateChange = (event: YouTubeEvent) => {
      // Sync local playing state (1 = playing)
      setIsPlayingLocal(event.data === 1)
  }

  const onEnd = () => {
    if (interruptionMode === 'video_end') {
       setInterrupted(true)
    } else {
       nextVideo()
    }
  }

  const onError = () => {
    console.warn("Video error, skipping")
    nextVideo()
  }

  const togglePlay = () => {
      if (!playerRef.current) return
      
      if (isPlayingLocal) {
          playerRef.current.pauseVideo()
      } else {
          playerRef.current.playVideo()
      }
      // Note: onStateChange will update the icon, but we can optimistically update if latency is high
  }

  if (!currentVideo) return <div className="p-10 text-center">No videos configured. Please go to Settings.</div>
  if (!videoId) return <div className="p-10 text-center">Invalid Video URL</div>

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black relative group">
      
      {/* Video Container */}
      <div className={`w-full aspect-video max-h-screen relative ${isInterrupted ? 'hidden' : 'block'}`}>
         
         {/* Youtube Player */}
         <YouTube
            videoId={videoId}
            className="w-full h-full"
            iframeClassName="w-full h-full pointer-events-none" // Disable all interaction with iframe
            onReady={onReady}
            onEnd={onEnd}
            onError={onError}
            onStateChange={onStateChange}
            opts={{
              playerVars: {
                autoplay: 1,
                controls: 0, // Hide native controls
                disablekb: 1, // Disable keyboard controls
                iv_load_policy: 3, // Hide annotations
                modestbranding: 1,
                rel: 0,
                fs: 0, // Disable fullscreen button (since we supply our own UI)
              }
            }}
         />

         {/* Click Overlay to Toggle Play/Pause */}
         <div 
            className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer"
            onClick={togglePlay}
         >
            {/* Play/Pause Indicator (fades out when playing) */}
            <div className={`transition-opacity duration-300 ${isPlayingLocal ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                <div className="bg-black/50 p-6 rounded-full text-white backdrop-blur-sm hover:scale-110 transition-transform">
                    {isPlayingLocal ? <Pause className="w-12 h-12" /> : <Play className="w-12 h-12 ml-1" />}
                </div>
            </div>
         </div>

      </div>

      {isInterrupted && (
          <div className="text-white text-2xl">Quiz Triggered</div>
      )}
    </div>
  )
}
