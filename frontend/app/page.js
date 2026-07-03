'use client'

import { useEffect, useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080'

export default function Home() {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [demoMode, setDemoMode] = useState(true)
  const [samples, setSamples] = useState([])
  const [apiOnline, setApiOnline] = useState(false)

  useEffect(() => {
    fetch(`${API}/`)
      .then((r) => r.json())
      .then((d) => {
        setDemoMode(d.demo_mode ?? true)
        setApiOnline(true)
      })
      .catch(() => setApiOnline(false))

    fetch(`${API}/samples`)
      .then((r) => r.json())
      .then((d) => setSamples(d.questions || []))
      .catch(() => setSamples([]))
  }, [])

  async function askAI(text) {
    const q = (text ?? question).trim()
    if (!q || loading) return

    setQuestion('')
    setMessages((prev) => [...prev, { role: 'user', content: q }])
    setLoading(true)

    try {
      const response = await fetch(`${API}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Request failed')
      }

      setApiOnline(true)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer,
          mode: data.mode,
        },
      ])
    } catch (err) {
      setApiOnline(false)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            err.message ||
            'Could not reach the API. Start the backend with: cd backend && .venv\\Scripts\\uvicorn main:app --reload',
          mode: 'error',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6 md:p-10">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                apiOnline
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {apiOnline ? 'API connected' : 'Start backend on port 8080'}
            </span>
            {demoMode && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900">
                Demo mode
              </span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-5xl">
              Healthcare EDI Copilot
            </h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              Ask questions about 837 claims, 999 acknowledgments, 277CA status,
              834 enrollment, HIPAA transactions, and common EDI rejection causes.
            </p>
          </div>
        </header>

        <section className="flex min-h-[520px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-5">
            {messages.length === 0 && (
              <div className="mx-auto max-w-xl py-14 text-center">
                <p className="text-sm font-medium text-slate-700">
                  Try a sample question below or type your own.
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Demo mode works without an OpenAI key by matching your question
                  against the sample EDI knowledge file.
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={`${msg.role}-${i}`}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : msg.mode === 'error'
                        ? 'border border-red-200 bg-red-50 text-red-800'
                        : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {msg.content}
                  {msg.mode === 'demo' && msg.role === 'assistant' && (
                    <p className="mt-2 text-xs text-slate-500">via sample data</p>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          {samples.length > 0 && (
            <div className="border-t border-slate-100 px-4 py-3 md:px-5">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                Sample questions
              </p>
              <div className="flex flex-wrap gap-2">
                {samples.slice(0, 4).map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    disabled={loading}
                    onClick={() => askAI(sample.question)}
                    className="rounded-lg bg-slate-100 px-3 py-2 text-left text-xs text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sample.question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form
            className="flex flex-col gap-2 border-t border-slate-200 p-4 md:flex-row md:p-5"
            onSubmit={(e) => {
              e.preventDefault()
              askAI()
            }}
          >
            <input
              className="min-h-12 flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Ask an EDI question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="min-h-12 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Send
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}
