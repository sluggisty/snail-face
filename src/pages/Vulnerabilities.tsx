import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { 
  Bug, Server, ExternalLink, ChevronDown, ChevronRight, 
  AlertTriangle, Shield, Package
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { api } from '../api/client'
import { Card } from '../components/Card'
import { Badge } from '../components/Table'
import type { AggregatedCVE } from '../types'
import styles from './Vulnerabilities.module.css'

export default function Vulnerabilities() {
  const [expandedCve, setExpandedCve] = useState<string | null>(null)
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['vulnerabilities'],
    queryFn: api.getVulnerabilities,
    refetchInterval: 60000, // Refresh every minute
  })
  
  if (isLoading) {
    return <div className={styles.loading}>Loading vulnerabilities...</div>
  }
  
  if (error) {
    return (
      <div className={styles.error}>
        <AlertTriangle size={24} />
        <p>Failed to load vulnerabilities</p>
      </div>
    )
  }
  
  const vulnData = data!
  const cves = vulnData.cves ?? []
  
  const filteredCves = severityFilter === 'all' 
    ? cves 
    : cves.filter(c => c.severity === severityFilter)
  
  const getSeverityVariant = (severity: string): 'error' | 'warning' | 'info' | 'default' => {
    switch (severity) {
      case 'CRITICAL': return 'error'
      case 'HIGH': return 'error'
      case 'MEDIUM': return 'warning'
      case 'LOW': return 'info'
      default: return 'default'
    }
  }
  
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <Bug size={28} />
        </div>
        <div className={styles.headerInfo}>
          <h1>Fleet Vulnerabilities</h1>
          <p className={styles.subtitle}>
            Aggregated CVEs across {vulnData.total_hosts} hosts
            {vulnData.generated_at && (
              <span className={styles.updatedAt}>
                · Updated {formatDistanceToNow(new Date(vulnData.generated_at), { addSuffix: true })}
              </span>
            )}
          </p>
        </div>
      </div>
      
      {/* Summary Stats */}
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <div className={styles.statIcon}>
            <Server size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{vulnData.hosts_with_vulns}</span>
            <span className={styles.statLabel}>Hosts with CVEs</span>
          </div>
          <span className={styles.statTotal}>of {vulnData.total_hosts}</span>
        </Card>
        
        <Card className={styles.statCard}>
          <div className={styles.statIcon}>
            <Shield size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{vulnData.total_unique_cves}</span>
            <span className={styles.statLabel}>Unique CVEs</span>
          </div>
        </Card>
        
        <Card className={`${styles.statCard} ${styles.critical}`}>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{vulnData.severity_counts?.critical ?? 0}</span>
            <span className={styles.statLabel}>Critical</span>
          </div>
        </Card>
        
        <Card className={`${styles.statCard} ${styles.high}`}>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{vulnData.severity_counts?.high ?? 0}</span>
            <span className={styles.statLabel}>High</span>
          </div>
        </Card>
        
        <Card className={`${styles.statCard} ${styles.medium}`}>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{vulnData.severity_counts?.medium ?? 0}</span>
            <span className={styles.statLabel}>Medium</span>
          </div>
        </Card>
        
        <Card className={`${styles.statCard} ${styles.low}`}>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{vulnData.severity_counts?.low ?? 0}</span>
            <span className={styles.statLabel}>Low</span>
          </div>
        </Card>
      </div>
      
      {/* Filter */}
      <div className={styles.filterBar}>
        <span>Filter by severity:</span>
        <select 
          value={severityFilter} 
          onChange={(e) => setSeverityFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">All ({cves.length})</option>
          <option value="CRITICAL">Critical ({vulnData.severity_counts?.critical ?? 0})</option>
          <option value="HIGH">High ({vulnData.severity_counts?.high ?? 0})</option>
          <option value="MEDIUM">Medium ({vulnData.severity_counts?.medium ?? 0})</option>
          <option value="LOW">Low ({vulnData.severity_counts?.low ?? 0})</option>
        </select>
      </div>
      
      {/* CVE List */}
      <div className={styles.cveList}>
        {cves.length === 0 ? (
          <Card className={styles.emptyState}>
            <Shield size={48} />
            <h3>No Vulnerabilities Detected</h3>
            <p>All scanned hosts are free of known CVEs. Great job!</p>
          </Card>
        ) : filteredCves.length === 0 ? (
          <Card className={styles.emptyState}>
            <p>No CVEs match the current filter</p>
          </Card>
        ) : (
          filteredCves.map((cve) => (
            <CVECard 
              key={cve.cve_id} 
              cve={cve} 
              expanded={expandedCve === cve.cve_id}
              onToggle={() => setExpandedCve(expandedCve === cve.cve_id ? null : cve.cve_id)}
              getSeverityVariant={getSeverityVariant}
            />
          ))
        )}
      </div>
    </div>
  )
}

