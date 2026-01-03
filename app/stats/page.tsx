'use client'

import { useStore } from '@/store/useStore'
import { ArrowLeft, Activity, Trophy, Clock, Brain, Calculator } from 'lucide-react'
import Link from 'next/link'
import { useState, useMemo } from 'react'

export default function StatsPage() {
    const { stats } = useStore()
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc') // asc = worst accuracy first

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
        // Simple mock of days if empty, otherwise use actual
        const today = new Date()
        const days = []
        const maxMins = 1 // avoid div by zero
        let calculatedMax = 0

        for(let i=6; i>=0; i--) {
            const d = new Date(today)
            d.setDate(d.getDate() - i)
            const str = d.toISOString().split('T')[0]
            const entry = stats.usage.find(u => u.date === str)
            const minutes = entry ? Math.round(entry.watchTimeSeconds / 60) : 0
            if (minutes > calculatedMax) calculatedMax = minutes
            days.push({ 
                date: d.toLocaleDateString('en-US', { weekday: 'short' }), 
                minutes 
            })
        }
        return { days, max: Math.max(maxMins, calculatedMax) }
    }, [stats.usage])

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

                {/* Usage Chart */}
                <section className="bg-slate-800 p-8 rounded-2xl border border-slate-700">
                    <h2 className="text-xl font-bold mb-6">Weekly Activity</h2>
                    <div className="flex items-end justify-between h-48 gap-4">
                        {usageData.days.map((day, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                <div className="w-full bg-slate-700/50 rounded-lg relative flex-1 overflow-hidden">
                                     <div 
                                        className="absolute bottom-0 w-full bg-blue-500 hover:bg-blue-400 transition-all rounded-t-lg"
                                        style={{ height: `${(day.minutes / usageData.max) * 100}%` }}
                                     >
                                         <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 px-2 py-1 rounded text-xs whitespace-nowrap border border-slate-700">
                                             {day.minutes} mins
                                         </div>
                                     </div>
                                </div>
                                <span className="text-xs text-slate-500 font-medium">{day.date}</span>
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
                            <div key={item.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col items-center">
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
                            </div>
                        ))}
                        {phoneticsData.length === 0 && (
                            <div className="col-span-full text-center py-12 text-slate-500">
                                No phonetics data collected yet.
                            </div>
                        )}
                    </div>
                </section>

            </div>
        </div>
    )
}
