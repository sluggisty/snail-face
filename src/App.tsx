import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Hosts from './pages/Hosts'
import HostDetail from './pages/HostDetail'
import Vulnerabilities from './pages/Vulnerabilities'
import Reports from './pages/Reports'
import ReportDetail from './pages/ReportDetail'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="hosts" element={<Hosts />} />
        <Route path="hosts/:hostname" element={<HostDetail />} />
        <Route path="vulnerabilities" element={<Vulnerabilities />} />
        <Route path="reports" element={<Reports />} />
        <Route path="reports/:id" element={<ReportDetail />} />
      </Route>
    </Routes>
  )
}

export default App

