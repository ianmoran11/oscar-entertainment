'use client'

import { VideoPlayer } from '@/components/VideoPlayer'
import { QuizContainer } from '@/components/QuizContainer'
import { VideoSidebar } from '@/components/VideoSidebar'
import { Settings } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Home() {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) return <div className="bg-black h-screen w-screen" />

  return (
    <main className="relative h-screen w-screen bg-black overflow-hidden hover:cursor-none active:cursor-auto">
      <VideoPlayer />
      <QuizContainer />
      <VideoSidebar />

      <Link 
        href="/settings"
        className="absolute bottom-4 right-4 p-4 text-white/10 hover:text-white/50 transition-colors z-30"
      >
        <Settings className="w-6 h-6" />
      </Link>
    </main>
  )
}
