import React, { useEffect, useRef, useState } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import {
  VscClearAll,
  VscClose,
  VscChevronUp,
  VscChevronDown,
  VscTerminal,
  VscSplitHorizontal
} from 'react-icons/vsc'

const TerminalPanel = ({ isOpen, onClose, isMaximized, onToggleMaximize }) => {
  const terminalRef = useRef(null)
  const xtermInstance = useRef(null)
  const fitAddonRef = useRef(null)
  const [activeTab, setActiveTab] = useState('TERMINAL')

  useEffect(() => {
    if (!isOpen || !terminalRef.current) return

    // Prevent duplicate initialization
    if (!xtermInstance.current) {
      const term = new Terminal({
        cursorBlink: true,
        fontSize: 12,
        fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace",
        lineHeight: 1.3,
        theme: {
          background: '#07090e',
          foreground: '#cbd5e1',
          cursor: '#f8fafc',
          selectionBackground: '#ffffff20',
          black: '#07090e',
          red: '#f87171',
          green: '#4ade80',
          yellow: '#facc15',
          blue: '#94a3b8',
          magenta: '#c084fc',
          cyan: '#e2e8f0',
          white: '#f8fafc',
          brightBlack: '#64748b',
          brightRed: '#ef4444',
          brightGreen: '#22c55e',
          brightYellow: '#eab308',
          brightBlue: '#cbd5e1',
          brightMagenta: '#a855f7',
          brightCyan: '#ffffff',
          brightWhite: '#ffffff'
        }
      })

      const fitAddon = new FitAddon()
      term.loadAddon(fitAddon)
      term.open(terminalRef.current)
      fitAddon.fit()

      xtermInstance.current = term
      fitAddonRef.current = fitAddon

      // Initial interactive greeting
      term.writeln('\x1b[1;37m┌────────────────────────────────────────────────────────┐\x1b[0m')
      term.writeln('\x1b[1;37m│\x1b[0m  \x1b[1;32m● AI-IDE Integrated Virtual Terminal\x1b[0m                 \x1b[1;37m│\x1b[0m')
      term.writeln('\x1b[1;37m│\x1b[0m  Type commands like \x1b[1;33mnpm run dev\x1b[0m, \x1b[1;33mls\x1b[0m, or \x1b[1;33mhelp\x1b[0m.         \x1b[1;37m│\x1b[0m')
      term.writeln('\x1b[1;37m└────────────────────────────────────────────────────────┘\x1b[0m')
      term.write('\r\n\x1b[1;32mdev@ai-ide\x1b[0m:\x1b[1;37m~/workspace\x1b[0m$ ')

      let currentLine = ''

      term.onKey(({ key, domEvent }) => {
        const ev = domEvent
        if (ev.keyCode === 13) {
          // Enter key
          term.write('\r\n')
          const cmd = currentLine.trim()
          if (cmd === 'clear') {
            term.clear()
          } else if (cmd === 'help') {
            term.writeln('Available UI commands: ls, clear, npm run dev, git status, help')
          } else if (cmd === 'ls') {
            term.writeln('\x1b[1;34msrc/\x1b[0m  \x1b[1;34mpublic/\x1b[0m  package.json  README.md  vite.config.js')
          } else if (cmd === 'npm run dev' || cmd === 'npm start') {
            term.writeln('\x1b[1;32m> vite dev server running at:\x1b[0m')
            term.writeln('  \x1b[1;36m➜\x1b[0m  Local:   \x1b[4;36mhttp://localhost:5173/\x1b[0m')
          } else if (cmd === 'git status') {
            term.writeln('On branch main')
            term.writeln('Your branch is up to date with origin/main.')
          } else if (cmd.length > 0) {
            term.writeln(`bash: ${cmd}: command not found`)
          }
          currentLine = ''
          term.write('\x1b[1;32mdev@ai-ide\x1b[0m:\x1b[1;34m~/workspace\x1b[0m$ ')
        } else if (ev.keyCode === 8) {
          // Backspace
          if (currentLine.length > 0) {
            currentLine = currentLine.slice(0, -1)
            term.write('\b \b')
          }
        } else if (!ev.altKey && !ev.ctrlKey && !ev.metaKey) {
          currentLine += key
          term.write(key)
        }
      })
    }

    const handleResize = () => {
      try {
        fitAddonRef.current?.fit()
      } catch (err) {
        // ignore layout resize error
      }
    }

    window.addEventListener('resize', handleResize)
    const timeout = setTimeout(handleResize, 100)

    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timeout)
    }
  }, [isOpen])

  const handleClear = () => {
    if (xtermInstance.current) {
      xtermInstance.current.clear()
      xtermInstance.current.write('\x1b[1;32mdev@ai-ide\x1b[0m:\x1b[1;34m~/workspace\x1b[0m$ ')
    }
  }

  if (!isOpen) return null

  return (
    <div
      className={`w-full bg-[#07090e] border-t border-white/[0.08] flex flex-col transition-all duration-200 z-10 font-sans ${
        isMaximized ? 'h-[75vh]' : 'h-60'
      }`}
    >
      {/* Terminal Top Bar */}
      <div className="h-8 bg-[#090c13] border-b border-white/[0.06] flex items-center justify-between px-3 text-xs select-none">
        {/* Left Tabs */}
        <div className="flex items-center gap-1 font-mono text-[11px]">
          {['TERMINAL', 'OUTPUT', 'PROBLEMS (0)', 'DEBUG CONSOLE'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                activeTab === tab
                  ? 'text-white font-semibold bg-white/[0.08]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 text-slate-400">
          <button
            onClick={handleClear}
            title="Clear Terminal"
            className="p-1 hover:text-slate-100 hover:bg-white/[0.06] rounded transition-colors cursor-pointer"
          >
            <VscClearAll className="text-xs" />
          </button>
          <button
            title="Split Terminal"
            className="p-1 hover:text-slate-100 hover:bg-white/[0.06] rounded transition-colors cursor-pointer"
          >
            <VscSplitHorizontal className="text-xs" />
          </button>
          <button
            onClick={onToggleMaximize}
            title={isMaximized ? 'Restore Terminal' : 'Maximize Terminal'}
            className="p-1 hover:text-slate-100 hover:bg-white/[0.06] rounded transition-colors cursor-pointer"
          >
            {isMaximized ? (
              <VscChevronDown className="text-xs" />
            ) : (
              <VscChevronUp className="text-xs" />
            )}
          </button>
          <button
            onClick={onClose}
            title="Close Panel"
            className="p-1 hover:text-slate-100 hover:bg-white/[0.06] rounded transition-colors cursor-pointer"
          >
            <VscClose className="text-xs" />
          </button>
        </div>
      </div>

      {/* Terminal Content Canvas */}
      <div className="flex-1 w-full p-2 overflow-hidden bg-[#07090e]">
        {activeTab === 'TERMINAL' ? (
          <div ref={terminalRef} className="h-full w-full" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-slate-500 font-mono text-xs">
            No active output for {activeTab}.
          </div>
        )}
      </div>
    </div>
  )
}

export default TerminalPanel

