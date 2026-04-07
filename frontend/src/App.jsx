import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useThemeStore } from './store'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import PageTransition from './components/PageTransition'
import { RequireAuth, RequireRole } from './components/RequireAuth'

import HomePage from './pages/HomePage'
import VacanciesPage from './pages/VacanciesPage'
import VacancyDetailPage from './pages/VacancyDetailPage'
import { LoginPage, RegisterPage } from './pages/AuthPages'
import EmployerProfilePage from './pages/EmployerProfilePage'
import ApplicationsPage from './pages/ApplicationsPage'
import ChatPage from './pages/ChatPage'
import ProfilePage from './pages/ProfilePage'
import CreateVacancyPage from './pages/CreateVacancyPage'
import EditVacancyPage from './pages/EditVacancyPage'
import NotificationsPage from './pages/NotificationsPage'
import MyVacanciesPage from './pages/MyVacanciesPage'
import VacancyApplicationsPage from './pages/VacancyApplicationsPage'
import WorkerProfilePage from './pages/WorkerProfilePage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import SavedVacanciesPage from './pages/SavedVacanciesPage'
import VacancyMapPage from './pages/VacancyMapPage'
import WorkersPage from './pages/WorkersPage'
import EmployerDashboard from './pages/EmployerDashboard'
import NotFoundPage from './pages/NotFoundPage'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
        <Route path="/vacancies" element={<PageTransition><VacanciesPage /></PageTransition>} />
        <Route path="/vacancies/:id" element={<PageTransition><VacancyDetailPage /></PageTransition>} />
        <Route path="/employers/:id" element={<PageTransition><EmployerProfilePage /></PageTransition>} />
        <Route path="/workers/:id" element={<PageTransition><WorkerProfilePage /></PageTransition>} />
        <Route path="/workers" element={<PageTransition><WorkersPage /></PageTransition>} />
        <Route path="/map" element={<PageTransition><VacancyMapPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPasswordPage /></PageTransition>} />

        {/* Auth required */}
        <Route path="/profile" element={<RequireAuth><PageTransition><ProfilePage /></PageTransition></RequireAuth>} />
        <Route path="/notifications" element={<RequireAuth><PageTransition><NotificationsPage /></PageTransition></RequireAuth>} />
        <Route path="/chat" element={<RequireAuth><PageTransition><ChatPage /></PageTransition></RequireAuth>} />
        <Route path="/chat/:roomId" element={<RequireAuth><PageTransition><ChatPage /></PageTransition></RequireAuth>} />
        <Route path="/saved" element={<RequireAuth><PageTransition><SavedVacanciesPage /></PageTransition></RequireAuth>} />

        {/* Worker only */}
        <Route path="/applications" element={<RequireRole role="WORKER"><PageTransition><ApplicationsPage /></PageTransition></RequireRole>} />

        {/* Employer only */}
        <Route path="/dashboard" element={<RequireRole role="EMPLOYER"><PageTransition><EmployerDashboard /></PageTransition></RequireRole>} />
        <Route path="/vacancies/create" element={<RequireRole role="EMPLOYER"><PageTransition><CreateVacancyPage /></PageTransition></RequireRole>} />
        <Route path="/vacancies/:id/edit" element={<RequireRole role="EMPLOYER"><PageTransition><EditVacancyPage /></PageTransition></RequireRole>} />
        <Route path="/vacancies/:id/applications" element={<RequireRole role="EMPLOYER"><PageTransition><VacancyApplicationsPage /></PageTransition></RequireRole>} />
        <Route path="/my-vacancies" element={<RequireRole role="EMPLOYER"><PageTransition><MyVacanciesPage /></PageTransition></RequireRole>} />

        <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  const { init } = useThemeStore()
  useEffect(() => { init() }, [])

  return (
    <BrowserRouter>
      <Navbar />
      <AnimatedRoutes />
      <Footer />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            boxShadow: 'var(--shadow-md)',
            fontSize: 14,
            fontWeight: 500,
          },
          duration: 3000,
        }}
      />
    </BrowserRouter>
  )
}
