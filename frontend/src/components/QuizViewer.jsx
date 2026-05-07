/**
 * QuizViewer.jsx – HU-05: Visualizar y responder cuestionario.
 * EduTest AI – Sprint 3
 *
 * Diseño idéntico al Dashboard y Auth: dark-bg + acento cian #00E5FF,
 * Tailwind CSS para layout, clases compartidas de Dashboard.css para
 * el fondo y el orbe decorativo.
 *
 * Props:
 *   quizData  → array de preguntas generadas por la IA (requerido)
 *   onReset   → callback al pulsar "Nuevo cuestionario"
 */

import { useState } from 'react'
import './Dashboard.css'      // ← fondo, orbe y spinner compartidos
import './QuizViewer.css'     // ← solo estados de opciones (selected/correct/wrong)

// ─────────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────────
export default function QuizViewer({ quizData, quizId, user, onReset }) {
  // { índice: letraSeleccionada } para cada pregunta
  const [answers, setAnswers] = useState({})
  // false = respondiendo | true = modo revisión
  const [isSubmitted, setIsSubmitted] = useState(false)
  // Resultado tras calificar
  const [score, setScore] = useState(null)
  // Estado de carga al enviar a backend
  const [isSaving, setIsSaving] = useState(false)

  // ── Guard: pantalla de espera si quizData aún no llegó ────────────────
  if (!quizData || quizData.length === 0) {
    return (
      <div className="dash-bg min-h-screen flex flex-col items-center justify-center gap-4 font-sans">
        <div className="dash-glow" />
        <div className="relative z-10 flex flex-col items-center gap-4 text-center px-6">
          {/* Spinner cian */}
          <span className="upload-spinner-dark" style={{ width: 40, height: 40 }} />
          <h2 className="text-white font-bold text-xl">
            Esperando al <span className="text-[#00E5FF]">Asistente IA</span>
          </h2>
          <p className="text-gray-400 text-sm max-w-xs">
            Estamos generando tu cuestionario personalizado a partir del PDF. Esto puede tardar unos segundos.
          </p>
          {onReset && (
            <button
              onClick={onReset}
              className="mt-2 px-5 py-2 rounded-lg border border-white/20 text-white/40
                         text-sm hover:border-cyan-400 hover:text-cyan-400 transition-colors"
            >
              ← Cancelar y volver
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── Seleccionar opción (bloqueado en Modo Revisión) ──────────────────
  const handleSelect = (idx, letter) => {
    if (isSubmitted) return
    setAnswers(prev => ({ ...prev, [idx]: letter }))
  }

  // ── Calificar y guardar intento en el backend ───────────────────────────
  const handleGrade = async () => {
    if (Object.keys(answers).length < quizData.length) {
      alert(`⚠️ Tienes ${quizData.length - Object.keys(answers).length} pregunta(s) sin responder.`)
      return
    }

    // 1. Preparar datos para que el backend califique
    const payload = {
      user_id: user?.id || "guest",
      quiz_id: String(quizId),
      quiz_data: quizData,
      user_answers: answers,
    }

    setIsSaving(true)
    try {
      const token = user?.access_token || localStorage.getItem('supabase.auth.token') || 'temp-token'
      const response = await fetch('http://127.0.0.1:8000/api/save-attempt', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        // Loguea el error pero NO bloquea al usuario
        const err = await response.json().catch(() => ({}))
        console.warn('⚠️ El intento no se guardó en el servidor:', err)
      } else {
        const resData = await response.json()
        console.log('✅ Intento guardado y calificado correctamente en el backend.', resData)
        setScore(resData.score_result) // ← La nota ahora viene del backend
      }
    } catch (networkErr) {
      // Error de red: tampoco bloqueamos al usuario
      console.warn('⚠️ No se pudo conectar con el backend (modo offline):', networkErr.message)
    } finally {
      setIsSaving(false)
      setIsSubmitted(true) // ← activa el Modo Revisión siempre, pase lo que pase
    }
  }

  // ── Clase CSS de cada botón de opción ─────────────────────────────────
  const optionClass = (idx, letter) => {
    const sel = answers[idx]
    const cor = quizData[idx].respuesta_correcta
    if (isSubmitted) {
      if (letter === cor) return 'qv-option qv-option--correct'   // verde: correcta
      if (letter === sel) return 'qv-option qv-option--wrong'     // rojo: elegida incorrecta
      return 'qv-option qv-option--disabled'                      // resto: atenuada
    }
    return sel === letter ? 'qv-option qv-option--selected' : 'qv-option'
  }

  const scoreEmoji = (pct) => pct === 100 ? '🏆' : pct >= 70 ? '✅' : pct >= 40 ? '📚' : '💪'

  // ─────────────────────────────────────────────────────────────────────────
  // Render principal — misma estructura que Dashboard
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="dash-bg min-h-screen flex flex-col font-sans">

      {/* Orbe decorativo de fondo */}
      <div className="dash-glow" />

      {/* ── Header ── idéntico al Dashboard ──────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-8 py-4 border-b border-white/10">
        <span className="text-xl font-extrabold tracking-tight text-white">
          Edu<span className="text-[#00E5FF]">Test</span> AI{' '}
          <span className="text-xs font-semibold uppercase tracking-widest text-[#00E5FF]/70
                           border border-[#00E5FF]/30 rounded-full px-2.5 py-0.5 ml-1">
            Cuestionario
          </span>
        </span>

        {onReset && (
          <button
            onClick={onReset}
            className="px-4 py-1.5 rounded-lg border border-cyan-400 text-cyan-400 text-sm font-semibold
                       hover:bg-cyan-400/10 transition-colors"
          >
            ← Volver
          </button>
        )}
      </header>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 max-w-3xl w-full mx-auto px-6 py-10 flex flex-col gap-6">

        {/* Bienvenida */}
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-white mb-1">
            {isSubmitted ? '¡Resultados!' : `Cuestionario (${quizData.length} preguntas)`}
          </h1>
          <p className="text-gray-400 text-sm">
            {isSubmitted
              ? 'Revisa cuánto aprendiste y consulta las justificaciones de cada pregunta.'
              : 'Selecciona una opción por pregunta y presiona "Terminar y Calificar" al finalizar.'}
          </p>
        </div>

        {/* ── Tarjeta de resultados — visible solo en Modo Revisión ────────── */}
        {isSubmitted && score && (
          <div className="bg-[#111111] rounded-xl p-6 flex flex-col items-center gap-4
                          border border-[#00E5FF]/30 animate-fadeSlide
                          shadow-[0_0_40px_rgba(0,229,255,0.08)]">

            {/* Encabezado */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">{scoreEmoji(score.percentage)}</span>
              <h2 className="text-white font-extrabold text-xl tracking-tight">
                Cuestionario <span className="text-[#00E5FF]">Finalizado</span>
              </h2>
            </div>

            {/* Puntaje grande */}
            <p className="text-5xl font-extrabold text-[#00E5FF] leading-none">
              {score.correct}
              <span className="text-white/30 text-3xl font-bold"> / {score.total}</span>
            </p>
            <p className="text-gray-400 text-sm -mt-1">
              {score.correct === score.total
                ? '¡Perfecto! Respondiste todo correctamente.'
                : `${score.correct} de ${score.total} respuestas correctas · ${score.percentage}%`}
            </p>

            {/* Barra de progreso */}
            <div className="w-full h-2 bg-white/8 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-[#00E5FF] rounded-full
                           transition-all duration-700 ease-out"
                style={{ width: `${score.percentage}%` }}
              />
            </div>

            {/* Botón de reinicio dentro de la tarjeta */}
            {onReset && (
              <button
                onClick={onReset}
                className="mt-1 px-6 py-2 rounded-lg border border-cyan-400 text-cyan-400
                           font-bold text-sm hover:bg-cyan-400/10 active:scale-95 transition-all"
              >
                🔄 Nuevo cuestionario
              </button>
            )}
          </div>
        )}

        {/* ── Tarjetas de preguntas ─────────────────────────────────────── */}
        <div className="flex flex-col gap-5">
          {quizData.map((q, i) => (
            <div
              key={i}
              className="bg-[#111111] rounded-xl p-5 flex flex-col gap-4
                         hover:-translate-y-1 transition-transform duration-200"
            >
              {/* Número + enunciado */}
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#00E5FF]">
                  Pregunta {i + 1}
                </span>
                <p className="text-white font-semibold text-base mt-1 leading-snug">
                  {q.pregunta}
                </p>
              </div>

              {/* Opciones */}
              <div className="flex flex-col gap-2">
                {Object.entries(q.opciones).map(([letter, text]) => (
                  <button
                    key={letter}
                    className={optionClass(i, letter)}
                    onClick={() => handleSelect(i, letter)}
                    disabled={isSubmitted}
                  >
                    <span className="qv-letter">{letter}</span>
                    <span className="text-sm">{text}</span>
                  </button>
                ))}
              </div>

              {/* Justificación — visible solo en Modo Revisión */}
              {isSubmitted && (
                <div className="flex gap-2 items-start p-3 rounded-lg
                                bg-white/[0.03] border-l-2 border-[#00E5FF]
                                text-gray-400 text-xs leading-relaxed animate-fadeSlide">
                  <span className="shrink-0">💡</span>
                  <span>{q.justificacion}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Botón "Terminar y Calificar" — oculto en Modo Revisión ───────── */}
        {!isSubmitted && (
          <div className="flex justify-center pt-2">
            <button
              onClick={handleGrade}
              className="px-8 py-2.5 rounded-lg bg-[#00E5FF] text-black font-bold text-sm
                         hover:bg-cyan-300 active:scale-95 transition-all
                         shadow-[0_4px_20px_rgba(0,229,255,0.25)]"
            >
              Terminar y Calificar
            </button>
          </div>
        )}

      </main>
    </div>
  )
}
