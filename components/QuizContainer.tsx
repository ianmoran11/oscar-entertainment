'use client'

import { useStore } from '@/store/useStore'
import { PhoneticsQuiz } from './quizzes/PhoneticsQuiz'
import { WordsQuiz } from './quizzes/WordsQuiz'
import { useEffect, useState } from 'react'
import { Lock } from 'lucide-react'

export function QuizContainer() {
  const {
    isInterrupted,
    setInterrupted,
    enabledQuizTypes,
    requiredCorrectAnswers,
    incorrectDelaySeconds,
    phoneticsOptionsCount,
    wordsOptionsCount,
    quizVolume,
    recordQuizAttempt
  } = useStore()

  const [activeQuiz, setActiveQuiz] = useState<'phonetics' | 'words' | null>(null)

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
          optionsCount={phoneticsOptionsCount}
          volume={quizVolume}
          onAnswer={(itemId, isCorrect) => recordQuizAttempt('phonetics', itemId, isCorrect)}
        />
      )}
      
      {activeQuiz === 'words' && (
        <WordsQuiz 
          onComplete={onComplete} 
          requiredCorrect={requiredCorrectAnswers}
          incorrectDelay={incorrectDelaySeconds}
          optionsCount={wordsOptionsCount}
          volume={quizVolume}
          onAnswer={(itemId, isCorrect) => recordQuizAttempt('words', itemId, isCorrect)}
        />
      )}
      
      {!activeQuiz && (
        <div className="text-white">Loading Quiz...</div>
      )}
    </div>
  )
}
