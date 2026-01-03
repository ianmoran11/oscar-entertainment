import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type VideoSource = {
  id: string
  url: string
  title?: string
}

export type Playlist = {
    id: string
    name: string
    videos: VideoSource[]
    youtubePlaylistId?: string
}

export type QuizType = 'phonetics' | 'math'

export type QuizItemStats = {
    attempts: number
    correct: number
}

export type QuizStats = {
    totalAttempts: number
    totalCorrect: number
    items: Record<string, QuizItemStats>
}

export type DailyUsage = {
    date: string
    watchTimeSeconds: number
}

interface StatsState {
    stats: {
        phonetics: QuizStats
        math: QuizStats
        usage: DailyUsage[]
    }
    recordQuizAttempt: (type: 'phonetics' | 'math', itemId: string, isCorrect: boolean) => void
    recordWatchTime: (seconds: number) => void
}

interface SettingsState {
  playlists: Playlist[]
  activePlaylistId: string

  interruptionMode: 'time' | 'video_end'
  interruptionIntervalMinutes: number
  enabledQuizTypes: QuizType[]
  mathDifficulty: 1 | 2 | 3 
  requiredCorrectAnswers: number
  incorrectDelaySeconds: number
  phoneticsOptionsCount: number
  quizVolume: number
  youtubeApiKey: string
  
  // Playlist Actions
  addPlaylist: (name: string) => void
  deletePlaylist: (id: string) => void
  updatePlaylistName: (id: string, name: string) => void
  setActivePlaylist: (id: string) => void
  setPlaylistYoutubeId: (id: string, youtubeId: string | undefined) => void
  setPlaylistVideos: (id: string, videos: VideoSource[]) => void

  // Video Actions
  addVideo: (url: string, title?: string, id?: string) => void
  addVideos: (videos: VideoSource[]) => void
  removeVideo: (id: string) => void
  updateSettings: (settings: Partial<SettingsState>) => void
}

interface Store extends SettingsState, StatsState, PlayerState {} // Combined below

interface PlayerState {
  isPlaying: boolean
  isInterrupted: boolean
  currentVideoIndex: number
  lastInterruptionTimestamp: number
  
  setIsPlaying: (playing: boolean) => void
  setInterrupted: (interrupted: boolean) => void
  resetInterruptionTimer: () => void
  nextVideo: () => void
  setVideoIndex: (index: number) => void
}

