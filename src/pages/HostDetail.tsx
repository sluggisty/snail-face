import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Server, Clock, FileText, Activity } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { api } from '../api/client'
import { StatCard } from '../components/Card'
import { Table, Badge } from '../components/Table'
import type { ReportSummary } from '../types'
import styles from './HostDetail.module.css'

export default function HostDetail() {
  const { hostname } = useParams<{ hostname: string }>()
  const navigate = useNavigate()
  
  const { data: host, isLoading: hostLoading } = useQuery({
    queryKey: ['host', hostname],
    queryFn: () => api.getHost(hostname!),
    enabled: !!hostname,
  })
  
  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: ['hostReports', hostname],
    queryFn: () => api.getHostReports(hostname!),
    enabled: !!hostname,
  })
  
  const reports = reportsData?.reports ?? []
  
  if (hostLoading) {
    return <div className={styles.loading}>Loading host data...</div>
  }
  
  if (!host) {
    return <div className={styles.error}>Host not found</div>
  }
  
  const lastSeen = new Date(host.last_seen)
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const isActive = lastSeen > hourAgo
  
  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate('/hosts')}>
        <ArrowLeft size={18} />
        <span>Back to Hosts</span>
      </button>
      
      <div className={styles.header}>
        <div className={styles.hostIcon}>
          <Server size={32} />
        </div>
        <div className={styles.hostInfo}>
          <h1>{host.hostname}</h1>
          <div className={styles.hostMeta}>
            <Badge variant={isActive ? 'success' : 'warning'}>
              {isActive ? 'Active' : 'Stale'}
            </Badge>
            <span>
              First seen {format(new Date(host.first_seen), 'MMM d, yyyy')}
            </span>
          </div>
        </div>
      </div>
      
      <div className={styles.statsGrid}>
        <StatCard
          title="Total Reports"
          value={host.report_count}
          icon={<FileText size={20} />}
          color="accent"
        />
        <StatCard
          title="Last Seen"
          value={formatDistanceToNow(new Date(host.last_seen), { addSuffix: true })}
          icon={<Clock size={20} />}
          color={isActive ? 'success' : 'warning'}
        />
        <StatCard
          title="Status"
          value={isActive ? 'Active' : 'Inactive'}
          icon={<Activity size={20} />}
          color={isActive ? 'success' : 'warning'}
        />
      </div>
      
      <section className={styles.section}>
        <h2>Report History</h2>
        <Table
          columns={[
            {
              key: 'timestamp',
              header: 'Collection Time',
              render: (r: ReportSummary) => (
                <span>{format(new Date(r.timestamp), 'MMM d, yyyy HH:mm')}</span>
              ),
            },
            {
              key: 'received_at',
              header: 'Received',
              render: (r: ReportSummary) => (
                <span className={styles.muted}>
                  {formatDistanceToNow(new Date(r.received_at), { addSuffix: true })}
                </span>
              ),
            },
            {
              key: 'collection_id',
              header: 'Collection ID',
              render: (r: ReportSummary) => (
                <code className={styles.code}>{r.collection_id.slice(0, 8)}...</code>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              render: (r: ReportSummary) => (
                <Badge variant={r.has_errors ? 'warning' : 'success'}>
                  {r.has_errors ? 'Has Errors' : 'OK'}
                </Badge>
              ),
            },
          ]}
          data={reports}
          onRowClick={(r) => navigate(`/reports/${r.id}`)}
          loading={reportsLoading}
          emptyMessage="No reports from this host"
        />
      </section>
    </div>
  )
}

