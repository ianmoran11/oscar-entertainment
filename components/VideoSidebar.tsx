'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { getYouTubeID } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Clock, PlayCircle, MonitorPlay } from 'lucide-react'

export function VideoSidebar() {
    const { 
        playlists,
        activePlaylistId,
        setActivePlaylist,
        currentVideoIndex, 
        setVideoIndex, 
        interruptionMode,
        interruptionIntervalMinutes,
        lastInterruptionTimestamp,
        isInterrupted
    } = useStore()
    
    const [isOpen, setIsOpen] = useState(false)
    const [timeLeft, setTimeLeft] = useState('')

    const activePlaylist = playlists.find(p => p.id === activePlaylistId)
    const videos = activePlaylist?.videos || []
    
    // Timer Effect
    useEffect(() => {
        if (interruptionMode !== 'time') return
        
        const tick = () => {
            const now = Date.now()
            const elapsed = now - lastInterruptionTimestamp
            const limit = interruptionIntervalMinutes * 60 * 1000
            const remaining = Math.max(0, limit - elapsed)
            
            const mins = Math.floor(remaining / 60000)
            const secs = Math.floor((remaining % 60000) / 1000)
            setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`)
        }
        
        tick() // init
        const interval = setInterval(tick, 1000)
        return () => clearInterval(interval)
    }, [interruptionMode, interruptionIntervalMinutes, lastInterruptionTimestamp])

    return (
        <div 
            className={`fixed top-0 right-0 h-full bg-slate-900/95 backdrop-blur-md border-l border-white/10 transition-transform duration-300 z-40 flex shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            style={{ width: '320px' }}
        >
            {/* Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="absolute top-1/2 -left-12 w-12 h-24 bg-slate-900/95 border-y border-l border-white/10 rounded-l-xl flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer shadow-[-4px_0_10px_rgba(0,0,0,0.3)]"
                aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
            >
                {isOpen ? <ChevronRight className="w-8 h-8" /> : <ChevronLeft className="w-8 h-8" />}
            </button>
            
            <div className="flex flex-col w-full h-full p-6 text-white overflow-hidden">
                <div className="mb-6 space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <MonitorPlay className="w-6 h-6 text-blue-400" /> 
                        Video Library
                    </h2>

                    {/* Playlist Switcher */}
                    <select 
                        value={activePlaylistId} 
                        onChange={(e) => setActivePlaylist(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                    >
                        {playlists.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
                
                {/* Timer Display */}
                {interruptionMode === 'time' && (
                    <div className="mb-6 p-4 bg-slate-800/80 rounded-lg flex items-center justify-between border border-white/5 shadow-inner">
                        <div className="flex items-center gap-2 text-slate-400">
                           <Clock className="w-4 h-4" />
                           <span className="text-xs font-bold uppercase tracking-wider">Time until Quiz</span>
                        </div>
                        <div className="font-mono text-2xl font-bold text-blue-400 tabular-nums">
                           {timeLeft}
                        </div>
                    </div>
                )}
                
                {/* Video List */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {videos.map((video, index) => {
                        const realId = getYouTubeID(video.url) || video.id
                        return (
                            <button
                                key={video.id}
                                onClick={() => setVideoIndex(index)}
                                className={`w-full p-2 rounded-lg text-left transition-all border border-transparent flex items-center gap-3 ${
                                    currentVideoIndex === index 
                                        ? 'bg-blue-600 shadow-lg shadow-blue-500/20 border-blue-400/30' 
                                        : 'bg-white/5 hover:bg-white/10 hover:border-white/10'
                                }`}
                            >
                                <div className="relative w-24 h-14 flex-shrink-0 bg-black/50 rounded overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img 
                                        src={`https://img.youtube.com/vi/${realId}/mqdefault.jpg`}
                                        alt=""
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none'
                                        }}
                                    />
                                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded"></div>
                                </div>

                                <div className="text-sm font-medium line-clamp-2 leading-snug">
                                    {video.title || video.url}
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
