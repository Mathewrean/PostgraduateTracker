export const getHomePath = (role) => {
  switch (role?.toString().toLowerCase()) {
    case 'student':
      return '/dashboard'
    case 'supervisor':
      return '/dashboard'
    case 'coordinator':
    case 'dean':
    case 'cod':
    case 'director_bps':
      return '/dashboard'
    default:
      return '/dashboard'
  }
}

export const getDashboardComponent = (role, user) => {
  switch (role?.toString().toLowerCase()) {
    case 'student':
      return user?.profile_complete === false ? '/profile' : '/dashboard'
    case 'supervisor':
    case 'coordinator':
    case 'dean':
    case 'cod':
    case 'director_bps':
      return '/dashboard'
    default:
      return '/unauthorized'
  }
}

export const getRoleBasedDashboard = (role) => {
  switch (role?.toString().toLowerCase()) {
    case 'supervisor':
      return '/supervisor/dashboard'
    case 'coordinator':
    case 'dean':
    case 'cod':
    case 'director_bps':
      return '/dashboard'
    case 'student':
    default:
      return '/dashboard'
  }
}

const stripOrigin = (link) => {
  if (!link) return ''
  try {
    const baseUrl = typeof window === 'undefined' ? 'http://localhost' : window.location.origin
    const url = new URL(link, baseUrl)
    return `${url.pathname}${url.search}${url.hash}`
  } catch (error) {
    return link
  }
}

export const getNotificationAppPath = (link, role) => {
  const path = stripOrigin(link)
  const normalizedRole = role?.toString().toLowerCase()

  if (!path) return getHomePath(normalizedRole)
  if (!path.startsWith('/api/')) return path

  if (path.startsWith('/api/documents/') || path.startsWith('/api/minutes/')) {
    if (normalizedRole === 'student') return '/documents'
    if (normalizedRole === 'supervisor') return '/supervisor/approvals'
    return '/coordinator/students'
  }

  if (path.startsWith('/api/activities/')) {
    if (normalizedRole === 'student') return '/activities'
    if (normalizedRole === 'supervisor') return '/supervisor/students'
    return '/coordinator/students'
  }

  if (path.startsWith('/api/stages/')) {
    if (normalizedRole === 'supervisor') return '/supervisor/approvals'
    if (normalizedRole === 'student') return '/dashboard'
    return '/coordinator/students'
  }

  if (path.startsWith('/api/notifications/meetings/')) {
    if (normalizedRole === 'student') return '/meetings'
    if (normalizedRole === 'supervisor') return '/supervisor/students'
    return '/notifications'
  }

  return getHomePath(normalizedRole)
}
