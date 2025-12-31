/**
 * Letter data for the learning app
 * Based on Australian English phonemes from Macquarie University
 * Letters are organized by difficulty
 */

export const letters = [
  // Easy consonants - clear, distinct sounds
  { id: 'p', symbol: 'P', soundFile: '/sounds/phonemes/p.wav', difficulty: 'easy', category: 'consonant', color: '#E74C3C' },
  { id: 'b', symbol: 'B', soundFile: '/sounds/phonemes/b.wav', difficulty: 'easy', category: 'consonant', color: '#3498DB' },
  { id: 't', symbol: 'T', soundFile: '/sounds/phonemes/t.wav', difficulty: 'easy', category: 'consonant', color: '#2ECC71' },
  { id: 'd', symbol: 'D', soundFile: '/sounds/phonemes/d.wav', difficulty: 'easy', category: 'consonant', color: '#F39C12' },
  { id: 'm', symbol: 'M', soundFile: '/sounds/phonemes/m.wav', difficulty: 'easy', category: 'consonant', color: '#9B59B6' },
  { id: 'n', symbol: 'N', soundFile: '/sounds/phonemes/n.wav', difficulty: 'easy', category: 'consonant', color: '#1ABC9C' },
  { id: 's', symbol: 'S', soundFile: '/sounds/phonemes/s.wav', difficulty: 'easy', category: 'consonant', color: '#E67E22' },
  { id: 'f', symbol: 'F', soundFile: '/sounds/phonemes/f.wav', difficulty: 'easy', category: 'consonant', color: '#34495E' },
  
  // Easy vowels
  { id: 'a', symbol: 'A', soundFile: '/sounds/phonemes/a.wav', difficulty: 'easy', category: 'vowel', color: '#E74C3C' },
  { id: 'e', symbol: 'E', soundFile: '/sounds/phonemes/e.wav', difficulty: 'easy', category: 'vowel', color: '#3498DB' },
  { id: 'i', symbol: 'I', soundFile: '/sounds/phonemes/i.wav', difficulty: 'easy', category: 'vowel', color: '#2ECC71' },
  { id: 'o', symbol: 'O', soundFile: '/sounds/phonemes/o.wav', difficulty: 'easy', category: 'vowel', color: '#F39C12' },
  
  // Medium difficulty
  { id: 'k', symbol: 'K', soundFile: '/sounds/phonemes/c.wav', difficulty: 'medium', category: 'consonant', color: '#16A085' },
  { id: 'g', symbol: 'G', soundFile: '/sounds/phonemes/g.wav', difficulty: 'medium', category: 'consonant', color: '#8E44AD' },
  { id: 'l', symbol: 'L', soundFile: '/sounds/phonemes/l.wav', difficulty: 'medium', category: 'consonant', color: '#2C3E50' },
  { id: 'r', symbol: 'R', soundFile: '/sounds/phonemes/r.wav', difficulty: 'medium', category: 'consonant', color: '#D35400' },
  { id: 'w', symbol: 'W', soundFile: '/sounds/phonemes/w.wav', difficulty: 'medium', category: 'consonant', color: '#C0392B' },
  { id: 'h', symbol: 'H', soundFile: '/sounds/phonemes/h.wav', difficulty: 'medium', category: 'consonant', color: '#27AE60' },
  { id: 'v', symbol: 'V', soundFile: '/sounds/phonemes/v.wav', difficulty: 'medium', category: 'consonant', color: '#2980B9' },
  { id: 'z', symbol: 'Z', soundFile: '/sounds/phonemes/z.wav', difficulty: 'medium', category: 'consonant', color: '#8E44AD' },
  { id: 'u', symbol: 'U', soundFile: '/sounds/phonemes/u.wav', difficulty: 'medium', category: 'vowel', color: '#9B59B6' },
  
  // Advanced
  { id: 'j', symbol: 'J', soundFile: '/sounds/phonemes/j.wav', difficulty: 'hard', category: 'consonant', color: '#16A085' },
  { id: 'y', symbol: 'Y', soundFile: '/sounds/phonemes/y.wav', difficulty: 'hard', category: 'consonant', color: '#F1C40F' },
]

/**
 * Get all letters organized by difficulty
 */
export function getAllLetters() {
  return letters
}

/**
 * Get letters grouped by difficulty for display
 */
export function getLettersByDifficultyGroup() {
  return {
    easy: letters.filter(l => l.difficulty === 'easy'),
    medium: letters.filter(l => l.difficulty === 'medium'),
    hard: letters.filter(l => l.difficulty === 'hard'),
  }
}

/**
 * Get a random letter from available letters
 */
export function getRandomLetter(availableLetters) {
  return availableLetters[Math.floor(Math.random() * availableLetters.length)]
}

/**
 * Get random letters for choices (including the target)
 */
export function getLetterChoices(targetLetter, numChoices, availableLetters) {
  const choices = [targetLetter]
  const otherLetters = availableLetters.filter(l => l.id !== targetLetter.id)
  
  // Randomly select other letters
  while (choices.length < numChoices && otherLetters.length > 0) {
    const randomIndex = Math.floor(Math.random() * otherLetters.length)
    choices.push(otherLetters[randomIndex])
    otherLetters.splice(randomIndex, 1)
  }
  
  // Shuffle the choices
  return choices.sort(() => Math.random() - 0.5)
}
