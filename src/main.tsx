import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { CalculatorPage } from '@/pages/CalculatorPage'
import { LearnPage } from '@/pages/LearnPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<CalculatorPage />} />
        <Route path="/learn" element={<LearnPage />} />
      </Routes>
    </HashRouter>
  </StrictMode>,
)
