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
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header */}
      <HeaderComponent title={title} stage={currentStage} user={effectiveUser} />

      {/* Navigation */}
      <NavbarComponent />

      {/* Main Content Area */}
      <main className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'} min-h-[calc(100vh-140px)]`}>
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
      <footer className={`border-t ${
        isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
      } mt-12`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className={`font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>About PST</h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Postgraduate Submissions Tracker for Jaramogi Oginga Odinga University of Science and Technology
              </p>
            </div>
            <div>
              <h4 className={`font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Quick Links</h4>
              <ul className={`text-sm space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <li><a href="#" className="hover:text-blue-600">Dashboard</a></li>
                <li><a href="#" className="hover:text-blue-600">Documents</a></li>
                <li><a href="#" className="hover:text-blue-600">Reports</a></li>
              </ul>
            </div>
            <div>
              <h4 className={`font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Support</h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                For assistance, contact the admin team or visit the documentation.
              </p>
            </div>
          </div>

          <div className={`border-t pt-8 text-center ${isDark ? 'border-gray-800 text-gray-500' : 'border-gray-200 text-gray-600'} text-sm`}>
            <p>&copy; 2026 PST - Jaramogi Oginga Odinga University of Science and Technology. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
