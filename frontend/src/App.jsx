import { useState } from 'react'
import './index.css'

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'application/pdf') setSelectedFile(file)
  }

  const handleFilePick = (e) => {
    const file = e.target.files[0]
    if (file) setSelectedFile(file)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
          Hey, get your resume <span className="text-amber-400">reviewed</span> and get a score.
        </h1>
        <p className="mt-4 text-lg text-slate-400 max-w-md mx-auto">
          Drop your PDF resume below and let the AI analyse how it stacks up &mdash; in seconds.
        </p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
        className={`mt-10 w-full max-w-lg border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-150 ${
          isDragging
            ? 'border-amber-400 bg-amber-400/10 scale-[1.01]'
            : selectedFile
              ? 'border-emerald-400 bg-emerald-400/5'
              : 'border-slate-600 hover:border-slate-400 bg-slate-800/40'
        }`}
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={handleFilePick}
        />

        {selectedFile ? (
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl">📄</span>
            <p className="text-emerald-300 font-medium text-lg">{selectedFile.name}</p>
            <p className="text-slate-500 text-sm">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedFile(null) }}
              className="mt-2 text-xs text-slate-500 underline hover:text-slate-300"
            >
              choose a different file
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <span className="text-5xl text-slate-500">📄</span>
            <p className="text-slate-300 text-lg font-medium">
              {isDragging ? 'Drop it here' : 'Drop your resume here'}
            </p>
            <p className="text-slate-500 text-sm">or click to browse &mdash; PDF only</p>
          </div>
        )}
      </div>

      <div className="mt-12 w-full max-w-lg">
        <button
          disabled={!selectedFile}
          className={`w-full py-3.5 rounded-xl font-semibold text-lg transition-all duration-150 ${
            selectedFile
              ? 'bg-amber-400 text-slate-900 hover:bg-amber-300 active:scale-[0.98] cursor-pointer'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
          }`}
        >
          {selectedFile ? 'Analyse my resume' : 'Select a resume to start'}
        </button>
      </div>

      <p className="mt-16 text-slate-600 text-sm">
        &mdash; no signup, no storage, just the score &mdash;
      </p>
    </div>
  )
}

export default App