import { NavLink, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Server, 
  FileText, 
  Settings,
  Activity
} from 'lucide-react'
import styles from './Sidebar.module.css'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/hosts', icon: Server, label: 'Hosts' },
  { path: '/reports', icon: FileText, label: 'Reports' },
]

export default function Sidebar() {
  const location = useLocation()
  
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <img src="/snail.svg" alt="Snail Face" />
        </div>
        <div className={styles.logoText}>
          <span className={styles.logoName}>Snail Face</span>
          <span className={styles.logoTagline}>System Insights</span>
        </div>
      </div>
      
      <nav className={styles.nav}>
        <div className={styles.navSection}>
          <span className={styles.navSectionTitle}>Overview</span>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
              end={item.path === '/'}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
      
      <div className={styles.footer}>
        <div className={styles.status}>
          <Activity size={14} className={styles.statusIcon} />
          <span>Connected</span>
        </div>
        <div className={styles.version}>v0.1.0</div>
      </div>
    </aside>
  )
}

