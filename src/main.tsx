import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { CalculatorPage } from '@/pages/CalculatorPage'
import { LearnPage } from '@/pages/LearnPage'
import { PerformancePage } from '@/pages/PerformancePage'
import { CR3Page } from '@/pages/CR3Page'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<CalculatorPage />} />
        <Route path="/learn" element={<LearnPage />} />
        <Route path="/performance" element={<PerformancePage />} />
        <Route path="/cr3" element={<CR3Page />} />
      </Routes>
    </HashRouter>
  </StrictMode>,
)
