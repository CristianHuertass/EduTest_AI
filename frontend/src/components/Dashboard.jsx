/**
 * Dashboard.jsx – Panel principal. Dark Mode con acento cian.
 * EduTest AI
 */

import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import './Dashboard.css'

export default function Dashboard({ user, onLogout }) {
  const [uploading, setUploading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const fileInputRef = useRef(null)

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

      const { error: dbError } = await supabase
        .from('study_materials')
        .insert({ file_name: file.name, file_url: fileUrl, user_id: user.id })
      if (dbError) throw dbError

      // Guardamos también el path para poder generar Signed URLs después
      setUploadedFile({ name: file.name, url: fileUrl, path: storagePath })
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      alert(`❌ Error al subir el archivo: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  const onFileChange = (e) => { const f = e.target.files?.[0]; if (f) handleUpload(f) }
  const onDrop = (e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleUpload(f) }
  const onDragOver = (e) => { e.preventDefault(); setDragOver(true) }
  const onDragLeave = () => setDragOver(false)
  const handleCancelUpload = () => { setUploadedFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }
  // ── Generación de cuestionario con IA ──────────────────────────────────
  const handleGenerateQuiz = async () => {
    if (!uploadedFile?.path) return
    setIsGenerating(true)
    try {
      // Paso 1: Generar una URL firmada temporal (válida 60 segundos)
      const { data: signedData, error: signedError } = await supabase.storage
        .from('study_materials')
        .createSignedUrl(uploadedFile.path, 60)

      if (signedError) throw new Error(`No se pudo generar la URL firmada: ${signedError.message}`)

      console.log('🔗 URL firmada a enviar:', signedData.signedUrl)

      // Paso 2: Enviar la Signed URL al backend para que descargue y procese el PDF
      const response = await fetch('http://127.0.0.1:8000/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_url: signedData.signedUrl }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.detail || 'Error desconocido del servidor.')
      }

      // ✅ Verificación en consola – se reemplazará por la vista del quiz más adelante
      console.log('✅ Cuestionario generado:', result.data)
      alert(`✅ ¡Cuestionario generado! Revisa la consola del navegador (F12) para ver las ${result.data.length} preguntas.`)
    } catch (err) {
      console.error('❌ Error al generar el cuestionario:', err)
      alert(`❌ No se pudo generar el cuestionario: ${err.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="dash-bg min-h-screen flex flex-col font-sans">

      {/* Orbe decorativo de fondo */}
      <div className="dash-glow" />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-8 py-4 border-b border-white/10">
        <span className="text-xl font-extrabold tracking-tight text-white">
          Edu<span className="text-[#00E5FF]">Test</span> AI <span className="text-[#00E5FF]"></span>
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

        {/* Grid de tarjetas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

          {/* ── Tarjeta 1: Subir Material ─────────────────────────── */}
          <div className="bg-[#111111] rounded-xl p-5 flex flex-col gap-3 hover:-translate-y-1 transition-transform duration-200">
            <div className="text-2xl text-[#00E5FF]">📄</div>
            <h3 className="text-white font-bold text-base">Subir Material</h3>
            <p className="text-gray-400 text-sm flex-1">
              Carga un PDF de estudio para generar preguntas automáticamente.
            </p>

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
                  onClick={handleGenerateQuiz}
                  disabled={isGenerating}
                  className="w-full py-2 rounded-lg bg-[#00E5FF] text-black font-bold text-sm hover:bg-cyan-300 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <span className="inline-block w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Generando...
                    </>
                  ) : (
                    'Generar Cuestionario con IA'
                  )}
                </button>

                <button onClick={handleCancelUpload} className="text-white/30 text-xs hover:text-red-400 transition-colors">
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
          </div>

          {/* ── Tarjeta 2: Mis Evaluaciones ───────────────────────── */}
          <div className="bg-[#111111] rounded-xl p-5 flex flex-col gap-3 hover:-translate-y-1 transition-transform duration-200">
            <div className="text-2xl text-[#00E5FF]">🧪</div>
            <h3 className="text-white font-bold text-base">Mis Evaluaciones</h3>
            <p className="text-gray-400 text-sm flex-1">
              Revisa los cuestionarios que ya has generado.
            </p>
            <button disabled className="w-full py-2 rounded-lg bg-[#00E5FF] text-black font-bold text-sm opacity-40 cursor-not-allowed">
              Próximamente
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
      </main>
    </div>
  )
}
