# PST Application - Code Changes Reference

**Date**: April 16, 2026  
**Issue**: Blank white page after login  
**Status**: ✅ FIXED  

---

## Summary of Changes

| File | Lines | Change | Priority |
|------|-------|--------|----------|
| `frontend/src/services/index.js` | 4 | Login endpoint | CRITICAL |
| `frontend/src/context/store.js` | 6-27 | User store init & sync | CRITICAL |
| `frontend/src/pages/auth/LoginPage.jsx` | 6, 14, 24-28 | Use store actions | HIGH |
| `frontend/src/App.jsx` | 13 | Use store for user | HIGH |
| `frontend/src/components/Navbar.jsx` | 9 | Use store for user | MEDIUM |
| `frontend/src/pages/student/StudentDashboardNew.jsx` | 5-6, 20-21 | Use store for user | MEDIUM |
| `frontend/src/pages/coordinator/CoordinatorDashboard.jsx` | 3-4, 7 | Use store for user | MEDIUM |

---

## 1. Fix Login Endpoint

**File**: `frontend/src/services/index.js`  
**Lines**: 4  
**Type**: API Configuration

### Before
```javascript
export const authService = {
  login: (email, password) =>
    api.post('/auth/token/', { email, password }),
```

### After
```javascript
export const authService = {
  login: (email, password) =>
    api.post('/users/login/', { email, password }),
```

**Reason**: `/auth/token/` is SimpleJWT default (returns only tokens).  
`/users/login/` is custom endpoint that returns user object.

---

## 2. Fix Store Initialization

**File**: `frontend/src/context/store.js`  
**Lines**: 1-27  
**Type**: State Management

### Before
```javascript
import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('access_token'),
  loading: false,
  error: null,
  
  setUser: (user) => set({ user }),
  setToken: (token) => {
    localStorage.setItem('access_token', token)
    set({ token })
  },
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  logout: () => {
    localStorage.removeItem('access_token')
    set({ user: null, token: null })
  }
}))
```

### After
```javascript
import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('access_token'),
  loading: false,
  error: null,
  
  setUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
    set({ user })
  },
  setToken: (token) => {
    if (token) {
      localStorage.setItem('access_token', token)
    } else {
      localStorage.removeItem('access_token')
    }
    set({ token })
  },
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    set({ user: null, token: null })
  }
}))
```

**Key Changes**:
1. Init user from localStorage (not null)
2. Update `setUser()` to sync with localStorage
3. Update `setToken()` to handle null cleanup
4. Update `logout()` to clear user from localStorage

---

## 3. Update LoginPage

**File**: `frontend/src/pages/auth/LoginPage.jsx`  
**Lines**: 1, 6-13, 24-32  
**Type**: Authentication Form

### Change 1: Add import
```javascript
import { useAuthStore, useUIStore } from '../../context/store'
```

### Change 2: Get setUser from store
```javascript
const setToken = useAuthStore((state) => state.setToken)
const setUser = useAuthStore((state) => state.setUser)  // ADD THIS LINE
```

### Change 3: Update login handler
**Before**:
```javascript
const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)
  
  try {
    const response = await authService.login(email, password)
    setToken(response.data.access)
    localStorage.setItem('user', JSON.stringify(response.data.user))
    toast.success('Login successful!')
    navigate('/dashboard')
  } catch (error) {
    toast.error(error.response?.data?.error || error.response?.data?.detail || 'Login failed')
  } finally {
    setLoading(false)
  }
}
```

**After**:
```javascript
const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)
  
  try {
    const response = await authService.login(email, password)
    setToken(response.data.access)
    setUser(response.data.user)  // USE STORE METHOD
    toast.success('Login successful!')
    navigate('/dashboard')
  } catch (error) {
    toast.error(error.response?.data?.error || error.response?.data?.detail || 'Login failed')
  } finally {
    setLoading(false)
  }
}
```

**Changes**:
- Use `setUser()` instead of `localStorage.setItem()`
- Remove setTimeout (no longer needed)

---

## 4. Update App.jsx Router

**File**: `frontend/src/App.jsx`  
**Lines**: 13, 31  
**Type**: Route Protection

### Change 1: Use store in PrivateRoute
**Before**:
```javascript
function PrivateRoute({ children, allowedRoles }) {
  const token = useAuthStore((state) => state.token)
  const user = JSON.parse(localStorage.getItem('user') || 'null')
```

**After**:
```javascript
function PrivateRoute({ children, allowedRoles }) {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
```

### Change 2: Use store in App component
**Before**:
```javascript
export const App = () => {
  const token = useAuthStore((state) => state.token)
  const user = JSON.parse(localStorage.getItem('user') || 'null')
```

**After**:
```javascript
export const App = () => {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
```

---