interface CVECardProps {
  cve: AggregatedCVE
  expanded: boolean
  onToggle: () => void
  getSeverityVariant: (severity: string) => 'error' | 'warning' | 'info' | 'default'
}

function CVECard({ cve, expanded, onToggle, getSeverityVariant }: CVECardProps) {
  return (
    <Card className={styles.cveCard}>
      <div className={styles.cveHeader} onClick={onToggle}>
        <div className={styles.cveLeft}>
          {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          <Badge variant={getSeverityVariant(cve.severity)}>
            {cve.severity}
          </Badge>
          <code className={styles.cveId}>{cve.cve_id}</code>
          {cve.cvss_v3_score && cve.cvss_v3_score > 0 && (
            <span className={styles.cvssScore}>
              CVSS: {cve.cvss_v3_score.toFixed(1)}
            </span>
          )}
        </div>
        <div className={styles.cveRight}>
          <div className={styles.affectedCount}>
            <Server size={14} />
            <span>{cve.affected_count} host{cve.affected_count !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
      
      {cve.title && (
        <div className={styles.cveTitle}>{cve.title}</div>
      )}
      
      {expanded && (
        <div className={styles.cveDetails}>
          {cve.description && (
            <div className={styles.cveDescription}>
              <strong>Description:</strong>
              <p>{cve.description}</p>
            </div>
          )}
          
          <div className={styles.cveMetaGrid}>
            {cve.fixed_version && (
              <div className={styles.cveMeta}>
                <strong>Fixed in:</strong>
                <span>{cve.fixed_version}</span>
              </div>
            )}
            
            {cve.published_date && (
              <div className={styles.cveMeta}>
                <strong>Published:</strong>
                <span>{cve.published_date}</span>
              </div>
            )}
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
          
          <div className={styles.affectedHosts}>
            <div className={styles.affectedHostsHeader}>
              <strong><Server size={14} /> Affected Hosts ({cve.affected_count}):</strong>
              <Link 
                to={`/vulnerabilities/${cve.cve_id}`}
                className={styles.viewAllLink}
              >
                View all hosts →
              </Link>
            </div>
            <div className={styles.hostTags}>
              {(() => {
                // Show only 3-4 most recent hosts to keep it to one line
                const maxHosts = 3
                const sortedHosts = [...cve.affected_hosts].sort((a, b) => {
                  if (!a.last_seen || !b.last_seen) return 0
                  return new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime()
                })
                const visibleHosts = sortedHosts.slice(0, maxHosts)
                const remainingCount = sortedHosts.length - maxHosts
                
                return (
                  <>
                    {visibleHosts.map(host => (
                      <span key={host.hostname} className={styles.hostTag}>
                        {host.hostname}
                      </span>
                    ))}
                    {remainingCount > 0 && (
                      <Link 
                        to={`/vulnerabilities/${cve.cve_id}`}
                        className={styles.moreHostsLink}
                      >
                        +{remainingCount} more
                      </Link>
                    )}
                  </>
                )
              })()}
            </div>
          </div>
          
          {cve.primary_url && (
            <a 
              href={cve.primary_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.cveLink}
            >
              <ExternalLink size={14} />
              View Details
            </a>
          )}
        </div>
      )}
    </Card>
  )
}

