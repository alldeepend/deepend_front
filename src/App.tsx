import { Navigate, Route, Routes } from 'react-router'
import Landing from './components/views/Landing'
import Login from './components/views/Login'
import Register from './components/views/Register'
import ProtectedRoute from './components/shared/ProtectedRoute'
import PublicRoute from './components/shared/PublicRoute'
import HomePage from './components/views/HomePage';
import MyJourney from './components/views/MyJourney';
import WorldPlayer from './components/views/WorldPlayer';
import MisRetos from './components/views/MisRetos';
import MisRecursos from './components/views/MisRecursos';
import Perfil from './components/views/Perfil';
import ChallengeDetail from './components/views/ChallengeDetail';
import ForgotPassword from './components/views/ForgotPassword';
import ResetPassword from './components/views/ResetPassword';
import FinancialAssessment from './components/views/FinancialAssessment';
import ActivityHistory from './components/views/ActivityHistory';
import ChallengeLogs from './components/views/ChallengeLogs';
import MyMoneyInAction from './components/views/finance/MyMoneyInAction';
import GastoHormiga from './components/views/finance/GastoHormiga';
import { usePageTracking } from './hooks/usePageTracking';
import WorldsRoute from './components/shared/WorldsRoute';
import WorldsHome from './components/views/worlds/WorldsHome';
import WorldsJourney from './components/views/worlds/WorldsJourney';
import WorldsStation from './components/views/worlds/WorldsStation';
import ArchetypeTest from './components/views/ArchetypeTest';
import MaintenanceGate from './components/shared/MaintenanceGate';

function App() {
    const host = window.location.hostname;
    const isApp = host.includes('app.');

    usePageTracking();

    return (
        <>
            <MaintenanceGate>
            <Routes>
                <Route path="/" element={
                    <PublicRoute>
                        <Landing />
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
                <Route path="/journey/:journeyId/world/:worldId" element={
                    <ProtectedRoute>
                        <WorldPlayer />
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
                <Route path="/challenges/financial-assessment" element={
                    <ProtectedRoute>
                        <FinancialAssessment />
                    </ProtectedRoute>
                } />
                <Route path="/challenges/gasto-hormiga" element={
                    <ProtectedRoute>
                        <GastoHormiga />
                    </ProtectedRoute>
                } />
                <Route path="/challenges/my-money-action" element={
                    <ProtectedRoute>
                        <MyMoneyInAction />
                    </ProtectedRoute>
                } />
                <Route path="/activities" element={
                    <ProtectedRoute>
                        <ActivityHistory />
                    </ProtectedRoute>
                } />
                <Route path="/challenge-logs" element={
                    <ProtectedRoute>
                        <ChallengeLogs />
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
                <Route path="/forgot-password" element={
                    <PublicRoute>
                        <ForgotPassword />
                    </PublicRoute>
                } />
                <Route path="/reset-password" element={
                    <PublicRoute>
                        <ResetPassword />
                    </PublicRoute>
                } />

                <Route path="/worlds" element={
                    <WorldsRoute>
                        <WorldsHome />
                    </WorldsRoute>
                } />
                <Route path="/worlds/:journeyId" element={
                    <WorldsRoute>
                        <WorldsJourney />
                    </WorldsRoute>
                } />
                <Route path="/worlds/:journeyId/station/:stationId" element={
                    <WorldsRoute>
                        <WorldsStation />
                    </WorldsRoute>
                } />


<Route path="/test" element={<ArchetypeTest />} />

<Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </MaintenanceGate>
        </>
    )
}

export default App
