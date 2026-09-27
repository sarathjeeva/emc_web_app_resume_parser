import { useRef, useState } from 'react'
import './index.css'

const MAX_FILE_SIZE = 5 * 1024 * 1024

function App() {
  const inputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const selectFile = (file) => {
    setError('')
    setResult(null)
    if (!file || file.type !== 'application/pdf') {
      setSelectedFile(null)
      setError('Please choose a PDF file.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null)
      setError('The PDF must be smaller than 5 MB.')
      return
    }
    setSelectedFile(file)
  }

  const submitReview = async (event) => {
    event.preventDefault()
    setError('')
    setResult(null)
    if (!selectedFile) return setError('Add your resume before starting the review.')
    if (jobDescription.trim().length < 50) return setError('Add a job description with at least 50 characters.')

    const formData = new FormData()
    formData.append('resume', selectedFile)
    formData.append('jobDescription', jobDescription.trim())
    setIsLoading(true)

    try {
      const response = await fetch('/api/analyze', { method: 'POST', body: formData })
      const responseText = await response.text()
      let data = {}
      try { data = JSON.parse(responseText) } catch {}
      if (!response.ok) {
        const serverMessage = data.error || (responseText && !responseText.includes('<!DOCTYPE') ? responseText.trim() : '')
        throw new Error(serverMessage || `The review server returned an error (${response.status}).`)
      }
      if (!data.analysis) throw new Error('The review server returned an incomplete response.')
      setResult(data)
      requestAnimationFrame(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }))
    } catch (requestError) {
      setError(requestError.message || 'Unable to reach the server. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const canSubmit = selectedFile && jobDescription.trim().length >= 50 && !isLoading

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.12),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.09),transparent_28%)]" />
      <section className="relative mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400 font-black text-slate-950">R</div>
            <span className="font-semibold tracking-tight">Resume Match</span>
          </div>
          <span className="rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1 text-xs text-slate-400">AI powered review</span>
        </header>

        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-amber-400">Tailor every application</p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl">See how well your resume fits the role.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-400">
            Upload your PDF and paste the job description. Get a match score, strengths, gaps, and practical improvements.
          </p>
        </div>

        <form onSubmit={submitReview} className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20 backdrop-blur sm:p-8">
            <PanelTitle step="Step 1" title="Upload your resume" detail="PDF · max 5 MB" color="amber" />
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && inputRef.current?.click()}
              onDragOver={(event) => { event.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(event) => { event.preventDefault(); setIsDragging(false); selectFile(event.dataTransfer.files[0]) }}
              onClick={() => inputRef.current?.click()}
              className={`grid min-h-64 cursor-pointer place-items-center rounded-2xl border-2 border-dashed p-8 text-center transition ${
                isDragging ? 'border-amber-400 bg-amber-400/10' : selectedFile
                  ? 'border-emerald-500/70 bg-emerald-500/5'
                  : 'border-slate-700 bg-slate-950/40 hover:border-slate-500'
              }`}
            >
              <input ref={inputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={(event) => selectFile(event.target.files[0])} />
              {selectedFile ? (
                <div>
                  <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-400/10 text-2xl text-emerald-300">✓</div>
                  <p className="max-w-xs truncate font-semibold text-emerald-300">{selectedFile.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  <button type="button" onClick={(event) => { event.stopPropagation(); setSelectedFile(null); setResult(null) }} className="mt-5 text-sm text-slate-400 underline underline-offset-4 hover:text-white">
                    Choose another file
                  </button>
                </div>
              ) : (
                <div>
                  <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-slate-800 text-2xl">↑</div>
                  <p className="font-semibold">Drop your resume here</p>
                  <p className="mt-2 text-sm text-slate-500">or click to browse your files</p>
                </div>
              )}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20 backdrop-blur sm:p-8">
            <PanelTitle step="Step 2" title="Add the job description" detail={`${jobDescription.length.toLocaleString()} characters`} color="sky" />
            <textarea
              value={jobDescription}
              onChange={(event) => { setJobDescription(event.target.value); setError(''); setResult(null) }}
              maxLength={15000}
              placeholder="Paste the responsibilities, qualifications, and skills from the job post…"
              className="min-h-64 w-full resize-none rounded-2xl border border-slate-700 bg-slate-950/60 p-5 leading-7 text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
            />
          </article>

          <div className="lg:col-span-2">
            {error && <div role="alert" className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}
            <button type="submit" disabled={!canSubmit} className="w-full rounded-2xl bg-amber-400 px-6 py-4 text-lg font-bold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500">
              {isLoading ? 'Reading and comparing your resume…' : 'Calculate my match score'}
            </button>
            <p className="mt-3 text-center text-xs text-slate-600">Your API key stays on the server. Only extracted resume text and the job description are sent for analysis.</p>
          </div>
        </form>

        {result && <Results result={result} />}
      </section>
    </main>
  )
}

function PanelTitle({ step, title, detail, color }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <div>
        <p className={`text-xs font-semibold uppercase tracking-widest ${color === 'amber' ? 'text-amber-400' : 'text-sky-400'}`}>{step}</p>
        <h2 className="mt-1 text-xl font-semibold">{title}</h2>
      </div>
      <span className="text-right text-xs text-slate-500">{detail}</span>
    </div>
  )
}

