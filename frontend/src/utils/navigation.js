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
