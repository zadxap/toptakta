import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth'
import { useLang } from './i18n'
import { LogoMark } from './components/Icons'
import { AuthScreen } from './screens/Auth'
import { HomeScreen } from './screens/Home'
import { BoardScreen } from './screens/Board'
import { FeedScreen } from './screens/Feed'
import { TeamScreen } from './screens/Team'
import { BottomNav } from './components/BottomNav'

function Splash() {
  return (
    <div className="splash">
      <div className="splash-mark">
        <LogoMark size={72} />
      </div>
    </div>
  )
}

function GroupLayout() {
  return (
    <>
      <Outlet />
    </>
  )
}

export default function App() {
  const { user, loading } = useAuth()
  useLang() // тіл контексті қосылғанын тексеру үшін емес — роутер төменде

  if (loading) return <Splash />

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<AuthScreen />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/join/:code" element={<HomeScreen />} />
      <Route path="/g/:gid" element={<GroupLayout />}>
        <Route index element={<BoardScreen />} />
        <Route path="feed" element={<FeedScreen />} />
        <Route path="team" element={<TeamScreen />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
