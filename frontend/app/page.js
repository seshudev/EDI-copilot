'use client'

import { useEffect, useState } from 'react'

const API = 'http://127.0.0.1:8000'

export default function Home() {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [demoMode, setDemoMode] = useState(true)
  const [samples, setSamples] = useState([])

  useEffect(() => {
    fetch(`${API}/`)
      .then((r) => r.json())
      .then((d) => setDemoMode(d.demo_mode ?? true))
      .catch(() => {})

    fetch(`${API}/samples`)
      .then((r) => r.json())
      .then((d) => setSamples(d.questions || []))
      .catch(() => {})
  }, [])

  async function askAI(text) {
    const q = (text ?? question).trim()
    if (!q) return

    setQuestion('')
    setMessages((prev) => [...prev, { role: 'user', content: q }])
    setLoading(true)

    try {
      const response = await fetch(
        `${API}/ask?question=${encodeURIComponent(q)}`,
        { method: 'POST' }
      )
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.detail || 'Request failed')
      }
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer,
          mode: data.mode,
        },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            err.message ||
            'Could not reach the API. Start the backend: cd backend && .venv\\Scripts\\uvicorn main:app --reload',
          mode: 'error',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto p-6 md:p-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Healthcare EDI Copilot
          </h1>
          <p className="text-slate-600 mt-2">
            Ask about 837 claims, 999 acknowledgments, 277CA status, 834
            enrollment, and HIPAA.
          </p>
          {demoMode && (
            <span className="inline-block mt-3 text-sm bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
              Demo mode — answers from sample EDI knowledge (no API key needed)
            </span>
          )}
        </header>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm min-h-[320px] flex flex-col">
          <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[480px]">
            {messages.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-12">
                Try a sample question below or type your own.
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : msg.mode === 'error'
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {msg.content}
                  {msg.mode === 'demo' && msg.role === 'assistant' && (
                    <p className="text-xs text-slate-500 mt-2">via sample data</p>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-500">
                  Thinking…
                </div>
              </div>
            )}
          </div>

          {samples.length > 0 && (
            <div className="px-4 pb-2 border-t border-slate-100 pt-3">
              <p className="text-xs font-medium text-slate-500 mb-2">
                Sample questions
              </p>
              <div className="flex flex-wrap gap-2">
                {samples.slice(0, 4).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    disabled={loading}
                    onClick={() => askAI(s.question)}
                    className="text-left text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg transition disabled:opacity-50"
                  >
                    {s.question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form
            className="p-4 border-t border-slate-200 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              askAI()
            }}
          >
            <input
              className="flex-1 border border-slate-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ask an EDI question…"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-medium px-5 py-3 rounded-lg text-sm"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