function Results({ result }) {
  const analysis = result.analysis
  const scoreColor = analysis.score >= 75 ? 'text-emerald-400' : analysis.score >= 50 ? 'text-amber-400' : 'text-rose-400'
  return (
    <section id="results" className="mt-12 scroll-mt-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-950/60 p-7 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Match score</p>
          <p className={`mt-3 text-7xl font-black tracking-tight ${scoreColor}`}>{analysis.score}</p>
          <p className="text-lg text-slate-500">out of 100</p>
          <p className="mt-4 text-xs text-slate-600">{result.file.name} · {result.file.pages} page{result.file.pages === 1 ? '' : 's'}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">Your review</p>
          <h2 className="mt-2 text-3xl font-bold">Resume analysis</h2>
          <p className="mt-4 leading-7 text-slate-300">{analysis.summary}</p>
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <ResultList title="Strong matches" items={analysis.strengths} tone="emerald" />
            <ResultList title="Important gaps" items={analysis.gaps} tone="rose" />
          </div>
        </div>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <ResultList title="Recommended improvements" items={analysis.recommendations} tone="amber" numbered />
        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6">
          <h3 className="font-semibold">Keyword coverage</h3>
          <KeywordGroup title="Found in your resume" items={analysis.matchedKeywords} matched />
          <KeywordGroup title="Consider adding when accurate" items={analysis.missingKeywords} />
        </div>
      </div>
    </section>
  )
}

function ResultList({ title, items, tone, numbered = false }) {
  const colors = { emerald: 'border-emerald-500/20 bg-emerald-500/5 marker:text-emerald-400', rose: 'border-rose-500/20 bg-rose-500/5 marker:text-rose-400', amber: 'border-amber-500/20 bg-amber-500/5 marker:text-amber-400' }
  const List = numbered ? 'ol' : 'ul'
  return (
    <div className={`rounded-2xl border p-6 ${colors[tone]}`}>
      <h3 className="font-semibold">{title}</h3>
      <List className={`${numbered ? 'list-decimal' : 'list-disc'} mt-4 space-y-3 pl-5 text-sm leading-6 text-slate-300`}>
        {items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
      </List>
    </div>
  )
}

function KeywordGroup({ title, items, matched = false }) {
  return (
    <div className="mt-5">
      <p className="mb-2 text-xs text-slate-500">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.length ? items.map((item) => <span key={item} className={`rounded-full border px-3 py-1 text-xs ${matched ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-slate-700 bg-slate-800 text-slate-300'}`}>{item}</span>) : <span className="text-sm text-slate-600">None identified</span>}
      </div>
    </div>
  )
}

export default App
