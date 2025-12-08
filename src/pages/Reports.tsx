import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { FileText, Clock, Server } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { api } from '../api/client'
import { Table, Badge } from '../components/Table'
import type { ReportSummary } from '../types'
import styles from './Reports.module.css'

export default function Reports() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const limit = 20
  
  const { data, isLoading } = useQuery({
    queryKey: ['reports', { limit, offset: page * limit }],
    queryFn: () => api.getReports({ limit, offset: page * limit }),
  })
  
  const reports = data?.reports ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / limit)
  
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2>All Reports</h2>
          <p className={styles.subtitle}>
            {total} collection reports received
          </p>
        </div>
      </div>
      
      <Table
        columns={[
          {
            key: 'hostname',
            header: 'Host',
            render: (r: ReportSummary) => (
              <div className={styles.hostCell}>
                <Server size={16} />
                <span className={styles.hostname}>{r.hostname}</span>
              </div>
            ),
          },
          {
            key: 'timestamp',
            header: 'Collection Time',
            render: (r: ReportSummary) => (
              <div className={styles.timeCell}>
                <span>{format(new Date(r.timestamp), 'MMM d, yyyy')}</span>
                <span className={styles.time}>
                  {format(new Date(r.timestamp), 'HH:mm:ss')}
                </span>
              </div>
            ),
          },
          {
            key: 'received_at',
            header: 'Received',
            render: (r: ReportSummary) => (
              <div className={styles.receivedCell}>
                <Clock size={14} />
                <span>
                  {formatDistanceToNow(new Date(r.received_at), { addSuffix: true })}
                </span>
              </div>
            ),
          },
          {
            key: 'collection_id',
            header: 'ID',
            render: (r: ReportSummary) => (
              <code className={styles.code}>{r.id.slice(0, 8)}</code>
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
        loading={isLoading}
        emptyMessage="No reports received yet"
      />
      
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className={styles.pageBtn}
          >
            Previous
          </button>
          <span className={styles.pageInfo}>
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className={styles.pageBtn}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

