'use client'

import { useStore } from '@/store/useStore'
import { ArrowLeft, Activity, Trophy, Clock, Brain, Calculator, X } from 'lucide-react'
import Link from 'next/link'
import { useState, useMemo } from 'react'

export default function StatsPage() {
    const { stats } = useStore()
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc') // asc = worst accuracy first
    const [selectedLetter, setSelectedLetter] = useState<string | null>(null)

    // Compute Phonetics
    const phoneticsData = useMemo(() => {
        return Object.entries(stats.phonetics.items).map(([id, s]) => ({
            id,
            attempts: s.attempts,
            correct: s.correct,
            accuracy: s.attempts > 0 ? (s.correct / s.attempts) * 100 : 0
        })).sort((a, b) => {
            if (sortOrder === 'asc') return a.accuracy - b.accuracy
            return b.accuracy - a.accuracy
        })
    }, [stats.phonetics.items, sortOrder])

    // Compute Usage (Last 7 Days)
    const usageData = useMemo(() => {
        const today = new Date()
        const days = []
        let maxMins = 1 
        let maxAccuracy = 100

        for(let i=13; i>=0; i--) { // Last 14 days
            const d = new Date(today)
            d.setDate(d.getDate() - i)
            const str = d.toISOString().split('T')[0]
            const entry = stats.usage.find(u => u.date === str)
            const minutes = entry ? Math.round(entry.watchTimeSeconds / 60) : 0
            const accuracy = entry && entry.quizAttempts > 0 
                ? Math.round((entry.quizCorrect / entry.quizAttempts) * 100) 
                : 0
            
            if (minutes > maxMins) maxMins = minutes
            
            days.push({ 
                date: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }), 
                fullDate: str,
                minutes,
                accuracy,
                hasQuiz: entry && entry.quizAttempts > 0
            })
        }
        return { days, maxMins }
    }, [stats.usage])

    const selectedLetterData = useMemo(() => {
        if (!selectedLetter) return null
        const s = stats.phonetics.items[selectedLetter]
        if (!s) return null
        return {
            id: selectedLetter,
            ...s,
            accuracy: s.attempts > 0 ? Math.round((s.correct / s.attempts) * 100) : 0
        }
    }, [selectedLetter, stats.phonetics.items])

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
            <div className="max-w-5xl mx-auto space-y-12">
                
                <header className="flex items-center gap-4">
                  <Link href="/settings" className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                    <ArrowLeft />
                  </Link>
                  <h1 className="text-3xl font-bold flex items-center gap-3">
                      <Activity className="text-blue-500 w-8 h-8" /> Statistics Dashboard
                  </h1>
                </header>

                {/* Top Level Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Clock size={100} />
                        </div>
                        <h3 className="text-slate-400 font-medium mb-2">Total Watch Time</h3>
                        <div className="text-4xl font-bold">
                            {Math.round(stats.usage.reduce((acc, curr) => acc + curr.watchTimeSeconds, 0) / 60)} <span className="text-lg font-normal text-slate-500">mins</span>
                        </div>
                    </div>

                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Brain size={100} />
                        </div>
                        <h3 className="text-slate-400 font-medium mb-2">Phonetics Attempts</h3>
                        <div className="text-4xl font-bold">
                            {stats.phonetics.totalAttempts}
                        </div>
                        <div className="text-sm text-green-400 mt-1">
                            {stats.phonetics.totalAttempts > 0 
                                ? Math.round((stats.phonetics.totalCorrect / stats.phonetics.totalAttempts) * 100) 
                                : 0}% Accuracy
                        </div>
                    </div>

                     <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Calculator size={100} />
                        </div>
                        <h3 className="text-slate-400 font-medium mb-2">Math Attempts</h3>
                        <div className="text-4xl font-bold">
                            {stats.math.totalAttempts}
                        </div>
                         <div className="text-sm text-green-400 mt-1">
                            {stats.math.totalAttempts > 0 
                                ? Math.round((stats.math.totalCorrect / stats.math.totalAttempts) * 100) 
                                : 0}% Accuracy
                        </div>
                    </div>
                </div>

                {/* Trends Chart */}
                <section className="bg-slate-800 p-8 rounded-2xl border border-slate-700">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Activity & Accuracy Trend (14 Days)</h2>
                        <div className="flex gap-4 text-xs font-medium">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-sm"></div> Watch Time
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-400 rounded-full"></div> Quiz Accuracy
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-end justify-between h-64 gap-2 sm:gap-4 relative">
                        {/* Y-Axis Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                            <div className="w-full h-px bg-white"></div>
                            <div className="w-full h-px bg-white"></div>
                            <div className="w-full h-px bg-white"></div>
                            <div className="w-full h-px bg-white"></div>
                            <div className="w-full h-px bg-white"></div>
                        </div>

                        {usageData.days.map((day, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative z-10 h-full justify-end">
                                {/* Accuracy Dot/Line container */}
                                {day.hasQuiz && (
                                    <div 
                                        className="absolute w-full flex justify-center transition-all duration-500"
                                        style={{ bottom: `${day.accuracy}%`, marginBottom: '24px' }} // offset for date label
                                    >
                                        <div className="w-3 h-3 bg-green-400 rounded-full border-2 border-slate-800 shadow-sm relative group-hover:scale-150 transition-transform">
                                            <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 px-2 py-1 rounded text-xs whitespace-nowrap border border-slate-700 z-20">
                                                {day.accuracy}% Correct
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="w-full bg-slate-700/30 rounded-t-lg relative flex-1 flex flex-col justify-end overflow-hidden">
                                     <div 
                                        className="w-full bg-blue-500/80 hover:bg-blue-400/90 transition-all rounded-t-sm"
                                        style={{ height: `${Math.max(5, (day.minutes / usageData.maxMins) * 100)}%` }} // min height for visibility
                                     >
                                         <div className="opacity-0 group-hover:opacity-100 absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900 px-2 py-1 rounded text-xs whitespace-nowrap border border-slate-700 z-20 text-white">
                                             {day.minutes}m
                                         </div>
                                     </div>
                                </div>
                                <span className="text-[10px] sm:text-xs text-slate-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">{day.date}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Phonetics Breakdown */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Phonetics Breakdown</h2>
                        <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
                            <button 
                                onClick={() => setSortOrder('asc')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${sortOrder === 'asc' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                Needs Practice
                            </button>
                            <button 
                                onClick={() => setSortOrder('desc')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${sortOrder === 'desc' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                Mastered
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {phoneticsData.map((item) => (
                            <button 
                                key={item.id}
                                onClick={() => setSelectedLetter(item.id)}
                                className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col items-center hover:bg-slate-750 hover:border-slate-500 transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer text-left"
                            >
                                <div className="text-3xl font-bold mb-2 text-white">{item.id}</div>
                                
                                <div className="w-full space-y-2">
                                    <div className="flex justify-between text-xs text-slate-400">
                                        <span>{Math.round(item.accuracy)}%</span>
                                        <span>{item.correct}/{item.attempts}</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full ${
                                                item.accuracy >= 80 ? 'bg-green-500' :
                                                item.accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                            style={{ width: `${item.accuracy}%` }}
                                        />
                                    </div>
                                </div>
                            </button>
                        ))}
                        {phoneticsData.length === 0 && (
                            <div className="col-span-full text-center py-12 text-slate-500">
                                No phonetics data collected yet.
                            </div>
                        )}
                    </div>
                </section>

            </div>

            {/* Letter Detail Modal */}
            {selectedLetterData && (
                <div 
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedLetter(null)}
                >
                    <div 
                        className="bg-slate-900 border border-slate-700 p-8 rounded-2xl w-full max-w-md space-y-6 shadow-2xl relative animate-in zoom-in-95 duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <button 
                            onClick={() => setSelectedLetter(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white p-2"
                        >
                            <X size={24} />
                        </button>

                        <div className="text-center space-y-2">
                            <h2 className="text-6xl font-bold text-white mb-2">{selectedLetterData.id}</h2>
                            <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                                selectedLetterData.accuracy >= 80 ? 'bg-green-500/20 text-green-400' :
                                selectedLetterData.accuracy >= 50 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                                {selectedLetterData.accuracy}% Accuracy
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center">
                                <div className="text-sm text-slate-400">Attempts</div>
                                <div className="text-2xl font-bold">{selectedLetterData.attempts}</div>
                            </div>
                            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center">
                                <div className="text-sm text-slate-400">Correct</div>
                                <div className="text-2xl font-bold text-green-400">{selectedLetterData.correct}</div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-slate-400 mb-3">Recent History (Last 10)</h3>
                            <div className="flex justify-between gap-1">
                                {selectedLetterData.history?.map((result, i) => (
                                    <div 
                                        key={i}
                                        className={`h-8 flex-1 rounded-md transition-all ${
                                            result 
                                            ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' 
                                            : 'bg-red-500/50'
                                        }`}
                                        title={result ? 'Correct' : 'Incorrect'}
                                    />
                                ))}
                                {(!selectedLetterData.history || selectedLetterData.history.length === 0) && (
                                    <div className="text-center w-full text-slate-600 text-sm italic">No attempts yet</div>
                                )}
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-500 mt-1 px-1">
                                <span>Oldest</span>
                                <span>Newest</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
