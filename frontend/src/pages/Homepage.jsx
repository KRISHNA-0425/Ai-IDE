import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { clearUserData } from '../redux/userSlice.js'
import { logoutUser } from '../features/login.js'

const Homepage = () => {
    const { userData } = useSelector((state) => state.user)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const handleLogout = async () => {
        setIsLoggingOut(true)
        try {
            await logoutUser()
        } catch (error) {
            console.error("Logout request failed:", error)
        } finally {
            dispatch(clearUserData())
            setIsLoggingOut(false)
            navigate('/login')
        }
    }

    const userName = userData?.name || 'Explorer'
    const userEmail = userData?.email || 'Authenticated User'
    const userAvatar = userData?.avatar || ''

    return (
        <div className="relative min-h-screen w-full bg-[#07090e] text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200">
            {/* Ambient Lighting */}
            <div 
                className="pointer-events-none fixed inset-0 z-0"
                style={{
                    background: 'radial-gradient(ellipse 65% 55% at 50% 30%, rgba(22, 40, 72, 0.4) 0%, rgba(12, 18, 30, 0.25) 45%, rgba(7, 9, 14, 0.98) 75%)'
                }}
            />

            {/* Subtle tech grid */}
            <div 
                className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
                style={{
                    backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
                    backgroundSize: '48px 48px'
                }}
            />

            {/* Top Navigation Bar */}
            <header className="relative z-10 w-full border-b border-white/[0.06] bg-[#0c0f17]/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img 
                        src="/bhasha-logo-white.png" 
                        alt="BHASHA" 
                        className="h-5 object-contain" 
                    />
                    <div className="h-3 w-px bg-slate-800"></div>
                    <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                        AI—WORKSPACE
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-[#131722] border border-white/[0.08] rounded-full px-3 py-1.5">
                        {userAvatar ? (
                            <img src={userAvatar} alt={userName} className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs flex items-center justify-center font-semibold">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <span className="text-xs font-medium text-slate-200">{userName}</span>
                    </div>

                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="bg-red-950/30 hover:bg-red-950/60 active:bg-red-950/80 text-red-300 border border-red-500/30 hover:border-red-500/50 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer disabled:opacity-50"
                    >
                        {isLoggingOut ? 'Logging out...' : 'Sign Out'}
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
                <div className="w-full max-w-xl bg-[#10131b]/95 border border-white/[0.08] rounded-2xl p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] backdrop-blur-2xl text-center">
                    
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-mono mb-6">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        SESSION ACTIVE & STORED
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                        Welcome back, <span className="text-cyan-400">{userName}</span>
                    </h1>
                    <p className="text-sm text-slate-400 mb-8 font-mono">
                        {userEmail}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                        <div className="bg-[#0c0f17] border border-white/[0.06] rounded-xl p-4">
                            <span className="text-[11px] font-mono uppercase text-slate-500 block mb-1">User Identifier</span>
                            <span className="text-xs font-mono text-slate-300 break-all">{userData?._id || userData?.userId || 'N/A'}</span>
                        </div>
                        <div className="bg-[#0c0f17] border border-white/[0.06] rounded-xl p-4">
                            <span className="text-[11px] font-mono uppercase text-slate-500 block mb-1">Session Source</span>
                            <span className="text-xs font-mono text-cyan-300">Redis Secure Cookie</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Footer */}
            <footer className="relative z-10 w-full py-4 text-center text-xs text-slate-600 font-mono">
                BHASHA AI STUDIO • ALL SYSTEMS OPERATIONAL
            </footer>
        </div>
    )
}

export default Homepage