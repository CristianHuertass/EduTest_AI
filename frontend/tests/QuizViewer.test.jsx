import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import QuizViewer from '../src/components/QuizViewer'

describe('QuizViewer Component', () => {
  it('muestra mensaje de espera cuando no hay quizData', () => {
    render(<QuizViewer quizData={[]} quizId="123" />)
    expect(screen.getByText(/Esperando al/i)).toBeInTheDocument()
  })
})
