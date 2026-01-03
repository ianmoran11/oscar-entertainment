'use client'

import { useStore, VideoSource } from '@/store/useStore'
import { getYouTubeID } from '@/lib/utils'
import { Trash2, Plus, ArrowLeft, Loader2, Key, LayoutList, FolderPlus, RefreshCw, Link as LinkIcon, Unlink, Youtube, Activity } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function SettingsPage() {
  const [hasMounted, setHasMounted] = useState(false)
  const { 
    playlists,
    activePlaylistId,
    addPlaylist,
    deletePlaylist,
    setActivePlaylist, // Use this for switching context
    setPlaylistYoutubeId,
    setPlaylistVideos,
    addVideo, 
    addVideos,
    removeVideo,
    interruptionMode,
    interruptionIntervalMinutes,
    enabledQuizTypes,
    mathDifficulty,
    requiredCorrectAnswers,
    incorrectDelaySeconds,
    phoneticsOptionsCount,
    quizVolume,
    youtubeApiKey,
    updateSettings
  } = useStore()

  const [newUrl, setNewUrl] = useState('')
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  const activePlaylist = playlists.find(p => p.id === activePlaylistId)
  const videos = activePlaylist?.videos || []

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) return null

  const handleAddPlaylist = (e: React.FormEvent) => {
      e.preventDefault()
      if (newPlaylistName.trim()) {
          addPlaylist(newPlaylistName)
          setNewPlaylistName('')
      }
  }

  const handleDeletePlaylist = (id: string) => {
      if (confirm('Are you sure you want to delete this playlist?')) {
          deletePlaylist(id)
      }
  }

  const fetchPlaylistVideos = async (playlistId: string): Promise<VideoSource[]> => {
      const res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${youtubeApiKey}`)
      const data = await res.json()
      
      if (data.error) {
          throw new Error(data.error.message)
      } 
      
      if (data.items) {
          return data.items
              .filter((item: any) => item.snippet.title !== 'Private video' && item.snippet.title !== 'Deleted video')
              .map((item: any) => ({
                  id: item.snippet.resourceId.videoId,
                  url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
                  title: item.snippet.title
              }))
      }
      return []
  }

  const handleSyncPlaylist = async () => {
      if (!activePlaylist?.youtubePlaylistId || !youtubeApiKey) return
      
      setIsSyncing(true)
      try {
          const videos = await fetchPlaylistVideos(activePlaylist.youtubePlaylistId)
          if (confirm(`Found ${videos.length} videos. This will replace the current videos in this playlist. Continue?`)) {
              setPlaylistVideos(activePlaylistId, videos)
          }
      } catch (e: any) {
          alert(`Sync failed: ${e.message}`)
      } finally {
          setIsSyncing(false)
      }
  }

  const handleLinkPlaylist = async (e: React.FormEvent) => {
      e.preventDefault()
      const playlistMatch = linkUrl.match(/[&?]list=([^&]+)/i)
      const playlistId = playlistMatch ? playlistMatch[1] : linkUrl // Fallback to raw ID if no match

      if (playlistId) {
          setPlaylistYoutubeId(activePlaylistId, playlistId)
          setLinkUrl('')
          setShowLinkInput(false)
          
          // Optionally auto-sync
          if (confirm('Playlist linked! Do you want to sync videos now?')) {
               setIsSyncing(true)
               try {
                   const videos = await fetchPlaylistVideos(playlistId)
                   setPlaylistVideos(activePlaylistId, videos)
               } catch (e: any) {
                   alert(`Sync failed: ${e.message}`)
               } finally {
                   setIsSyncing(false)
               }
          }
      }
  }

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUrl) return

    setIsLoading(true)

    try {
        // Check for Playlist
        const playlistMatch = newUrl.match(/[&?]list=([^&]+)/i)
        const playlistId = playlistMatch ? playlistMatch[1] : null

        if (playlistId && youtubeApiKey) {
            const videos = await fetchPlaylistVideos(playlistId)
            addVideos(videos)
            setNewUrl('')
        } else {
            // Single Video
            const id = getYouTubeID(newUrl)
            let title = ''

            if (id && youtubeApiKey) {
                 try {
                    const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${id}&key=${youtubeApiKey}`)
                    const data = await res.json()
                    if (data.items && data.items.length > 0) {
                        title = data.items[0].snippet.title
                    }
                 } catch (e) {
                     console.error("Failed to fetch title", e)
                 }
            }

            // Fallback if extraction failed or no API key, addVideo handles ID generation if needed
            // But we should pass extracted ID if we have it to ensure thumbnails work
            addVideo(newUrl, title, id || undefined)
            setNewUrl('')
        }
    } catch (e) {
        console.error(e)
        alert("Failed to add video(s). Please check console.")
    } finally {
        setIsLoading(false)
    }
  }

  const toggleQuizType = (type: 'phonetics' | 'math') => {
    if (enabledQuizTypes.includes(type)) {
      updateSettings({ enabledQuizTypes: enabledQuizTypes.filter(t => t !== type) })
    } else {
      updateSettings({ enabledQuizTypes: [...enabledQuizTypes, type] })
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-2xl mx-auto space-y-12">
        
        <header className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft />
          </Link>
          <div className="flex-1 flex items-center justify-between">
              <h1 className="text-3xl font-bold">Settings</h1>
              <Link href="/stats" className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 text-blue-400 font-medium">
                <Activity size={18} /> View Statistics
              </Link>
          </div>
        </header>

        {/* Video Management */}
        {/* Playlist Management */}
        <section className="space-y-4">
            <h2 className="text-xl font-semibold opacity-80 flex items-center gap-2">
                <LayoutList className="w-5 h-5" /> 
                Playlists
            </h2>

            {/* Create Playlist */}
            <form onSubmit={handleAddPlaylist} className="flex gap-2 mb-6">
                <input 
                    type="text" 
                    placeholder="New Playlist Name..." 
                    value={newPlaylistName}
                    onChange={e => setNewPlaylistName(e.target.value)}
                    className="flex-1 bg-slate-800 rounded-lg px-4 py-3 border border-slate-700 focus:outline-none focus:border-blue-500"
                />
                <button 
                    type="submit"
                    className="bg-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-500 transition-colors flex items-center gap-2"
                >
                    <FolderPlus size={20} /> Create
                </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {playlists.map(playlist => (
                    <div 
                        key={playlist.id}
                        onClick={() => setActivePlaylist(playlist.id)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all flex items-center justify-between group ${
                            playlist.id === activePlaylistId 
                            ? 'bg-blue-600/20 border-blue-500 ring-1 ring-blue-500' 
                            : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                        }`}
                    >
                        <div className="flex-1">
                            <h3 className={`font-bold ${playlist.id === activePlaylistId ? 'text-blue-400' : 'text-slate-200'}`}>
                                {playlist.name}
                            </h3>
                            <div className="text-xs text-slate-500">{playlist.videos.length} videos</div>
                        </div>
                        {playlists.length > 1 && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleDeletePlaylist(playlist.id); }}
                                className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded-full text-red-400 transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </section>

        {/* Video Management (Active Playlist) */}
        <section className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end">
             <div className="space-y-2">
                 <h2 className="text-xl font-semibold opacity-80">
                    Videos in <span className="text-blue-400">"{activePlaylist?.name}"</span>
                 </h2>
                 
                 {/* ID Sync Controls */}
                 <div className="flex items-center gap-3">
                     {activePlaylist?.youtubePlaylistId ? (
                         <div className="flex items-center gap-2 bg-blue-900/30 text-blue-300 px-3 py-1.5 rounded-full text-xs font-medium border border-blue-500/30">
                             <Youtube size={14} />
                             <span>Linked</span>
                             <div className="w-px h-3 bg-blue-500/30 mx-1" />
                             <button 
                                 onClick={handleSyncPlaylist}
                                 disabled={isSyncing}
                                 className="hover:text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
                                 title="Sync with YouTube Playlist"
                             >
                                 <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} />
                                 {isSyncing ? "Syncing..." : "Sync"}
                             </button>
                             <div className="w-px h-3 bg-blue-500/30 mx-1" />
                             <button 
                                 onClick={() => {
                                     if(confirm('Unlink this playlist from YouTube?')) {
                                         setPlaylistYoutubeId(activePlaylistId, undefined)
                                     }
                                 }}
                                 className="hover:text-red-300 transition-colors"
                                 title="Unlink"
                             >
                                 <Unlink size={12} />
                             </button>
                         </div>
                     ) : (
                         !showLinkInput ? (
                             <button 
                                 onClick={() => setShowLinkInput(true)}
                                 className="text-xs flex items-center gap-1.5 text-slate-400 hover:text-blue-400 transition-colors"
                             >
                                 <LinkIcon size={12} /> Link YouTube Playlist
                             </button>
                         ) : (
                             <form onSubmit={handleLinkPlaylist} className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                                 <input 
                                     type="text" 
                                     placeholder="YouTube Playlist URL or ID" 
                                     value={linkUrl}
                                     onChange={(e) => setLinkUrl(e.target.value)}
                                     autoFocus
                                     className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs w-48 focus:outline-none focus:border-blue-500"
                                 />
                                 <button 
                                     type="submit"
                                     className="text-xs bg-blue-600 px-2 py-1 rounded hover:bg-blue-500"
                                 >
                                     Link
                                 </button>
                                 <button 
                                     type="button"
                                     onClick={() => setShowLinkInput(false)}
                                     className="text-xs text-slate-400 hover:text-slate-200"
                                 >
                                     Cancel
                                 </button>
                             </form>
                         )
                     )}
                 </div>
             </div>
          </div>
          
          {/* API Key Input */}
          <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex items-center gap-3">
              <Key className="text-slate-400 w-5 h-5 flex-shrink-0" />
              <input 
                type="text"
                placeholder="YouTube Data API Key (Optional - for Playlists & Titles)"
                value={youtubeApiKey}
                onChange={(e) => updateSettings({ youtubeApiKey: e.target.value })}
                className="bg-transparent flex-1 focus:outline-none text-sm text-blue-300 placeholder-slate-500"
              />
          </div>

          <form onSubmit={handleAddVideo} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Paste YouTube Video or Playlist URL..." 
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-slate-800 rounded-lg px-4 py-3 border border-slate-700 focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-500 transition-colors flex items-center gap-2 disabled:bg-slate-700"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />} 
              {isLoading ? 'Loading' : 'Add'}
            </button>
          </form>

          <div className="space-y-2 mt-4 max-h-60 overflow-y-auto pr-2">
            {videos.map(video => (
              <div key={video.id} className="flex items-center justify-between bg-slate-800 p-3 rounded-lg group gap-3">
                 {/* Thumbnail Preview */}
                 <img 
                    src={`https://img.youtube.com/vi/${video.id}/default.jpg`} 
                    alt=""
                    className="w-12 h-9 object-cover rounded bg-black"
                    onError={(e) => e.currentTarget.style.display = 'none'}
                 />
                <div className="flex-1 min-w-0">
                    <div className="truncate text-white text-sm font-medium">{video.title || video.url}</div>
                    <div className="truncate text-slate-500 text-xs">{video.url}</div>
                </div>
                <button 
                  onClick={() => removeVideo(video.id)}
                  className="text-red-400 opacity-20 group-hover:opacity-100 p-2 hover:bg-slate-900 rounded transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            {videos.length === 0 && <p className="text-slate-500 italic">No videos added yet.</p>}
          </div>
        </section>

        {/* Interruption Rules */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold opacity-80">Interruptions</h2>
          
          <div className="bg-slate-800 rounded-lg p-6 space-y-6 border border-slate-700">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-400">Interrupt Mode</label>
              <div className="flex gap-4">
                <button 
                  onClick={() => updateSettings({ interruptionMode: 'time' })}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all ${interruptionMode === 'time' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                >
                  Timer
                </button>
                <button 
                  onClick={() => updateSettings({ interruptionMode: 'video_end' })}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all ${interruptionMode === 'video_end' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                >
                  End of Video
                </button>
              </div>
            </div>

            {interruptionMode === 'time' && (
              <div className="flex flex-col gap-2">
                <label className="text-sm text-slate-400">Minutes between Quizzes</label>
                <input 
                  type="number" 
                  min="1"
                  max="60"
                  value={interruptionIntervalMinutes}
                  onChange={(e) => updateSettings({ interruptionIntervalMinutes: parseInt(e.target.value) || 5 })}
                  className="bg-slate-900 rounded-lg px-4 py-3 border border-slate-700"
                />
              </div>
            )}
          </div>
        </section>

        {/* Quiz Configuration */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold opacity-80">Quiz Content</h2>
          
          <div className="bg-slate-800 rounded-lg p-6 space-y-6 border border-slate-700">
            <div className="flex gap-4">
               <label className="flex items-center gap-3 bg-slate-900 p-4 rounded-lg flex-1 cursor-pointer">
                 <input 
                   type="checkbox" 
                   checked={enabledQuizTypes.includes('phonetics')}
                   onChange={() => toggleQuizType('phonetics')}
                   className="w-5 h-5 accent-blue-500"
                 />
                 <span>Phonetics</span>
               </label>
               <label className="flex items-center gap-3 bg-slate-900 p-4 rounded-lg flex-1 cursor-pointer">
                 <input 
                   type="checkbox" 
                   checked={enabledQuizTypes.includes('math')}
                   onChange={() => toggleQuizType('math')}
                   className="w-5 h-5 accent-blue-500"
                 />
                 <span>Math</span>
               </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-700">
               <div className="flex flex-col gap-2">
                  <label className="text-sm text-slate-400">Required Correct Answers</label>
                  <input 
                    type="number" 
                    min="1" max="20"
                    value={requiredCorrectAnswers}
                    onChange={(e) => updateSettings({ requiredCorrectAnswers: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="bg-slate-900 rounded-lg px-4 py-3 border border-slate-700"
                  />
               </div>
               <div className="flex flex-col gap-2">
                   <label className="text-sm text-slate-400">Incorrect Delay (seconds)</label>
                   <input 
                     type="number" 
                     min="0" step="0.5"
                     value={incorrectDelaySeconds}
                     onChange={(e) => updateSettings({ incorrectDelaySeconds: Math.max(0, parseFloat(e.target.value) || 0) })}
                     className="bg-slate-900 rounded-lg px-4 py-3 border border-slate-700"
                   />
               </div>

               <div className="flex flex-col gap-2">
                    <label className="text-sm text-slate-400">Phonetics Options (2-8)</label>
                    <input 
                        type="number"
                        min="2" max="8"
                        value={phoneticsOptionsCount}
                        onChange={(e) => updateSettings({ phoneticsOptionsCount: Math.min(8, Math.max(2, parseInt(e.target.value) || 2)) })}
                        className="bg-slate-900 rounded-lg px-4 py-3 border border-slate-700"
                    />
                </div>
                
                <div className="flex flex-col gap-2">
                    <label className="text-sm text-slate-400">Quiz Volume ({Math.round(quizVolume * 100)}%)</label>
                    <div className="h-full flex items-center px-2">
                        <input 
                            type="range"
                            min="0" max="100"
                            value={quizVolume * 100}
                            onChange={(e) => updateSettings({ quizVolume: parseInt(e.target.value) / 100 })}
                            className="w-full accent-blue-500 h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {enabledQuizTypes.includes('math') && (
              <div className="space-y-3 pt-4 border-t border-slate-700">
                <label className="text-sm text-slate-400">Math Difficulty</label>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map(level => (
                    <button
                      key={level}
                      onClick={() => updateSettings({ mathDifficulty: level as 1|2|3 })}
                      className={`py-2 rounded-lg text-sm border transition-all ${
                        mathDifficulty === level 
                          ? 'border-purple-500 bg-purple-500/20 text-purple-300' 
                          : 'border-slate-700 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {level === 1 && 'Numbers'}
                      {level === 2 && 'Addition'}
                      {level === 3 && 'Multiplication'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  )
}
