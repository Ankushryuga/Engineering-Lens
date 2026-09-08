import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import { ThemeProvider } from './hooks/useTheme'
import LandingPage from './pages/Landing/Landing'
import AppPage from './pages/App/AppPage'
import DashboardPage from './pages/Dashboard/DashboardPage'
import DocsPage from './pages/Docs/DocsPage'
import SystemDesignPage from './pages/SystemDesign/SystemDesignPage'
import AppErrorBoundary from './components/AppErrorBoundary/AppErrorBoundary'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/app" element={<AppPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/system-design" element={<SystemDesignPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AppErrorBoundary>
  </React.StrictMode>
)
