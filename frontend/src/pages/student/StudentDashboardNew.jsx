import React, { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { Card, StatCard } from '../../components/Card'
import { Carousel } from '../../components/Carousel'
import { Grid, Container, Section } from '../../components/Grid'
import { Button } from '../../components/Button'
import { useUIStore, useAuthStore } from '../../context/store'
import toast from 'react-hot-toast'

/**
 * Modern Student Dashboard with:
 * - Grid-based responsive layout
 * - Carousel for featured content
 * - Dark/Light mode support
 * - Tailwind CSS styling
 * - Modular components
 */
export const StudentDashboard = () => {
  const isDark = useUIStore((state) => state.isDark)
  const user = useAuthStore((state) => state.user)
  const [currentStage, setCurrentStage] = useState('CONCEPT')
  const [loading, setLoading] = useState(false)

  // Carousel slides for featured content
  const carouselSlides = [
    {
      title: '📚 Concept Phase Started',
      description: 'Begin your research proposal by setting up your project title and objectives.',
      bgColor: isDark ? 'bg-gradient-to-r from-blue-900 to-blue-800' : 'bg-gradient-to-r from-blue-100 to-blue-50',
      titleColor: isDark ? 'text-white' : 'text-blue-900',
      textColor: isDark ? 'text-blue-100' : 'text-blue-800',
      cta: {
        label: 'Start Concept Phase',
        onClick: () => toast.success('Navigating to concept phase...'),
      },
      ctaStyle: 'bg-blue-600 text-white hover:bg-blue-700',
    },
    {
      title: '📄 Document Upload',
      description: 'Upload your project documents (PDF, DOC, DOCX, PPTX). Max 10MB per file.',
      bgColor: isDark ? 'bg-gradient-to-r from-green-900 to-green-800' : 'bg-gradient-to-r from-green-100 to-green-50',
      titleColor: isDark ? 'text-white' : 'text-green-900',
      textColor: isDark ? 'text-green-100' : 'text-green-800',
      cta: {
        label: 'Upload Document',
        onClick: () => toast.success('Opening document upload...'),
      },
      ctaStyle: 'bg-green-600 text-white hover:bg-green-700',
    },
    {
      title: '✅ Track Activities',
      description: 'Monitor your research activities, milestones, and completion status.',
      bgColor: isDark ? 'bg-gradient-to-r from-purple-900 to-purple-800' : 'bg-gradient-to-r from-purple-100 to-purple-50',
      titleColor: isDark ? 'text-white' : 'text-purple-900',
      textColor: isDark ? 'text-purple-100' : 'text-purple-800',
      cta: {
        label: 'View Activities',
        onClick: () => toast.success('Loading your activities...'),
      },
      ctaStyle: 'bg-purple-600 text-white hover:bg-purple-700',
    },
  ]

  if (loading) {
    return (
      <Layout title="Student Dashboard" user={user}>
        <div className="flex items-center justify-center h-96">
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading your dashboard...
          </p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Student Dashboard" stage={currentStage} user={user}>
      <Container>
        {/* Welcome Section */}
        <Section className={isDark ? 'bg-gray-900' : 'bg-white rounded-lg p-6 mb-8'}>
          <h1 className={`text-4xl font-bold mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Welcome, {user?.first_name || 'Student'}!
          </h1>
          <p className={`text-lg ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Track your postgraduate research progress and submission stages.
          </p>
        </Section>

        {/* Featured Carousel */}
        <Section>
          <h2 className={`text-2xl font-bold mb-6 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Getting Started
          </h2>
          <Carousel slides={carouselSlides} autoPlay={true} interval={6000} />
        </Section>

        {/* Key Statistics Grid */}
        <Section>
          <h2 className={`text-2xl font-bold mb-6 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Your Progress
          </h2>
          <Grid columns={3} gap={6}>
            <StatCard
              label="Current Stage"
              value={currentStage}
              icon="📍"
              color="blue"
            />
            <StatCard
              label="Documents Uploaded"
              value="3"
              unit="files"
              icon="📄"
              color="green"
            />
            <StatCard
              label="Completed Activities"
              value="7"
              unit="tasks"
              icon="✅"
              color="purple"
            />
          </Grid>
        </Section>

        {/* Main Content Grid */}
        <Section>
          <Grid columns={2} gap={6} className="grid-cols-1 lg:grid-cols-2">
            {/* Current Stage Card */}
            <Card
              title="Current Stage"
              icon="📍"
              headerColor="blue"
              description="Your research submission stage"
            >
              <div className={`space-y-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Stage: CONCEPT</p>
                  <div className={`w-full h-2 rounded-full ${
                    isDark ? 'bg-gray-700' : 'bg-gray-200'
                  } overflow-hidden`}>
                    <div className="h-full w-1/3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
                  </div>
                  <p className="text-xs">Progress: 33%</p>
                </div>
                <div className="mt-4">
                  <p className="text-sm">
                    <strong>Requirements:</strong>
                    <ul className="mt-2 space-y-1 text-xs">
                      <li>✓ Project Title Submitted</li>
                      <li>○ Concept Document (0/1)</li>
                      <li>○ Supervisor Assigned</li>
                    </ul>
                  </p>
                </div>
                <Button variant="primary" size="md" className="w-full mt-4">
                  Request Approval
                </Button>
              </div>
            </Card>

            {/* Activities Card */}
            <Card
              title="Recent Activities"
              icon="✅"
              headerColor="green"
              description="Your completed and pending tasks"
            >
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {[
                  { title: 'Literature Review', status: 'completed' },
                  { title: 'Methodology Design', status: 'in-progress' },
                  { title: 'Data Collection', status: 'pending' },
                  { title: 'Analysis Report', status: 'pending' },
                ].map((activity, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg transition-all ${
                      activity.status === 'completed'
                        ? isDark ? 'bg-green-900/30 border border-green-700' : 'bg-green-50 border border-green-200'
                        : activity.status === 'in-progress'
                        ? isDark ? 'bg-yellow-900/30 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'
                        : isDark ? 'bg-gray-700 border border-gray-600' : 'bg-gray-100 border border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${
                        isDark ? 'text-gray-200' : 'text-gray-900'
                      }`}>
                        {activity.status === 'completed' ? '✓' : activity.status === 'in-progress' ? '⧖' : '○'} {activity.title}
                      </span>
                      <span className="text-xs opacity-75 capitalize">
                        {activity.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Grid>
        </Section>

        {/* Documents Section */}
        <Section>
          <h2 className={`text-2xl font-bold mb-6 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Your Documents
          </h2>
          <Grid columns={3} gap={6}>
            {[
              { name: 'Concept_Proposal.pdf', date: '2026-04-15', size: '2.4 MB' },
              { name: 'Literature_Review.docx', date: '2026-04-14', size: '1.8 MB' },
              { name: 'Research_Design.pptx', date: '2026-04-13', size: '3.2 MB' },
            ].map((doc, idx) => (
              <Card
                key={idx}
                icon="📄"
                headerColor="purple"
              >
                <div className={`space-y-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div>
                    <p className="font-semibold text-sm truncate">{doc.name}</p>
                    <p className="text-xs opacity-75 mt-1">{doc.date}</p>
                    <p className="text-xs opacity-75">{doc.size}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" className="flex-1">
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </Grid>
        </Section>

        {/* Quick Actions */}
        <Section className="mb-12">
          <h2 className={`text-2xl font-bold mb-6 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Quick Actions
          </h2>
          <Grid columns={4} gap={4} className="grid-cols-2 lg:grid-cols-4">
            <Button variant="primary" className="w-full" size="lg">
              📤 Upload Document
            </Button>
            <Button variant="secondary" className="w-full" size="lg">
              ➕ New Activity
            </Button>
            <Button variant="secondary" className="w-full" size="lg">
              📊 View Reports
            </Button>
            <Button variant="secondary" className="w-full" size="lg">
              💬 Contact Supervisor
            </Button>
          </Grid>
        </Section>
      </Container>
    </Layout>
  )
}
