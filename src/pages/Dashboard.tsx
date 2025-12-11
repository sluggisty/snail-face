import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Server, AlertTriangle, Clock, Activity, Shield, Bug, ClipboardCheck } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { api } from '../api/client'
import { StatCard } from '../components/Card'
import { Badge } from '../components/Table'
import type { HostSummary } from '../types'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const navigate = useNavigate()
  
  const { data: hostsData, isLoading: hostsLoading } = useQuery({
    queryKey: ['hosts'],
    queryFn: api.getHosts,
  })
  
  const { data: vulnData } = useQuery({
    queryKey: ['vulnerabilities'],
    queryFn: api.getVulnerabilities,
  })
  
  const { data: complianceData } = useQuery({
    queryKey: ['compliance'],
    queryFn: api.getCompliance,
  })
  
  const totalHosts = hostsData?.total ?? 0
  const hosts = hostsData?.hosts ?? []
  const hostsWithErrors = hosts.filter(h => h.has_errors).length
  
  // Calculate total CVEs
  const totalCVEs = vulnData?.total_unique_cves ?? 0
  const criticalCVEs = vulnData?.severity_counts?.critical ?? 0
  
  // Calculate average compliance
  const avgCompliance = complianceData?.policies?.length 
    ? complianceData.policies.reduce((sum, p) => sum + p.average_score, 0) / complianceData.policies.length
    : 0
  
  return (
    <div className={styles.dashboard}>
      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <StatCard
          title="Total Hosts"
          value={totalHosts}
          subtitle="Systems monitored"
          icon={<Server size={20} />}
          color="accent"
        />
        <StatCard
          title="Vulnerabilities"
          value={totalCVEs}
          subtitle={criticalCVEs > 0 ? `${criticalCVEs} critical` : 'No critical CVEs'}
          icon={<Bug size={20} />}
          color={criticalCVEs > 0 ? 'error' : 'success'}
        />
        <StatCard
          title="Avg Compliance"
          value={avgCompliance > 0 ? `${avgCompliance.toFixed(0)}%` : 'N/A'}
          subtitle="Security score"
          icon={<ClipboardCheck size={20} />}
          color={avgCompliance >= 80 ? 'success' : avgCompliance >= 60 ? 'warning' : 'error'}
        />
        <StatCard
          title="Hosts with Errors"
          value={hostsWithErrors}
          subtitle="Need attention"
          icon={<AlertTriangle size={20} />}
          color={hostsWithErrors > 0 ? 'warning' : 'success'}
        />
      </div>
      
      {/* Main Content */}
      <div className={styles.mainGrid}>
        {/* All Hosts */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>All Hosts</h2>
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
            ) : hosts.length === 0 ? (
              <div className={styles.empty}>
                <Server size={32} />
                <p>No hosts reporting yet</p>
                <span>Run snail-core on your systems to start collecting data</span>
              </div>
            ) : (
              hosts.slice(0, 8).map((host) => (
                <HostCard 
                  key={host.hostname} 
                  host={host} 
                  onClick={() => navigate(`/hosts/${host.hostname}`)}
                />
              ))
            )}
          </div>
        </section>
        
        {/* Quick Stats */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Security Overview</h2>
          </div>
          <div className={styles.overviewCards}>
            <div 
              className={styles.overviewCard}
              onClick={() => navigate('/vulnerabilities')}
            >
              <div className={styles.overviewIcon}>
                <Bug size={24} />
              </div>
              <div className={styles.overviewContent}>
                <span className={styles.overviewValue}>{totalCVEs}</span>
                <span className={styles.overviewLabel}>Unique CVEs</span>
              </div>
              {criticalCVEs > 0 && (
                <Badge variant="error">{criticalCVEs} Critical</Badge>
              )}
            </div>
            
            <div 
              className={styles.overviewCard}
              onClick={() => navigate('/compliance')}
            >
              <div className={styles.overviewIcon}>
                <ClipboardCheck size={24} />
              </div>
              <div className={styles.overviewContent}>
                <span className={styles.overviewValue}>
                  {complianceData?.total_policies ?? 0}
                </span>
                <span className={styles.overviewLabel}>Security Policies</span>
              </div>
              {complianceData?.hosts_with_compliance && complianceData.hosts_with_compliance > 0 && (
                <Badge variant="info">
                  {complianceData.hosts_with_compliance} Hosts
                </Badge>
              )}
            </div>
            
            <div className={styles.overviewCard}>
              <div className={styles.overviewIcon}>
                <Shield size={24} />
              </div>
              <div className={styles.overviewContent}>
                <span className={styles.overviewValue}>
                  {vulnData?.hosts_with_vulns ?? 0}
                </span>
                <span className={styles.overviewLabel}>Hosts with CVEs</span>
              </div>
              <span className={styles.overviewMeta}>
                of {totalHosts} total
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function HostCard({ host, onClick }: { host: HostSummary; onClick: () => void }) {
  const lastSeen = new Date(host.last_seen)
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const isActive = lastSeen > hourAgo
  
  const vulnCount = host.vulnerability_summary?.total_vulnerabilities ?? 0
  const criticalVulns = host.vulnerability_summary?.critical ?? 0
  const complianceScore = host.compliance_summary?.score
  
  return (
    <div className={styles.hostCard} onClick={onClick}>
      <div className={styles.hostIcon}>
        <Server size={20} />
      </div>
      <div className={styles.hostInfo}>
        <span className={styles.hostName}>{host.hostname}</span>
        <span className={styles.hostMeta}>
          <Clock size={12} />
          {formatDistanceToNow(lastSeen, { addSuffix: true })}
        </span>
      </div>
      <div className={styles.hostBadges}>
        {vulnCount > 0 && (
          <Badge variant={criticalVulns > 0 ? 'error' : 'warning'}>
            {vulnCount} CVEs
          </Badge>
        )}
        {complianceScore !== undefined && (
          <Badge variant={complianceScore >= 80 ? 'success' : complianceScore >= 60 ? 'warning' : 'error'}>
            {complianceScore.toFixed(0)}%
          </Badge>
        )}
      </div>
      <Activity 
        size={16} 
        className={`${styles.hostStatus} ${isActive ? styles.active : ''}`}
      />
    </div>
  )
}
