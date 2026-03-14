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

export type QuizType = 'phonetics' | 'words'

export type QuizItemStats = {
    attempts: number
    correct: number
    history: boolean[] // Last 10 attempts (true=correct, false=incorrect)
}

export type QuizStats = {
    totalAttempts: number
    totalCorrect: number
    items: Record<string, QuizItemStats>
}

export type DailyUsage = {
    date: string
    watchTimeSeconds: number
    quizAttempts: number
    quizCorrect: number
}

export type QuizLogEntry = {
    timestamp: string // ISO string
    type: QuizType
    itemId: string
    isCorrect: boolean
}

interface StatsState {
    stats: {
        phonetics: QuizStats
        words: QuizStats
        usage: DailyUsage[]
        quizLog: QuizLogEntry[]
    }
    recordQuizAttempt: (type: 'phonetics' | 'words', itemId: string, isCorrect: boolean) => void
    recordWatchTime: (seconds: number) => void
}

interface SettingsState {
  playlists: Playlist[]
  activePlaylistId: string

  interruptionMode: 'time' | 'video_end'
  interruptionIntervalMinutes: number
  enabledQuizTypes: QuizType[]
  requiredCorrectAnswers: number
  incorrectDelaySeconds: number
  phoneticsOptionsCount: number
  wordsOptionsCount: number
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

interface Store extends SettingsState, StatsState, PlayerState {}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // Defaults
      stats: {
          phonetics: { totalAttempts: 0, totalCorrect: 0, items: {} },
          words: { totalAttempts: 0, totalCorrect: 0, items: {} },
          usage: [],
          quizLog: []
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
      enabledQuizTypes: ['phonetics', 'words'],
      requiredCorrectAnswers: 1,
      incorrectDelaySeconds: 2,
      phoneticsOptionsCount: 2,
      wordsOptionsCount: 3,
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
          
          // Ensure category exists (for new quiz types added after initial setup)
          if (!stats[type]) {
              stats[type] = { totalAttempts: 0, totalCorrect: 0, items: {} }
          }
          
          const category = stats[type]
          
          // Update Totals
          category.totalAttempts += 1
          if (isCorrect) category.totalCorrect += 1
          
          // Update Item
          const item = category.items[itemId] || { attempts: 0, correct: 0, history: [] }
          item.attempts += 1
          if (isCorrect) item.correct += 1
          
          // Update History (Keep last 10)
          item.history = [...(item.history || []), isCorrect].slice(-10)
          
          category.items[itemId] = item

          // Update Daily Stats
          const today = new Date().toISOString().split('T')[0]
          const usage = [...stats.usage]
          const todayEntryIndex = usage.findIndex(u => u.date === today)
          
          if (todayEntryIndex >= 0) {
              usage[todayEntryIndex] = {
                  ...usage[todayEntryIndex],
                  quizAttempts: (usage[todayEntryIndex].quizAttempts || 0) + 1,
                  quizCorrect: (usage[todayEntryIndex].quizCorrect || 0) + (isCorrect ? 1 : 0)
              }
          } else {
              usage.push({ 
                  date: today, 
                  watchTimeSeconds: 0, 
                  quizAttempts: 1, 
                  quizCorrect: isCorrect ? 1 : 0 
              })
          }
          
          // Append to quiz log
          const quizLog = [...(stats.quizLog || []), {
              timestamp: new Date().toISOString(),
              type,
              itemId,
              isCorrect
          }]

          return { stats: { ...stats, usage, quizLog } }
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
              usage.push({ 
                  date: today, 
                  watchTimeSeconds: seconds,
                  quizAttempts: 0,
                  quizCorrect: 0
              })
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
      version: 4,
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
          if (version === 1) {
              // Migration to add words quiz type
              const stats = persistedState.stats || {}
              if (!stats.words) {
                  stats.words = { totalAttempts: 0, totalCorrect: 0, items: {} }
              }
              return {
                  ...persistedState,
                  stats,
                  wordsOptionsCount: persistedState.wordsOptionsCount || 3,
                  enabledQuizTypes: persistedState.enabledQuizTypes?.includes('words')
                      ? persistedState.enabledQuizTypes
                      : [...(persistedState.enabledQuizTypes || ['phonetics', 'math']), 'words']
              }
          }
          if (version === 2) {
              // Migration to add quiz log
              const stats = persistedState.stats || {}
              if (!stats.quizLog) {
                  stats.quizLog = []
              }
              return { ...persistedState, stats }
          }
          if (version === 3) {
              // Migration to remove math quiz
              const stats = { ...persistedState.stats }
              delete stats.math
              const enabledQuizTypes = (persistedState.enabledQuizTypes || []).filter((t: string) => t !== 'math')
              return { ...persistedState, stats, enabledQuizTypes }
          }
          return persistedState
      },
      partialize: (state) => ({
         playlists: state.playlists,
         activePlaylistId: state.activePlaylistId,
         interruptionMode: state.interruptionMode,
         interruptionIntervalMinutes: state.interruptionIntervalMinutes,
         enabledQuizTypes: state.enabledQuizTypes,
         requiredCorrectAnswers: state.requiredCorrectAnswers,
         incorrectDelaySeconds: state.incorrectDelaySeconds,
         phoneticsOptionsCount: state.phoneticsOptionsCount,
         wordsOptionsCount: state.wordsOptionsCount,
         quizVolume: state.quizVolume,
         youtubeApiKey: state.youtubeApiKey,
         stats: state.stats
      } as unknown as Store),
    }
  )
)
