import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import MapPage from './pages/Map'
import Matrix from './pages/Matrix'
import Fifteen from './pages/Fifteen'
import Hidden from './pages/Hidden'
import Future from './pages/Future'
import Compare from './pages/Compare'
import Ai from './pages/Ai'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/matrix" element={<Matrix />} />
        <Route path="/fifteen" element={<Fifteen />} />
        <Route path="/hidden" element={<Hidden />} />
        <Route path="/future" element={<Future />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/ai" element={<Ai />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
