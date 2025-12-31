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
}

export type QuizType = 'phonetics' | 'math'

interface SettingsState {
  playlists: Playlist[]
  activePlaylistId: string

  interruptionMode: 'time' | 'video_end'
  interruptionIntervalMinutes: number
  enabledQuizTypes: QuizType[]
  mathDifficulty: 1 | 2 | 3 
  requiredCorrectAnswers: number
  incorrectDelaySeconds: number
  youtubeApiKey: string
  
  // Playlist Actions
  addPlaylist: (name: string) => void
  deletePlaylist: (id: string) => void
  updatePlaylistName: (id: string, name: string) => void
  setActivePlaylist: (id: string) => void

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

interface Store extends SettingsState, PlayerState {}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // Defaults
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
         youtubeApiKey: state.youtubeApiKey
      } as unknown as Store),
    }
  )
)
