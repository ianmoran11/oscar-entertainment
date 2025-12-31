'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { getAllLetters, getLetterChoices, getRandomLetter } from '@/data/letters'
import confetti from 'canvas-confetti'
import { Volume2, Star } from 'lucide-react'

interface PhoneticsQuizProps {
  onComplete: () => void
  requiredCorrect: number
  incorrectDelay: number
}

export function PhoneticsQuiz({ onComplete, requiredCorrect, incorrectDelay }: PhoneticsQuizProps) {
  const [target, setTarget] = useState<any>(null)
  const [choices, setChoices] = useState<any[]>([])
  const [status, setStatus] = useState<'thinking' | 'correct' | 'incorrect'>('thinking')
  const [score, setScore] = useState(0)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const playSound = (path: string) => {
    if (audioRef.current) {
        audioRef.current.src = path
        audioRef.current.play().catch(e => console.error("Audio play failed", e))
    }
  }

  const initRound = useCallback(() => {
    const all = getAllLetters()
    const t = getRandomLetter(all)
    const c = getLetterChoices(t, 3, all)
    setTarget(t)
    setChoices(c)
    setStatus('thinking')
    
    // Play sound after a short delay
    setTimeout(() => {
      playSound(t.soundFile)
    }, 500)
  }, []) // Dependencies? Empty is fine as data doesn't change

  // Initialize on mount
  useEffect(() => {
    initRound()
  }, [initRound])

  const handleChoice = (letter: any) => {
    if (status !== 'thinking') return // Prevent multiple clicks or clicks during delay

    if (letter.id === target.id) {
      setStatus('correct')
      playSound('/sounds/success.mp3')
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })

      const newScore = score + 1
      setScore(newScore)

      if (newScore >= requiredCorrect) {
          setTimeout(onComplete, 3000) // Finish
      } else {
          // Next round
          setTimeout(() => {
              initRound()
          }, 2000)
      }
    } else {
      setStatus('incorrect')
      setTimeout(() => setStatus('thinking'), incorrectDelay * 1000)
    }
  }

  const replaySound = () => {
    if (target) playSound(target.soundFile)
  }

  if (!target) return <div>Loading...</div>

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white/90 rounded-2xl shadow-2xl max-w-2xl w-full mx-4">
      {/* Header with Progress */}
      <div className="w-full flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Find the sound</h2>
          <div className="flex gap-1">
              {Array.from({ length: requiredCorrect }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-6 h-6 transition-all ${i < score ? 'fill-yellow-400 text-yellow-400 scale-110' : 'text-slate-300'}`} 
                  />
              ))}
          </div>
      </div>
      
      <button 
        onClick={replaySound}
        className="mb-8 p-6 bg-blue-500 rounded-full hover:bg-blue-600 transition-transform active:scale-95 shadow-lg animate-pulse"
      >
        <Volume2 className="w-12 h-12 text-white" />
      </button>

      <div className="grid grid-cols-3 gap-6 w-full">
        {choices.map((letter) => (
          <button
            key={letter.id}
            onClick={() => handleChoice(letter)}
            disabled={status !== 'thinking'}
            className={`
              aspect-square rounded-2xl text-6xl font-bold transition-all transform
              bg-white border-4 shadow-md
              ${status === 'correct' && letter.id === target.id ? 'border-green-500 bg-green-50 text-green-600 scale-110' : ''}
              ${status === 'incorrect' ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 border-slate-200 text-slate-700'}
            `}
            style={{ color: (status !== 'correct' || letter.id !== target.id) ? letter.color : undefined }}
          >
            {letter.symbol}
          </button>
        ))}
      </div>

      <audio ref={audioRef} className="hidden" />
    </div>
  )
}
