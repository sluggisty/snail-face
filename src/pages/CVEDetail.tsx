import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { 
  Bug, Server, ExternalLink, ArrowLeft, Package, Calendar,
  AlertTriangle, Shield
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { api } from '../api/client'
import { Card } from '../components/Card'
import { Badge } from '../components/Table'
import type { AggregatedCVE } from '../types'
import styles from './CVEDetail.module.css'

export default function CVEDetail() {
  const { cveId } = useParams<{ cveId: string }>()
  
  const { data: cve, isLoading, error } = useQuery({
    queryKey: ['cve', cveId],
    queryFn: () => api.getCVEDetail(cveId!),
    enabled: !!cveId,
  })
  
  if (isLoading) {
    return <div className={styles.loading}>Loading CVE details...</div>
  }
  
  if (error || !cve) {
    return (
      <div className={styles.error}>
        <AlertTriangle size={24} />
        <p>Failed to load CVE details</p>
        <Link to="/vulnerabilities" className={styles.backLink}>
          <ArrowLeft size={16} />
          Back to Vulnerabilities
        </Link>
      </div>
    )
  }
  
  const getSeverityVariant = (severity: string): 'error' | 'warning' | 'info' | 'default' => {
    switch (severity) {
      case 'CRITICAL': return 'error'
      case 'HIGH': return 'error'
      case 'MEDIUM': return 'warning'
      case 'LOW': return 'info'
      default: return 'default'
    }
  }
  
  // Sort by last_seen (most recent first)
  const sortedHosts = [...cve.affected_hosts].sort((a, b) => {
    if (!a.last_seen || !b.last_seen) return 0
    return new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime()
  })
  
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to="/vulnerabilities" className={styles.backLink}>
          <ArrowLeft size={18} />
          Back to Vulnerabilities
        </Link>
        
        <div className={styles.headerContent}>
          <div className={styles.headerIcon}>
            <Bug size={28} />
          </div>
          <div className={styles.headerInfo}>
            <div className={styles.cveHeaderRow}>
              <code className={styles.cveId}>{cve.cve_id}</code>
              <Badge variant={getSeverityVariant(cve.severity)}>
                {cve.severity}
              </Badge>
              {cve.cvss_v3_score && cve.cvss_v3_score > 0 && (
                <span className={styles.cvssScore}>
                  CVSS: {cve.cvss_v3_score.toFixed(1)}
                </span>
              )}
            </div>
            {cve.title && (
              <h1 className={styles.cveTitle}>{cve.title}</h1>
            )}
          </div>
        </div>
      </div>
      
      <div className={styles.content}>
        {/* CVE Details Card */}
        <Card className={styles.detailsCard}>
          <h2 className={styles.sectionTitle}>CVE Details</h2>
          
          {cve.description && (
            <div className={styles.description}>
              <strong>Description:</strong>
              <p>{cve.description}</p>
            </div>
          )}
          
          <div className={styles.metaGrid}>
            {cve.fixed_version && (
              <div className={styles.metaItem}>
                <strong>Fixed in:</strong>
                <span>{cve.fixed_version}</span>
              </div>
            )}
            
            {cve.published_date && (
              <div className={styles.metaItem}>
                <strong><Calendar size={14} /> Published:</strong>
                <span>{cve.published_date}</span>
              </div>
            )}
            
            <div className={styles.metaItem}>
              <strong><Server size={14} /> Affected Hosts:</strong>
              <span>{cve.affected_count} host{cve.affected_count !== 1 ? 's' : ''}</span>
            </div>
          </div>
          
          {cve.package_names && cve.package_names.length > 0 && (
            <div className={styles.packages}>
              <strong><Package size={14} /> Affected Packages:</strong>
              <div className={styles.packageTags}>
                {cve.package_names.map(pkg => (
                  <span key={pkg} className={styles.packageTag}>{pkg}</span>
                ))}
              </div>
            </div>
          )}
          
          {cve.primary_url && (
            <a 
              href={cve.primary_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.externalLink}
            >
              <ExternalLink size={14} />
              View on NVD
            </a>
          )}
        </Card>
        
        {/* Affected Hosts Card */}
        <Card className={styles.hostsCard}>
          <h2 className={styles.sectionTitle}>
            <Server size={20} />
            Affected Hosts ({sortedHosts.length})
          </h2>
          
          <div className={styles.hostsList}>
            {sortedHosts.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No hosts affected by this CVE</p>
              </div>
            ) : (
              <div className={styles.hostsTable}>
                <div className={styles.hostsTableHeader}>
                  <div className={styles.hostNameCol}>Hostname</div>
                  <div className={styles.hostTimeCol}>Last Seen</div>
                </div>
                {sortedHosts.map((host) => (
                  <Link
                    key={host.hostname}
                    to={`/hosts/${host.hostname}`}
                    className={styles.hostRow}
                  >
                    <div className={styles.hostNameCol}>
                      <code>{host.hostname}</code>
                    </div>
                    <div className={styles.hostTimeCol}>
                      {host.last_seen ? (
                        <span className={styles.lastSeen}>
                          {formatDistanceToNow(new Date(host.last_seen), { addSuffix: true })}
                        </span>
                      ) : (
                        <span className={styles.lastSeenUnknown}>Unknown</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}


