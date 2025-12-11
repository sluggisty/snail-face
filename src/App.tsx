import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Hosts from './pages/Hosts'
import HostDetail from './pages/HostDetail'
import Vulnerabilities from './pages/Vulnerabilities'
import Compliance from './pages/Compliance'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="hosts" element={<Hosts />} />
        <Route path="hosts/:hostname" element={<HostDetail />} />
        <Route path="vulnerabilities" element={<Vulnerabilities />} />
        <Route path="compliance" element={<Compliance />} />
      </Route>
    </Routes>
  )
}

export default App
