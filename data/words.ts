// Word data for the Words Quiz
// Each word has an image and audio file in public/pictures/

export type Word = {
  id: string
  word: string
  imageFile: string
  soundFile: string
}

const words: Word[] = [
  { id: 'bin', word: 'bin', imageFile: '/pictures/bin.png', soundFile: '/pictures/bin.wav' },
  { id: 'bug', word: 'bug', imageFile: '/pictures/bug.png', soundFile: '/pictures/bug.wav' },
  { id: 'car', word: 'car', imageFile: '/pictures/car.png', soundFile: '/pictures/car.wav' },
  { id: 'cat', word: 'cat', imageFile: '/pictures/cat.png', soundFile: '/pictures/cat.wav' },
  { id: 'cup', word: 'cup', imageFile: '/pictures/cup.png', soundFile: '/pictures/cup.wav' },
  { id: 'dog', word: 'dog', imageFile: '/pictures/dog.png', soundFile: '/pictures/dog.wav' },
  { id: 'fan', word: 'fan', imageFile: '/pictures/fan.png', soundFile: '/pictures/fan.wav' },
  { id: 'fox', word: 'fox', imageFile: '/pictures/fox.png', soundFile: '/pictures/fox.wav' },
  { id: 'hat', word: 'hat', imageFile: '/pictures/hat.png', soundFile: '/pictures/hat.wav' },
  { id: 'hill', word: 'hill', imageFile: '/pictures/hill.png', soundFile: '/pictures/hill.wav' },
  { id: 'jug', word: 'jug', imageFile: '/pictures/jug.png', soundFile: '/pictures/jug.wav' },
  { id: 'leg', word: 'leg', imageFile: '/pictures/leg.png', soundFile: '/pictures/leg.wav' },
  { id: 'log', word: 'log', imageFile: '/pictures/log.png', soundFile: '/pictures/log.wav' },
  { id: 'pen', word: 'pen', imageFile: '/pictures/pen.png', soundFile: '/pictures/pen.wav' },
  { id: 'pig', word: 'pig', imageFile: '/pictures/pig.png', soundFile: '/pictures/pig.wav' },
  { id: 'sun', word: 'sun', imageFile: '/pictures/sun.png', soundFile: '/pictures/sun.wav' },
]

export function getAllWords(): Word[] {
  return words
}

export function getRandomWord(wordList: Word[] = words): Word {
  return wordList[Math.floor(Math.random() * wordList.length)]
}

export function getWordChoices(target: Word, count: number, wordList: Word[] = words): Word[] {
  // Shuffle and pick `count - 1` other words, then add target and shuffle again
  const others = wordList.filter(w => w.id !== target.id)
  const shuffledOthers = others.sort(() => Math.random() - 0.5).slice(0, count - 1)
  const choices = [...shuffledOthers, target]
  return choices.sort(() => Math.random() - 0.5)
}
