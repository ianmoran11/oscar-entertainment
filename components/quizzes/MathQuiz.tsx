'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import confetti from 'canvas-confetti'
import { Volume2, Star } from 'lucide-react'

interface MathQuizProps {
  difficulty: 1 | 2 | 3
  onComplete: () => void
  requiredCorrect: number
  incorrectDelay: number
}

type Question = {
  text: string
  audioText: string
  answer: number
  choices: number[]
}

export function MathQuiz({ difficulty, onComplete, requiredCorrect, incorrectDelay }: MathQuizProps) {
  const [question, setQuestion] = useState<Question | null>(null)
  const [status, setStatus] = useState<'thinking' | 'correct' | 'incorrect'>('thinking')
  const [score, setScore] = useState(0)
  
  const generateChoices = useCallback((target: number, min: number, max: number): number[] => {
    const choices = new Set<number>([target])
    while (choices.size < 3) {
      const r = Math.floor(Math.random() * (max - min + 1)) + min
      choices.add(r)
    }
    return Array.from(choices).sort(() => Math.random() - 0.5)
  }, [])

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      window.speechSynthesis.cancel() // Cancel previous
      window.speechSynthesis.speak(utterance)
    }
  }

  const generateQuestion = useCallback(() => {
    let q: Question;

    if (difficulty === 1) {
      // Number Recognition
      const target = Math.floor(Math.random() * 10)
      const choices = generateChoices(target, 0, 9)
      q = {
        text: `Find the number ${target}`,
        audioText: `Find the number ${target}`,
        answer: target,
        choices
      }
    } else if (difficulty === 2) {
      // Addition
      const a = Math.floor(Math.random() * 5) + 1
      const b = Math.floor(Math.random() * 5) + 1
      const sum = a + b
      const choices = generateChoices(sum, 2, 10)
      q = {
        text: `${a} + ${b} = ?`,
        audioText: `What is ${a} plus ${b}?`,
        answer: sum,
        choices
      }
    } else {
      // Multiplication
      const a = Math.floor(Math.random() * 5) + 1
      const b = Math.floor(Math.random() * 5) + 1
      const product = a * b
      const choices = generateChoices(product, 1, 25)
      q = {
        text: `${a} × ${b} = ?`,
        audioText: `What is ${a} times ${b}?`,
        answer: product,
        choices
      }
    }

    setQuestion(q)
    setStatus('thinking')
    
    // Speak after delay
    setTimeout(() => speak(q.audioText), 500)
  }, [difficulty, generateChoices])

  // Initialize Question
  useEffect(() => {
    generateQuestion()
  }, [generateQuestion])

  const handleChoice = (val: number) => {
    if (status !== 'thinking' || !question) return

    if (val === question.answer) {
      setStatus('correct')
      speak("Correct!")
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
      
      const newScore = score + 1
      setScore(newScore)

      if (newScore >= requiredCorrect) {
          setTimeout(onComplete, 3000)
      } else {
          setTimeout(() => {
              generateQuestion()
          }, 2000)
      }
    } else {
      setStatus('incorrect')
      speak("Try again")
      setTimeout(() => setStatus('thinking'), incorrectDelay * 1000)
    }
  }

  if (!question) return <div>Loading...</div>

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white/90 rounded-2xl shadow-2xl max-w-2xl w-full mx-4">
      {/* Header with Progress */}
      <div className="w-full flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Math Challenge</h2>
          <div className="flex gap-1">
              {Array.from({ length: requiredCorrect }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-6 h-6 transition-all ${i < score ? 'fill-yellow-400 text-yellow-400 scale-110' : 'text-slate-300'}`} 
                  />
              ))}
          </div>
      </div>

      <h2 className="text-4xl font-bold mb-8 text-slate-800 text-center">{question.text}</h2>
      
      <button 
        onClick={() => speak(question.audioText)}
        className="mb-8 p-6 bg-purple-500 rounded-full hover:bg-purple-600 transition-transform active:scale-95 shadow-lg animate-pulse"
      >
        <Volume2 className="w-12 h-12 text-white" />
      </button>

      <div className="grid grid-cols-3 gap-6 w-full">
        {question.choices.map((val) => (
          <button
            key={val}
            onClick={() => handleChoice(val)}
            disabled={status !== 'thinking'}
            className={`
              aspect-square rounded-2xl text-6xl font-bold transition-all transform
              bg-white border-4 shadow-md
              ${status === 'correct' && val === question.answer ? 'border-green-500 bg-green-50 text-green-600 scale-110' : ''}
              ${status === 'incorrect' ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 border-slate-200 text-slate-700'}
            `}
          >
            {val}
          </button>
        ))}
      </div>
    </div>
  )
}