// removed interface Store extends... line as we do it in create or above
// Actually I need to be careful with the extends. I defined Store above in my replace block but it was inside a text block.
// Store definition needs to include StatsState.

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // Defaults
      stats: {
          phonetics: { totalAttempts: 0, totalCorrect: 0, items: {} },
          math: { totalAttempts: 0, totalCorrect: 0, items: {} },
          usage: []
      },

      playlists: [
          { 
              id: 'default', 
              name: 'My Playlist', 
              videos: [
                  { id: '1', url: 'https://www.youtube.com/watch?v=yCjJyiqpAuU', title: 'Example Video' }
              ] 
          }
      ],
      activePlaylistId: 'default',
      
      interruptionMode: 'time',
      interruptionIntervalMinutes: 5,
      enabledQuizTypes: ['phonetics', 'math'],
      mathDifficulty: 1,
      requiredCorrectAnswers: 1,
      incorrectDelaySeconds: 2,
      phoneticsOptionsCount: 2,
      quizVolume: 1.0,
      youtubeApiKey: '',

      isPlaying: false,
      isInterrupted: false,
      currentVideoIndex: 0,
      lastInterruptionTimestamp: Date.now(),

      // Playlist Actions
      addPlaylist: (name) => {
          const id = Math.random().toString(36).substring(7)
          set(state => ({
              playlists: [...state.playlists, { id, name, videos: [] }],
              activePlaylistId: id
          }))
      },
      deletePlaylist: (id) => set(state => {
          const newPlaylists = state.playlists.filter(p => p.id !== id)
          let newActive = state.activePlaylistId
          if (id === state.activePlaylistId) {
              newActive = newPlaylists.length > 0 ? newPlaylists[0].id : ''
          }
          if (newPlaylists.length === 0) {
               newPlaylists.push({ id: 'default', name: 'My Playlist', videos: [] })
               newActive = 'default'
          }
          return { playlists: newPlaylists, activePlaylistId: newActive }
      }),
      updatePlaylistName: (id, name) => set(state => ({
          playlists: state.playlists.map(p => p.id === id ? { ...p, name } : p)
      })),
      setActivePlaylist: (id) => set({ activePlaylistId: id, currentVideoIndex: 0 }),
      setPlaylistYoutubeId: (id, youtubePlaylistId) => set(state => ({
          playlists: state.playlists.map(p => p.id === id ? { ...p, youtubePlaylistId } : p)
      })),
      setPlaylistVideos: (id, videos) => set(state => ({
          playlists: state.playlists.map(p => p.id === id ? { ...p, videos } : p)
      })),

      // Video Actions
      addVideo: (url, title, manualId) => set(state => {
          const id = manualId || Math.random().toString(36).substring(7)
          const newVideo = { id, url, title: title || `Video` }
          
          return {
              playlists: state.playlists.map(p => {
                  if (p.id === state.activePlaylistId) {
                      return { ...p, videos: [...p.videos, newVideo] }
                  }
                  return p
              })
          }
      }),
      addVideos: (newVideos) => set(state => ({
           playlists: state.playlists.map(p => {
               if (p.id === state.activePlaylistId) {
                   return { ...p, videos: [...p.videos, ...newVideos] }
               }
               return p
           })
      })),
      removeVideo: (id) => set(state => ({
          playlists: state.playlists.map(p => {
              if (p.id === state.activePlaylistId) {
                  return { ...p, videos: p.videos.filter(v => v.id !== id) }
              }
              return p
          })
      })),

      updateSettings: (newSettings) => set((state) => ({ ...state, ...newSettings })),

      // Stats Actions
      recordQuizAttempt: (type, itemId, isCorrect) => set(state => {
          const stats = { ...state.stats }
          const category = stats[type]
          
          // Update Totals
          category.totalAttempts += 1
          if (isCorrect) category.totalCorrect += 1
          
          // Update Item
          const item = category.items[itemId] || { attempts: 0, correct: 0 }
          item.attempts += 1
          if (isCorrect) item.correct += 1
          category.items[itemId] = item
          
          return { stats }
      }),
      
      recordWatchTime: (seconds) => set(state => {
          const today = new Date().toISOString().split('T')[0]
          const usage = [...state.stats.usage]
          const todayEntryIndex = usage.findIndex(u => u.date === today)
          
          if (todayEntryIndex >= 0) {
              usage[todayEntryIndex] = {
                  ...usage[todayEntryIndex],
                  watchTimeSeconds: usage[todayEntryIndex].watchTimeSeconds + seconds
              }
          } else {
              usage.push({ date: today, watchTimeSeconds: seconds })
          }
          
          return { stats: { ...state.stats, usage } }
      }),

      // Player Actions
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setInterrupted: (interrupted) => set({ isInterrupted: interrupted }),
      resetInterruptionTimer: () => set({ lastInterruptionTimestamp: Date.now() }),
      
      nextVideo: () => set((state) => {
          const playlist = state.playlists.find(p => p.id === state.activePlaylistId)
          if (!playlist || playlist.videos.length === 0) return { currentVideoIndex: 0 }
          return { currentVideoIndex: (state.currentVideoIndex + 1) % playlist.videos.length }
      }),
      
      setVideoIndex: (index) => set({ currentVideoIndex: index }),
    }),
    {
      name: 'oscar-entertainment-storage',
      version: 1,
      migrate: (persistedState: any, version: number) => {
          if (version === 0) {
              // Migration from simple video list to playlist
              const videos = persistedState.videos || []
              return {
                  ...persistedState,
                  playlists: [{ id: 'default', name: 'My Playlist', videos }],
                  activePlaylistId: 'default'
              }
          }
          return persistedState
      },
      partialize: (state) => ({
         playlists: state.playlists,
         activePlaylistId: state.activePlaylistId,
         interruptionMode: state.interruptionMode,
         interruptionIntervalMinutes: state.interruptionIntervalMinutes,
         enabledQuizTypes: state.enabledQuizTypes,
         mathDifficulty: state.mathDifficulty,
         requiredCorrectAnswers: state.requiredCorrectAnswers,
         incorrectDelaySeconds: state.incorrectDelaySeconds,
         phoneticsOptionsCount: state.phoneticsOptionsCount,
         quizVolume: state.quizVolume,
         youtubeApiKey: state.youtubeApiKey,
         stats: state.stats
      } as unknown as Store),
    }
  )
)
