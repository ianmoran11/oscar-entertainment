'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { getAllLetters, getLetterChoices, getRandomLetter } from '@/data/letters'
import confetti from 'canvas-confetti'
import { Volume2, Star } from 'lucide-react'

interface PhoneticsQuizProps {
  onComplete: () => void
  requiredCorrect: number
  incorrectDelay: number
  optionsCount: number
  volume: number
}

export function PhoneticsQuiz({ onComplete, requiredCorrect, incorrectDelay, optionsCount, volume }: PhoneticsQuizProps) {
  const [target, setTarget] = useState<any>(null)
  const [choices, setChoices] = useState<any[]>([])
  const [status, setStatus] = useState<'thinking' | 'correct' | 'incorrect'>('thinking')
  const [score, setScore] = useState(0)
  const [lockoutTimer, setLockoutTimer] = useState<number | null>(null)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup timer on unmount
  useEffect(() => {
      return () => {
          if (timerRef.current) clearInterval(timerRef.current)
      }
  }, [])

  const playSound = (path: string) => {
    if (audioRef.current) {
        audioRef.current.volume = volume
        audioRef.current.src = path
        audioRef.current.play().catch(e => console.error("Audio play failed", e))
    }
  }

  const playErrorTone = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext
        if (!AudioContext) return
        
        const ctx = new AudioContext()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        
        osc.connect(gain)
        gain.connect(ctx.destination)
        
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(150, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3)
        
        gain.gain.setValueAtTime(volume * 0.5, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
        
        osc.start()
        osc.stop(ctx.currentTime + 0.3)
    } catch (e) {
        console.error("Audio Context Error", e)
    }
  }

  const initRound = useCallback(() => {
    const all = getAllLetters()
    const t = getRandomLetter(all)
    const c = getLetterChoices(t, optionsCount, all)
    setTarget(t)
    setChoices(c)
    setStatus('thinking')
    setLockoutTimer(null)
    
    // Play sound after a short delay
    setTimeout(() => {
      // Ensure we use the latest volume
      if (audioRef.current) audioRef.current.volume = volume // It might not update in closure if not careful, but playSound handles it
      playSound(t.soundFile)
    }, 500)
  }, [optionsCount, volume]) 

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
      playErrorTone()
      
      // Replay target sound to help user
      setTimeout(() => playSound(target.soundFile), 800)

      let timeLeft = incorrectDelay
      setLockoutTimer(timeLeft)

      if (timerRef.current) clearInterval(timerRef.current)
      
      timerRef.current = setInterval(() => {
          timeLeft -= 0.1
          if (timeLeft <= 0) {
              if (timerRef.current) clearInterval(timerRef.current)
              setLockoutTimer(null)
              setStatus('thinking')
          } else {
              setLockoutTimer(Math.max(0, timeLeft))
          }
      }, 100)
    }
  }

  const replaySound = () => {
    if (target) playSound(target.soundFile)
  }

  if (!target) return <div>Loading...</div>

  // Determine grid columns based on count
  let gridClass = 'grid-cols-3'
  if (optionsCount === 2) gridClass = 'grid-cols-2'
  else if (optionsCount === 4) gridClass = 'grid-cols-2 sm:grid-cols-2' // 2x2
  else if (optionsCount > 4) gridClass = 'grid-cols-3' // fallback 3

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white/90 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 relative overflow-hidden transition-colors duration-300">
      
      {/* Lockout Overlay */}
      {status === 'incorrect' && (
          <div className="absolute inset-0 bg-slate-900/10 z-0 pointer-events-none transition-colors duration-300" />
      )}

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

      <div className={`grid ${gridClass} gap-6 w-full z-10`}>
        {choices.map((letter) => {
            const isCorrect = letter.id === target.id
            const isIncorrectSelection = status === 'incorrect'
            
            return (
              <button
                key={letter.id}
                onClick={() => handleChoice(letter)}
                disabled={status !== 'thinking'}
                className={`
                  aspect-square rounded-2xl text-6xl font-bold transition-all transform relative overflow-hidden
                  bg-white border-4 shadow-md
                  ${status === 'correct' && isCorrect ? 'border-green-500 bg-green-50 text-green-600 scale-110' : ''}
                  ${isIncorrectSelection ? 'opacity-20 grayscale scale-95 border-slate-300 cursor-not-allowed' : 'hover:scale-105 border-slate-200 text-slate-700'}
                `}
                style={{ color: (status !== 'correct' || isCorrect) ? letter.color : undefined }}
              >
                {letter.symbol}
                {/* Timer Overlay on buttons? Or better just central text */}
              </button>
            )
        })}
      </div>

      {status === 'incorrect' && lockoutTimer !== null && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className="bg-slate-800/80 text-white px-6 py-4 rounded-xl text-3xl font-bold animate-pulse backdrop-blur-sm">
                  Wait {Math.ceil(lockoutTimer)}s
              </div>
          </div>
      )}

      <audio ref={audioRef} className="hidden" />
    </div>
  )
}
