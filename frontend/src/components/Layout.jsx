import React, { useEffect, useState } from 'react'
import { HeaderComponent } from './Header'
import { NavbarComponent } from './Navbar'
import { StageIndicator } from './StageIndicator'
import { useUIStore } from '../context/store'
import { useCurrentUser } from '../hooks/useAuth'
import { stageService } from '../services'

/**
 * Modern Layout Component
 * Features:
 * - Responsive design with Tailwind CSS Grid
 * - Dark/Light mode support
 * - Dynamic Header with project title and stage
 * - Navigation bar with smooth transitions
 * - Content area
 * - Footer
 */
export const Layout = ({ children, title = 'PST Application', stage = null, user = null }) => {
  const isDark = useUIStore((state) => state.isDark)
  const { user: currentUser } = useCurrentUser()
  const effectiveUser = user || currentUser
  const [currentStage, setCurrentStage] = useState(stage)

  useEffect(() => {
    const fetchStage = async () => {
      if (stage || effectiveUser?.role !== 'student') {
        setCurrentStage(stage)
        return
      }
      try {
        const response = await stageService.getCurrentStage()
        setCurrentStage(response.data?.stage_type || effectiveUser?.current_stage || null)
      } catch (error) {
        setCurrentStage(effectiveUser?.current_stage || null)
      }
    }

    fetchStage()
  }, [effectiveUser, stage])

  return (
    <div className="min-h-screen transition-colors duration-300 bg-bg-primary text-text-primary">
      {/* Header */}
      <HeaderComponent title={title} stage={currentStage} user={effectiveUser} />

      {/* Navigation */}
      <NavbarComponent />

      {/* Main Content Area */}
      <main className="min-h-[calc(100vh-140px)] bg-bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {effectiveUser?.role === 'student' && currentStage && (
            <div className="mb-6">
              <StageIndicator currentStage={currentStage} isDark={isDark} />
            </div>
          )}
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-border-primary bg-bg-primary text-text-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-3 text-text-primary">About PST</h4>
              <p className="text-sm text-text-secondary">
                Postgraduate Submissions Tracker for Jaramogi Oginga Odinga University of Science and Technology
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-text-primary">Quick Links</h4>
              <ul className="text-sm space-y-2 text-text-secondary">
                <li><a href="#" className="hover:opacity-90">Dashboard</a></li>
                <li><a href="#" className="hover:opacity-90">Documents</a></li>
                <li><a href="#" className="hover:opacity-90">Reports</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-text-primary">Support</h4>
              <p className="text-sm text-text-secondary">
                For assistance, contact the admin team or visit the documentation.
              </p>
            </div>
          </div>
          <div className="pt-8 text-center text-sm border-t border-border-primary text-text-secondary">
            <p>&copy; 2026 PST - Jaramogi Oginga Odinga University of Science and Technology. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