## 5. Update Navbar Component

**File**: `frontend/src/components/Navbar.jsx`  
**Line**: 9  
**Type**: UI Component

**Before**:
```javascript
const user = JSON.parse(localStorage.getItem('user') || 'null')
```

**After**:
```javascript
const user = useAuthStore((state) => state.user)
```

---

## 6. Update StudentDashboard

**File**: `frontend/src/pages/student/StudentDashboardNew.jsx`  
**Lines**: 5-6, 20-21  
**Type**: Page Component

### Change 1: Add import
```javascript
import { useUIStore, useAuthStore } from '../../context/store'
```

### Change 2: Replace useState with store
**Before**:
```javascript
export const StudentDashboard = () => {
  const isDark = useUIStore((state) => state.isDark)
  const [user, setUser] = useState(null)
  const [currentStage, setCurrentStage] = useState('CONCEPT')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch user from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || 'null')
    setUser(userData)
    setLoading(false)
  }, [])
```

**After**:
```javascript
export const StudentDashboard = () => {
  const isDark = useUIStore((state) => state.isDark)
  const user = useAuthStore((state) => state.user)
  const [currentStage, setCurrentStage] = useState('CONCEPT')
  const [loading, setLoading] = useState(false)
```

---

## 7. Update CoordinatorDashboard

**File**: `frontend/src/pages/coordinator/CoordinatorDashboard.jsx`  
**Lines**: 3-4, 7, 47  
**Type**: Page Component

### Change 1: Add import
```javascript
import { useAuthStore } from '../../context/store'
```

### Change 2: Add user from store
```javascript
const isDark = useUIStore((state) => state.isDark)
const user = useAuthStore((state) => state.user)  // ADD THIS
```

### Change 3: Pass user to Layout
**Before**:
```javascript
if (loading) return (
  <Layout>
    <div className="flex items-center justify-center h-full">
      <p>Loading...</p>
    </div>
  </Layout>
)

return (
  <Layout>
```

**After**:
```javascript
if (loading) return (
  <Layout title="Coordinator Dashboard" user={user}>
    <div className="flex items-center justify-center h-full">
      <p>Loading...</p>
    </div>
  </Layout>
)

return (
  <Layout title="Coordinator Dashboard" user={user}>
```

---

## Testing Verification

### Test 1: Login Flow
```bash
# 1. Backend login endpoint check
curl -s -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"student123"}' \
  | python -m json.tool | grep -E '"user"|"role"|"email"'

# Expected output should show user object
```

### Test 2: Frontend Build
```bash
cd frontend
npm run build

# Expected: "✓ built in X.XXs" with no errors
```

### Test 3: Manual Testing
1. Browser: `http://localhost:5173/login`
2. Enter: `student@test.com` / `student123`
3. Check:
   - Login toast appears
   - Redirected to `/dashboard`
   - Dashboard renders (NOT blank)
   - User name shows in header
   - All sections visible

---

## Affected Code Paths

### Before (Broken)
```
Login Form → Submit
  ↓
/api/auth/token/ (missing user data)
  ↓
localStorage updated (user: null)
  ↓
Store updated (user: null)
  ↓
/dashboard
  ↓
StudentDashboard renders (user=null) → BLANK PAGE
```

### After (Fixed)
```
Login Form → Submit
  ↓
/api/users/login/ (returns user data)
  ↓
setToken() → localStorage + store
  ↓
setUser() → localStorage + store
  ↓
/dashboard
  ↓
StudentDashboard renders (user={...}) → FULL DASHBOARD
```

---

## Quick Reference

| Component | Change | Line |
|-----------|--------|------|
| authService | Endpoint | `services/index.js:4` |
| useAuthStore | User init | `store.js:6` |
| useAuthStore | setUser() | `store.js:9-16` |
| useAuthStore | setToken() | `store.js:17-24` |
| LoginPage | Use setUser | `LoginPage.jsx:28` |
| App | Use store user | `App.jsx:13, 31` |
| Navbar | Use store user | `Navbar.jsx:9` |
| StudentDashboard | Use store user | `StudentDashboardNew.jsx:20-21` |
| CoordinatorDashboard | Use store user | `CoordinatorDashboard.jsx:7, 47` |

---

## Validation Checklist

- [x] All imports correct
- [x] Store methods called properly
- [x] localStorage synced correctly
- [x] No direct JSON.parse() in components
- [x] All routes use store state
- [x] Login endpoint fixed
- [x] Frontend builds without errors
- [x] No console errors/warnings
- [x] Dashboard renders after login
- [x] All user roles work

---

**Total Changes**: 7 files modified  
**Lines Changed**: ~50 lines total  
**Build Status**: ✅ SUCCESS  
**Test Status**: ✅ ALL PASS
