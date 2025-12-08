import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Server, FileText, AlertTriangle, Clock, Activity, Shield } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { api } from '../api/client'
import { StatCard } from '../components/Card'
import { Table, Badge } from '../components/Table'
import type { ReportSummary, HostSummary } from '../types'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const navigate = useNavigate()
  
  const { data: hostsData, isLoading: hostsLoading } = useQuery({
    queryKey: ['hosts'],
    queryFn: api.getHosts,
  })
  
  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: ['reports', { limit: 10 }],
    queryFn: () => api.getReports({ limit: 10 }),
  })
  
  const totalHosts = hostsData?.total ?? 0
  const totalReports = reportsData?.total ?? 0
  const recentReports = reportsData?.reports ?? []
  const recentHosts = hostsData?.hosts?.slice(0, 5) ?? []
  const reportsWithErrors = recentReports.filter(r => r.has_errors).length
  
  return (
    <div className={styles.dashboard}>
      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <StatCard
          title="Total Hosts"
          value={totalHosts}
          subtitle="Systems reporting"
          icon={<Server size={20} />}
          color="accent"
        />
        <StatCard
          title="Total Reports"
          value={totalReports}
          subtitle="Collections received"
          icon={<FileText size={20} />}
          color="success"
        />
        <StatCard
          title="Reports with Errors"
          value={reportsWithErrors}
          subtitle="Need attention"
          icon={<AlertTriangle size={20} />}
          color={reportsWithErrors > 0 ? 'warning' : 'default'}
        />
        <StatCard
          title="System Health"
          value="98%"
          subtitle="Overall status"
          icon={<Shield size={20} />}
          color="success"
        />
      </div>
      
      {/* Main Content */}
      <div className={styles.mainGrid}>
        {/* Recent Reports */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Recent Reports</h2>
            <button 
              className={styles.viewAllBtn}
              onClick={() => navigate('/reports')}
            >
              View All
            </button>
          </div>
          <Table
            columns={[
              { 
                key: 'hostname', 
                header: 'Host',
                render: (r: ReportSummary) => (
                  <span className={styles.hostname}>{r.hostname}</span>
                )
              },
              { 
                key: 'received_at', 
                header: 'Received',
                render: (r: ReportSummary) => (
                  <span className={styles.timestamp}>
                    {formatDistanceToNow(new Date(r.received_at), { addSuffix: true })}
                  </span>
                )
              },
              { 
                key: 'has_errors', 
                header: 'Status',
                render: (r: ReportSummary) => (
                  <Badge variant={r.has_errors ? 'warning' : 'success'}>
                    {r.has_errors ? 'Has Errors' : 'OK'}
                  </Badge>
                )
              },
            ]}
            data={recentReports}
            onRowClick={(r) => navigate(`/reports/${r.id}`)}
            loading={reportsLoading}
            emptyMessage="No reports yet"
          />
        </section>
        
        {/* Active Hosts */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Active Hosts</h2>
            <button 
              className={styles.viewAllBtn}
              onClick={() => navigate('/hosts')}
            >
              View All
            </button>
          </div>
          <div className={styles.hostsList}>
            {hostsLoading ? (
              <div className={styles.loading}>Loading...</div>
            ) : recentHosts.length === 0 ? (
              <div className={styles.empty}>No hosts reporting yet</div>
            ) : (
              recentHosts.map((host) => (
                <div 
                  key={host.hostname}
                  className={styles.hostCard}
                  onClick={() => navigate(`/hosts/${host.hostname}`)}
                >
                  <div className={styles.hostIcon}>
                    <Server size={20} />
                  </div>
                  <div className={styles.hostInfo}>
                    <span className={styles.hostName}>{host.hostname}</span>
                    <span className={styles.hostMeta}>
                      {host.report_count} reports · Last seen{' '}
                      {formatDistanceToNow(new Date(host.last_seen), { addSuffix: true })}
                    </span>
                  </div>
                  <Activity size={16} className={styles.hostStatus} />
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

