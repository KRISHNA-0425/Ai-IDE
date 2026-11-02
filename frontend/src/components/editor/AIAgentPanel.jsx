import React, { useState } from 'react'
import {
  VscSparkle,
  VscClose,
  VscSend,
  VscCopy,
  VscCheck,
  VscFlame,
  VscBracketDot,
  VscSymbolVariable
} from 'react-icons/vsc'
import { FiCpu } from 'react-icons/fi'

const AIAgentPanel = ({ isOpen, onClose, activeFile }) => {
  const [messages, setMessages] = useState([
    {
      id: 'm-1',
      sender: 'assistant',
      text: "Hello! I'm your AI pair programmer. I'm connected to your workspace and ready to help you write code, debug issues, or optimize architecture.",
      codeSnippet: `// Example: Fast debounce utility\nexport function debounce(fn, delay = 300) {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n}`,
      time: 'Just now'
    }
  ])
  const [inputText, setInputText] = useState('')
  const [selectedModel, setSelectedModel] = useState('Claude 3.5 Sonnet')
  const [copiedId, setCopiedId] = useState(null)
  const [agentMode, setAgentMode] = useState('Chat') // 'Chat' | 'Edit' | 'Review'

  const handleSend = (e) => {
    e?.preventDefault()
    if (!inputText.trim()) return

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: inputText,
      time: 'Just now'
    }

    setMessages((prev) => [...prev, userMsg])
    const promptText = inputText
    setInputText('')

    // Simulated instant assistant response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: `I reviewed your prompt regarding "${promptText.slice(0, 30)}...". Currently operating in UI mode. We will wire full real-time agent execution in the next step!`,
          time: 'Just now'
        }
      ])
    }, 600)
  }

  const handleCopyCode = (snippet, id) => {
    navigator.clipboard?.writeText(snippet)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const quickPrompts = [
    'Explain active file',
    'Add TypeScript types',
    'Generate unit tests',
    'Refactor for performance'
  ]

  if (!isOpen) return null

  return (
    <div className="h-full w-80 sm:w-96 bg-[#0b0e14] border-l border-white/[0.08] flex flex-col font-sans select-none shrink-0 z-10">
      {/* Agent Top Header */}
      <div className="px-3.5 py-3 border-b border-white/[0.06] flex items-center justify-between bg-[#080b11]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-white/[0.1] border border-white/[0.15] flex items-center justify-center text-slate-100 shadow-xs">
            <VscSparkle className="text-xs" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-100">AI Agent</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
          </div>
        </div>

        {/* Model Selector & Close */}
        <div className="flex items-center gap-1.5">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-[#121622] border border-white/[0.08] text-[11px] text-slate-300 rounded px-2 py-0.5 outline-none font-mono cursor-pointer"
          >
            <option>Claude 3.5 Sonnet</option>
            <option>Gemini 1.5 Pro</option>
            <option>GPT-4o</option>
          </select>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] rounded transition-colors cursor-pointer"
          >
            <VscClose className="text-sm" />
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="px-3 py-1.5 bg-[#090c13] border-b border-white/[0.04] flex items-center gap-1 text-[11px] font-mono">
        {['Chat', 'Edit', 'Review'].map((mode) => (
          <button
            key={mode}
            onClick={() => setAgentMode(mode)}
            className={`px-2.5 py-0.5 rounded transition-all cursor-pointer ${
              agentMode === mode
                ? 'bg-white/[0.1] text-white border border-white/[0.15] font-medium'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
            }`}
          >
            {mode}
          </button>
        ))}
        {activeFile && (
          <div className="ml-auto text-[10px] text-slate-500 truncate max-w-[120px]">
            @{activeFile.name}
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[92%] rounded-xl px-3.5 py-2.5 text-xs font-sans leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-slate-200 text-slate-900 font-medium rounded-br-xs shadow-sm'
                  : 'bg-[#121622] text-slate-200 border border-white/[0.06] rounded-bl-xs'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>

              {msg.codeSnippet && (
                <div className="mt-2.5 rounded-lg bg-[#07090e] border border-white/[0.08] overflow-hidden">
                  <div className="px-2.5 py-1 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>javascript</span>
                    <button
                      onClick={() => handleCopyCode(msg.codeSnippet, msg.id)}
                      className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <VscCheck className="text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <VscCopy />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-2.5 text-[11px] font-mono text-slate-200 overflow-x-auto">
                    {msg.codeSnippet}
                  </pre>
                </div>
              )}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.time}</span>
          </div>
        ))}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-3 pt-2 pb-1 border-t border-white/[0.04] bg-[#080b11]">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => {
                setInputText(prompt)
              }}
              className="text-[10px] whitespace-nowrap bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 border border-white/[0.06] rounded-full px-2 py-0.5 transition-colors cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Input Box */}
      <div className="p-3 bg-[#080b11] border-t border-white/[0.06]">
        <form onSubmit={handleSend} className="relative">
          <textarea
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder={`Ask AI agent or type instructions for ${activeFile ? activeFile.name : 'workspace'}...`}
            className="w-full bg-[#121622] border border-white/[0.08] focus:border-white/40 focus:ring-1 focus:ring-white/20 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none resize-none font-sans"
          />

          <div className="flex items-center justify-between mt-1.5 px-0.5">
            <span className="text-[10px] text-slate-500 font-mono">
              ↵ Enter to send
            </span>
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-white text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm cursor-pointer"
            >
              <span>Send</span>
              <VscSend className="text-xs" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AIAgentPanel

