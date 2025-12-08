import { useLocation } from 'react-router-dom'
import { RefreshCw, Bell } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import styles from './Header.module.css'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/hosts': 'Hosts',
  '/reports': 'Reports',
}

export default function Header() {
  const location = useLocation()
  const queryClient = useQueryClient()
  
  const getTitle = () => {
    if (location.pathname.startsWith('/hosts/')) return 'Host Details'
    if (location.pathname.startsWith('/reports/')) return 'Report Details'
    return pageTitles[location.pathname] || 'Snail Face'
  }
  
  const handleRefresh = () => {
    queryClient.invalidateQueries()
  }
  
  return (
    <header className={styles.header}>
      <div className={styles.titleSection}>
        <h1 className={styles.title}>{getTitle()}</h1>
        <span className={styles.breadcrumb}>{location.pathname}</span>
      </div>
      
      <div className={styles.actions}>
        <button 
          className={styles.iconButton}
          onClick={handleRefresh}
          title="Refresh data"
        >
          <RefreshCw size={18} />
        </button>
        <button className={styles.iconButton} title="Notifications">
          <Bell size={18} />
        </button>
      </div>
    </header>
  )
}

