import { Navigate, Route, Routes } from 'react-router'
import Login from './components/views/Login'
import Register from './components/views/Register'
import ProtectedRoute from './components/shared/ProtectedRoute'
import PublicRoute from './components/shared/PublicRoute'
import HomePage from './components/views/HomePage';
import MyJourney from './components/views/MyJourney';
import MisRetos from './components/views/MisRetos';
import MisRecursos from './components/views/MisRecursos';
import Perfil from './components/views/Perfil';
import ChallengeDetail from './components/views/ChallengeDetail';

function App() {
  const host = window.location.hostname;
  const isApp = host.includes('app.');

  return (
    <>
      <Routes>
        <Route path="/" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        <Route path="/journey" element={
          <ProtectedRoute>
            <MyJourney />
          </ProtectedRoute>
        } />
        <Route path="/challenges" element={
          <ProtectedRoute>
            <MisRetos />
          </ProtectedRoute>
        } />
        <Route path="/challenges/detail" element={
          <ProtectedRoute>
            <ChallengeDetail />
          </ProtectedRoute>
        } />
        <Route path="/resources" element={
          <ProtectedRoute>
            <MisRecursos />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Perfil />
          </ProtectedRoute>
        } />
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
