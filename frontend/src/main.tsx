import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Providers from './components/Providers'
import Landing from './pages/Landing'
import DashboardPage from './pages/dashboard/page'
import SpotPage from './pages/spot/page'
import MarginPage from './pages/margin/page'
import PredictPage from './pages/predict/page'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/spot" element={<SpotPage />} />
          <Route path="/margin" element={<MarginPage />} />
          <Route path="/predict" element={<PredictPage />} />
        </Routes>
      </BrowserRouter>
    </Providers>
  </StrictMode>,
)