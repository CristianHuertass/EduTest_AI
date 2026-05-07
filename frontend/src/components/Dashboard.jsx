/**
 * Dashboard.jsx – Panel principal. Dark Mode con acento cian.
 * EduTest AI
 */

import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import QuizViewer from './QuizViewer'
import './Dashboard.css'

// URL base del backend
const API_BASE = 'http://127.0.0.1:8000'

export default function Dashboard({ user, onLogout }) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const fileInputRef = useRef(null)

  const [quizData, setQuizData] = useState(null)
  const [quizId, setQuizId] = useState(null)
  const [isQuizActive, setIsQuizActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // ── Estados del historial ──────────────────────────────────────────────────
  const [history, setHistory] = useState([])
  const [isHistoryActive, setIsHistoryActive] = useState(false)
  const [selectedAttempt, setSelectedAttempt] = useState(null)

  const handleViewDetail = async (quiz) => {
    try {
      const response = await fetch(`${API_BASE}/api/quiz_attempt/${quiz.id}`)
      const result = await response.json()
      if (result.success && result.data) {
        setSelectedAttempt({ ...result.data, quizTitle: quiz.title })
      } else {
        alert('No se encontraron intentos guardados para este cuestionario.')
      }
    } catch (err) {
      console.error('Error fetching attempt detail:', err)
      alert('Error al obtener el detalle del cuestionario.')
    }
  }

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return
      try {
        const response = await fetch(`${API_BASE}/api/quizzes/${user.id}`)
        const result = await response.json()
        if (result.success) {
          setHistory(result.data || [])
        }
      } catch (err) {
        console.error('Error fetching history:', err)
      }
    }
    fetchHistory()
  }, [user])

  // ── Lógica de subida ──────────────────────────────────────────────────────
  const handleUpload = async (file) => {
    if (!file) return
    if (file.type !== 'application/pdf') { alert('  Solo se aceptan archivos PDF.'); return }
    setUploading(true)
    try {
      const uniqueName = `${Date.now()}_${file.name}`
      const storagePath = `${user.id}/${uniqueName}`

      const { error: storageError } = await supabase.storage.from('study_materials').upload(storagePath, file)
      if (storageError) throw storageError

      const { data: urlData } = supabase.storage.from('study_materials').getPublicUrl(storagePath)
      const fileUrl = urlData.publicUrl

      const { data: dbData, error: dbError } = await supabase
        .from('study_materials')
        .insert({ file_name: file.name, file_url: fileUrl, user_id: user.id })
        .select()
        .single()
      if (dbError) throw dbError

      // Guardamos también el path para poder generar Signed URLs después
      setUploadedFile({ name: file.name, url: fileUrl, path: storagePath, id: dbData?.id })
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      alert(` Error al subir el archivo: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  const onFileChange = (e) => { const f = e.target.files?.[0]; if (f) handleUpload(f) }
  const onDrop = (e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleUpload(f) }
  const onDragOver = (e) => { e.preventDefault(); setDragOver(true) }
  const onDragLeave = () => setDragOver(false)
  const handleCancelUpload = () => { setUploadedFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }
  // ── Generación de cuestionario con IA (API real) ─────────────────────────
  const handleGenerarCuestionarioReal = async () => {
    if (!uploadedFile?.path) return
    setIsLoading(true)
    try {
      // Paso 1: URL firmada temporal (60 s) para que el backend pueda descargar el PDF
      const { data: signedData, error: signedError } = await supabase.storage
        .from('study_materials')
        .createSignedUrl(uploadedFile.path, 60)

      if (signedError) throw new Error(`No se pudo generar la URL firmada: ${signedError.message}`)

      console.log('🔗 URL firmada a enviar:', signedData.signedUrl)

      // Paso 2: Enviar la Signed URL al backend → Gemini analiza el PDF
      const response = await fetch(`${API_BASE}/api/generate-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_url: signedData.signedUrl,
          material_id: uploadedFile.id || '00000000-0000-0000-0000-000000000000',
          title: uploadedFile.name,
          quiz_type: 'AI_GENERATED',
          user_id: user.id
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.detail || 'Error desconocido del servidor.')
      }

      // ✅ Preguntas recibidas → mostrar QuizViewer
      console.log('✅ Cuestionario generado:', result.data)
      setQuizData(result.data)
      setQuizId(result.quiz_id)
      setIsQuizActive(true)
    } catch (err) {
      console.error('❌ Error al generar el cuestionario:', err)
      alert(`❌ No se pudo generar el cuestionario:\n${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // ── Volver al Dashboard desde el QuizViewer ───────────────────────────────
  const handleResetQuiz = () => {
    setQuizData(null)
    setQuizId(null)
    setIsQuizActive(false)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  
  if (!user) {
    return (
      <div className="dash-bg min-h-screen flex items-center justify-center">
        <p className="text-[#00E5FF] font-bold text-lg animate-pulse">Cargando sesión...</p>
      </div>
    )
  }

  // ── Vista: QuizViewer (cuando el cuestionario está listo) ─────────────────
  if (isQuizActive) {
    return <QuizViewer quizData={quizData} quizId={quizId} user={user} onReset={handleResetQuiz} />
  }

  // ── Vista: Dashboard principal ────────────────────────────────────────────
  return (
    <div className="dash-bg min-h-screen flex flex-col font-sans">

      {/* Orbe decorativo de fondo */}
      <div className="dash-glow" />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-8 py-4 border-b border-white/10">
        <span className="text-xl font-extrabold tracking-tight text-white">
          Edu<span className="text-[#00E5FF]">Test</span> AI
        </span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-white">{user?.email}</span>
          <button
            onClick={onLogout}
            className="px-4 py-1.5 rounded-lg border border-cyan-400 text-cyan-400 text-sm font-semibold hover:bg-cyan-400/10 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-6 py-10">

        {/* Bienvenida */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">¡Bienvenido de vuelta! :D</h1>
          <p className="text-gray-400 text-sm">
            Estás en tu panel de control. Aquí podrás subir tus materiales de estudio y generar evaluaciones inteligentes.
          </p>
        </div>

        {/* Renderizado condicional del Historial o las Tarjetas */}
        {selectedAttempt ? (
          <div className="bg-[#111111] rounded-xl p-6 border border-[#00E5FF]/30 shadow-[0_0_40px_rgba(0,229,255,0.08)] animate-fadeSlide">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{selectedAttempt.quizTitle}</h2>
                <p className="text-[#00E5FF] font-semibold">Nota: {selectedAttempt.score}/{selectedAttempt.answers?.detail?.length || 10}</p>
              </div>
              <button
                onClick={() => setSelectedAttempt(null)}
                className="px-4 py-2 rounded-lg border border-cyan-400 text-cyan-400 text-sm font-semibold hover:bg-cyan-400/10 transition-colors"
              >
                ← Volver
              </button>
            </div>
            
            <div className="flex flex-col gap-6 mt-4">
              {selectedAttempt.answers?.detail?.map((q, idx) => (
                <div key={idx} className="bg-white/[0.02] border border-white/5 p-5 rounded-lg">
                  <p className="text-white font-medium mb-3">{idx + 1}. {q.pregunta}</p>
                  <p className="text-sm mb-1">
                    <span className="text-gray-400">Tu respuesta:</span>{' '}
                    <span className={q.acertada ? "text-green-400" : "text-red-400 font-semibold"}>
                      {q.seleccionada}
                    </span>
                  </p>
                  {!q.acertada && (
                    <p className="text-sm mb-3">
                      <span className="text-gray-400">Respuesta correcta:</span>{' '}
                      <span className="text-green-400">{q.correcta}</span>
                    </p>
                  )}
                  <div className="mt-3 p-3 bg-[#00E5FF]/5 rounded-md border border-[#00E5FF]/10">
                    <p className="text-xs text-[#00E5FF] mb-1 font-bold">💡 Justificación:</p>
                    <p className="text-gray-300 text-sm leading-relaxed">{q.justificacion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : isHistoryActive ? (
          <div className="bg-[#111111] rounded-xl p-6 border border-[#00E5FF]/30 shadow-[0_0_40px_rgba(0,229,255,0.08)] animate-fadeSlide">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="text-[#00E5FF]">🧪</span> Mis Evaluaciones
              </h2>
              <button
                onClick={() => setIsHistoryActive(false)}
                className="px-4 py-2 rounded-lg border border-cyan-400 text-cyan-400 text-sm font-semibold hover:bg-cyan-400/10 transition-colors"
              >
                ← Volver
              </button>
            </div>

            {history.length === 0 ? (
              <p className="text-gray-400 text-center py-10">Aún no tienes evaluaciones.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {history.map((quiz, idx) => (
                  <div key={quiz.id || idx} className="flex justify-between items-center p-4 rounded-lg bg-white/[0.03] hover:bg-white/[0.05] transition-colors border border-white/5">
                    <div>
                      <h4 className="text-white font-semibold text-lg">{quiz.title || 'Cuestionario sin título'}</h4>
                      <p className="text-gray-400 text-xs mt-1">
                        {quiz.created_at ? new Date(quiz.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Fecha desconocida'}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleViewDetail(quiz)}
                      className="px-4 py-1.5 rounded-lg bg-[#00E5FF]/10 text-[#00E5FF] font-semibold text-sm hover:bg-[#00E5FF]/20 transition-colors"
                    >
                      Ver detalle
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* ── Tarjeta 1: Subir Material ─────────────────────────── */}
            <div className="bg-[#111111] rounded-xl p-5 flex flex-col gap-3 hover:-translate-y-1 transition-transform duration-200">
              <div className="text-2xl text-[#00E5FF]">📄</div>
              <h3 className="text-white font-bold text-base">Subir Material</h3>
              <p className="text-gray-400 text-sm flex-1">
                Carga un PDF de estudio para generar preguntas automáticamente.
              </p>

              {/* ── TODO: pega aquí tu lógica real de subida de archivo ── */}
              {uploadedFile ? (
                /* ── Estado: Archivo listo ── */
                <div className="flex flex-col items-center gap-3 pt-1">
                  <svg className="w-14 h-14" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="64" height="64" rx="10" fill="#00E5FF" fillOpacity="0.08" />
                    <path d="M16 10h22l10 10v34a2 2 0 01-2 2H16a2 2 0 01-2-2V12a2 2 0 012-2z" fill="#00E5FF" fillOpacity="0.15" stroke="#00E5FF" strokeWidth="1.5" />
                    <path d="M38 10v10h10" stroke="#00E5FF" strokeWidth="1.5" strokeLinejoin="round" />
                    <rect x="20" y="30" width="24" height="2.5" rx="1.25" fill="#00E5FF" opacity=".5" />
                    <rect x="20" y="36" width="18" height="2.5" rx="1.25" fill="#00E5FF" opacity=".35" />
                    <rect x="20" y="42" width="21" height="2.5" rx="1.25" fill="#00E5FF" opacity=".35" />
                    <text x="32" y="26" textAnchor="middle" fontSize="7" fontWeight="700" fill="#00E5FF">PDF</text>
                  </svg>

                  <p className="text-white/80 text-xs font-semibold text-center w-full truncate" title={uploadedFile.name}>
                    {uploadedFile.name.length > 30 ? uploadedFile.name.slice(0, 27) + '...' : uploadedFile.name}
                  </p>

                  <button
                    onClick={handleGenerarCuestionarioReal}
                    disabled={isLoading}
                    className="w-full py-2 rounded-lg bg-[#00E5FF] text-black font-bold text-sm
                               hover:bg-cyan-300 active:scale-95 transition-all
                               disabled:opacity-60 disabled:cursor-not-allowed
                               flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <span className="inline-block w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Analizando PDF con IA...
                      </>
                    ) : (
                      'Generar Cuestionario con IA'
                    )}
                  </button>

                  <button
                    onClick={handleCancelUpload}
                    disabled={isLoading}
                    className="text-white/30 text-xs hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    🗑 Subir otro archivo
                  </button>
                </div>
              ) : (
                /* ── Estado: Zona de subida ── */
                <>
                  <div
                    className={`upload-zone-dark ${dragOver ? 'upload-zone-dark--active' : ''} ${uploading ? 'upload-zone-dark--loading' : ''}`}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                  >
                    {uploading ? (
                      <><span className="upload-spinner-dark" /><span>Subiendo archivo...</span></>
                    ) : (
                      <><span className="text-lg">☁️</span><span>Arrastra un PDF aquí</span><span className="text-white/30 text-xs">o haz clic para examinar</span></>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={onFileChange} disabled={uploading} />
                </>
              )}
              {/* ── FIN lógica de subida ── */}
            </div>

            {/* ── Tarjeta 2: Mis Evaluaciones ───────────────────────── */}
            <div className="bg-[#111111] rounded-xl p-5 flex flex-col gap-3 hover:-translate-y-1 transition-transform duration-200">
              <div className="text-2xl text-[#00E5FF]">🧪</div>
              <h3 className="text-white font-bold text-base">Mis Evaluaciones</h3>
              <p className="text-gray-400 text-sm flex-1">
                {history.length > 0 ? `Tienes ${history.length} evaluaciones generadas.` : 'Aún no tienes evaluaciones.'}
              </p>
              <button
                onClick={() => setIsHistoryActive(true)}
                className="w-full py-2 rounded-lg bg-[#00E5FF] text-black font-bold text-sm transition-all hover:bg-cyan-300 active:scale-95"
              >
                {history.length > 0 ? 'Ver historial' : 'Generar primero'}
              </button>
            </div>

            {/* ── Tarjeta 3: Resultados ─────────────────────────────── */}
            <div className="bg-[#111111] rounded-xl p-5 flex flex-col gap-3 hover:-translate-y-1 transition-transform duration-200">
              <div className="text-2xl text-[#00E5FF]">📊</div>
              <h3 className="text-white font-bold text-base">Resultados</h3>
              <p className="text-gray-400 text-sm flex-1">
                Analiza el promedio de tus evaluaciones.
              </p>
              <button disabled className="w-full py-2 rounded-lg bg-[#00E5FF] text-black font-bold text-sm opacity-40 cursor-not-allowed">
                Próximamente
              </button>
            </div>

          </div>
        )}
      </main>
    </div>
  )
}
