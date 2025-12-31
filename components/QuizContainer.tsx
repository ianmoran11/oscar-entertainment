'use client'

import { useStore } from '@/store/useStore'
import { PhoneticsQuiz } from './quizzes/PhoneticsQuiz'
import { MathQuiz } from './quizzes/MathQuiz'
import { useEffect, useState } from 'react'
import { Lock } from 'lucide-react'

export function QuizContainer() {
  const { 
    isInterrupted, 
    setInterrupted, 
    enabledQuizTypes, 
    mathDifficulty,
    requiredCorrectAnswers,
    incorrectDelaySeconds
  } = useStore()

  const [activeQuiz, setActiveQuiz] = useState<'phonetics' | 'math' | null>(null)

  // Select random quiz when interrupted
  useEffect(() => {
    if (isInterrupted && enabledQuizTypes.length > 0) {
      const type = enabledQuizTypes[Math.floor(Math.random() * enabledQuizTypes.length)]
      setActiveQuiz(type)
    } else if (!isInterrupted) {
      setActiveQuiz(null)
    }
  }, [isInterrupted, enabledQuizTypes])

  const onComplete = () => {
    setInterrupted(false)
  }

  if (!isInterrupted) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="absolute top-4 right-4 group">
          <button className="p-2 opacity-20 hover:opacity-100 transition-opacity text-white" 
            onDoubleClick={() => setInterrupted(false)} // Parental bypass
          >
             <Lock className="w-6 h-6" />
          </button>
      </div>

      {activeQuiz === 'phonetics' && (
        <PhoneticsQuiz 
          onComplete={onComplete} 
          requiredCorrect={requiredCorrectAnswers}
          incorrectDelay={incorrectDelaySeconds}
        />
      )}
      
      {activeQuiz === 'math' && (
        <MathQuiz 
          difficulty={mathDifficulty} 
          onComplete={onComplete} 
          requiredCorrect={requiredCorrectAnswers}
          incorrectDelay={incorrectDelaySeconds}
        />
      )}
      
      {!activeQuiz && (
        <div className="text-white">Loading Quiz...</div>
      )}
    </div>
  )
}
