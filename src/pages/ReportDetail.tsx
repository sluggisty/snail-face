import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { 
  ArrowLeft, Server, Cpu, Network, Package, 
  Settings, Shield, FileText, Clock, AlertTriangle,
  Bug, ExternalLink, ChevronDown, ChevronRight
} from 'lucide-react'
import { format } from 'date-fns'
import { api } from '../api/client'
import { Card } from '../components/Card'
import { Badge } from '../components/Table'
import type { Vulnerability, VulnerabilitiesData } from '../types'
import styles from './ReportDetail.module.css'

export default function ReportDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const { data: report, isLoading, error } = useQuery({
    queryKey: ['report', id],
    queryFn: () => api.getReport(id!),
    enabled: !!id,
  })
  
  if (isLoading) {
    return <div className={styles.loading}>Loading report...</div>
  }
  
  if (error || !report) {
    return <div className={styles.error}>Report not found</div>
  }
  
  const { meta, data, errors } = report
  const system = data?.system
  const hardware = data?.hardware
  const network = data?.network
  const packages = data?.packages
  const security = data?.security
  const vulnerabilities = data?.vulnerabilities
  
  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate('/reports')}>
        <ArrowLeft size={18} />
        <span>Back to Reports</span>
      </button>
      
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <FileText size={28} />
        </div>
        <div className={styles.headerInfo}>
          <h1>System Report</h1>
          <div className={styles.headerMeta}>
            <Badge variant={errors?.length ? 'warning' : 'success'}>
              {errors?.length ? `${errors.length} Errors` : 'OK'}
            </Badge>
            <span className={styles.hostname}>
              <Server size={14} />
              {meta.hostname}
            </span>
            <span className={styles.timestamp}>
              <Clock size={14} />
              {format(new Date(meta.timestamp), 'MMM d, yyyy HH:mm:ss')}
            </span>
          </div>
        </div>
      </div>
      
      {/* Errors Section */}
      {errors && errors.length > 0 && (
        <Card className={styles.errorsCard}>
          <h3><AlertTriangle size={18} /> Collection Errors</h3>
          <ul className={styles.errorsList}>
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </Card>
      )}
      
      <div className={styles.grid}>
        {/* System Info */}
        {system && (
          <Card className={styles.section}>
            <h3><Server size={18} /> System</h3>
            <div className={styles.dataGrid}>
              <DataItem label="OS" value={system.os?.name} />
              <DataItem label="Version" value={system.os?.version} />
              <DataItem label="Architecture" value={system.os?.architecture} />
              <DataItem label="Kernel" value={system.kernel?.release} />
              <DataItem label="Hostname" value={system.hostname?.hostname} />
              <DataItem label="FQDN" value={system.hostname?.fqdn} />
              <DataItem label="Uptime" value={system.uptime?.human_readable} />
              <DataItem 
                label="Virtualization" 
                value={system.virtualization?.is_virtual ? system.virtualization.type : 'Physical'} 
              />
            </div>
          </Card>
        )}
        
        {/* Hardware Info */}
        {hardware && (
          <Card className={styles.section}>
            <h3><Cpu size={18} /> Hardware</h3>
            <div className={styles.dataGrid}>
              <DataItem label="CPU Model" value={hardware.cpu?.model} />
              <DataItem 
                label="CPU Cores" 
                value={`${hardware.cpu?.physical_cores} physical / ${hardware.cpu?.logical_cores} logical`} 
              />
              <DataItem 
                label="Load Average" 
                value={hardware.cpu?.load_average 
                  ? `${hardware.cpu.load_average['1min']?.toFixed(2)} / ${hardware.cpu.load_average['5min']?.toFixed(2)} / ${hardware.cpu.load_average['15min']?.toFixed(2)}`
                  : undefined
                } 
              />
              <DataItem label="Memory" value={hardware.memory?.total_human} />
              <DataItem 
                label="Memory Used" 
                value={hardware.memory?.percent_used ? `${hardware.memory.percent_used.toFixed(1)}%` : undefined} 
              />
            </div>
          </Card>
        )}
        
        {/* Network Info */}
        {network && (
          <Card className={styles.section}>
            <h3><Network size={18} /> Network</h3>
            <div className={styles.dataGrid}>
              <DataItem 
                label="DNS Servers" 
                value={network.dns?.nameservers?.join(', ')} 
              />
              <DataItem 
                label="Interfaces" 
                value={`${network.interfaces?.length ?? 0} configured`} 
              />
            </div>
            {network.interfaces && network.interfaces.length > 0 && (
              <div className={styles.interfacesList}>
                {network.interfaces.slice(0, 5).map((iface, i) => (
                  <div key={i} className={styles.interface}>
                    <span className={styles.ifaceName}>{iface.name}</span>
                    <Badge variant={iface.is_up ? 'success' : 'error'}>
                      {iface.is_up ? 'UP' : 'DOWN'}
                    </Badge>
                    {iface.addresses?.find(a => a.type === 'ipv4') && (
                      <code className={styles.ip}>
                        {iface.addresses.find(a => a.type === 'ipv4')?.address}
                      </code>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
        
        {/* Packages Info */}
        {packages && (
          <Card className={styles.section}>
            <h3><Package size={18} /> Packages</h3>
            <div className={styles.dataGrid}>
              <DataItem 
                label="Installed" 
                value={packages.summary?.total_count?.toLocaleString()} 
              />
              <DataItem 
                label="Updates Available" 
                value={packages.upgradeable?.count} 
              />
              <DataItem 
                label="Security Updates" 
                value={packages.upgradeable?.security_count} 
              />
            </div>
          </Card>
        )}
        
        {/* Security Info */}
        {security && (
          <Card className={styles.section}>
            <h3><Shield size={18} /> Security</h3>
            <div className={styles.dataGrid}>
              <DataItem 
                label="SELinux" 
                value={security.selinux?.enabled 
                  ? `Enabled (${security.selinux.mode})` 
                  : 'Disabled'
                } 
              />
              <DataItem 
                label="FIPS Mode" 
                value={security.fips?.enabled ? 'Enabled' : 'Disabled'} 
              />
            </div>
          </Card>
        )}
      </div>
      
      {/* Vulnerabilities Section */}
      {vulnerabilities && (
        <VulnerabilitiesSection vulnerabilities={vulnerabilities} />
      )}
      
      {/* Raw Data */}
      <Card className={styles.rawSection}>
        <h3><Settings size={18} /> Raw Report Data</h3>
        <details className={styles.rawDetails}>
          <summary>View JSON</summary>
          <pre className={styles.rawJson}>
            {JSON.stringify(report, null, 2)}
          </pre>
        </details>
      </Card>
    </div>
  )
}

function DataItem({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className={styles.dataItem}>
      <span className={styles.dataLabel}>{label}</span>
      <span className={styles.dataValue}>{value ?? '-'}</span>
    </div>
  )
}

function VulnerabilitiesSection({ vulnerabilities }: { vulnerabilities: VulnerabilitiesData }) {
  const [expandedCve, setExpandedCve] = useState<string | null>(null)
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  
  const summary = vulnerabilities.summary
  const vulnList = vulnerabilities.vulnerabilities ?? []
  
  const filteredVulns = severityFilter === 'all' 
    ? vulnList 
    : vulnList.filter(v => v.severity === severityFilter)
  
  const getSeverityVariant = (severity: string): 'error' | 'warning' | 'info' | 'default' => {
    switch (severity) {
      case 'CRITICAL': return 'error'
      case 'HIGH': return 'error'
      case 'MEDIUM': return 'warning'
      case 'LOW': return 'info'
      default: return 'default'
    }
  }
  
  if (!vulnerabilities.trivy_available) {
    return (
      <Card className={styles.vulnSection}>
        <h3><Bug size={18} /> Vulnerability Scan</h3>
        <div className={styles.vulnNotAvailable}>
          <AlertTriangle size={24} />
          <p>Trivy scanner is not installed on this system.</p>
          <code>sudo dnf install trivy</code>
        </div>
      </Card>
    )
  }
  
  if (vulnerabilities.error) {
    return (
      <Card className={styles.vulnSection}>
        <h3><Bug size={18} /> Vulnerability Scan</h3>
        <div className={styles.vulnError}>
          <AlertTriangle size={20} />
          <span>{vulnerabilities.error}</span>
        </div>
      </Card>
    )
  }
  
  return (
    <Card className={styles.vulnSection}>
      <div className={styles.vulnHeader}>
        <h3><Bug size={18} /> Vulnerability Scan</h3>
        {vulnerabilities.trivy_version && (
          <span className={styles.trivyVersion}>{vulnerabilities.trivy_version}</span>
        )}
      </div>
      
      {/* Summary Stats */}
      {summary && (
        <div className={styles.vulnSummary}>
          <div className={`${styles.vulnStat} ${styles.critical}`}>
            <span className={styles.vulnStatValue}>{summary.critical ?? 0}</span>
            <span className={styles.vulnStatLabel}>Critical</span>
          </div>
          <div className={`${styles.vulnStat} ${styles.high}`}>
            <span className={styles.vulnStatValue}>{summary.high ?? 0}</span>
            <span className={styles.vulnStatLabel}>High</span>
          </div>
          <div className={`${styles.vulnStat} ${styles.medium}`}>
            <span className={styles.vulnStatValue}>{summary.medium ?? 0}</span>
            <span className={styles.vulnStatLabel}>Medium</span>
          </div>
          <div className={`${styles.vulnStat} ${styles.low}`}>
            <span className={styles.vulnStatValue}>{summary.low ?? 0}</span>
            <span className={styles.vulnStatLabel}>Low</span>
          </div>
          <div className={styles.vulnStat}>
            <span className={styles.vulnStatValue}>{summary.total_vulnerabilities ?? 0}</span>
            <span className={styles.vulnStatLabel}>Total</span>
          </div>
        </div>
      )}
      
      {/* Filter */}
      <div className={styles.vulnFilter}>
        <span>Filter by severity:</span>
        <select 
          value={severityFilter} 
          onChange={(e) => setSeverityFilter(e.target.value)}
          className={styles.vulnSelect}
        >
          <option value="all">All ({vulnList.length})</option>
          <option value="CRITICAL">Critical ({summary?.critical ?? 0})</option>
          <option value="HIGH">High ({summary?.high ?? 0})</option>
          <option value="MEDIUM">Medium ({summary?.medium ?? 0})</option>
          <option value="LOW">Low ({summary?.low ?? 0})</option>
        </select>
      </div>
      
      {/* CVE List */}
      <div className={styles.vulnList}>
        {filteredVulns.length === 0 ? (
          <div className={styles.noVulns}>
            {vulnList.length === 0 
              ? '✓ No vulnerabilities detected' 
              : 'No vulnerabilities match the filter'}
          </div>
        ) : (
          filteredVulns.slice(0, 50).map((vuln) => (
            <div key={vuln.cve_id} className={styles.vulnItem}>
              <div 
                className={styles.vulnItemHeader}
                onClick={() => setExpandedCve(expandedCve === vuln.cve_id ? null : vuln.cve_id)}
              >
                {expandedCve === vuln.cve_id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <Badge variant={getSeverityVariant(vuln.severity)}>
                  {vuln.severity}
                </Badge>
                <code className={styles.cveId}>{vuln.cve_id}</code>
                <span className={styles.vulnPackage}>{vuln.package_name}</span>
                {vuln.cvss?.v3_score && (
                  <span className={styles.cvssScore}>
                    CVSS: {vuln.cvss.v3_score.toFixed(1)}
                  </span>
                )}
              </div>
              
              {expandedCve === vuln.cve_id && (
                <div className={styles.vulnDetails}>
                  <div className={styles.vulnDetailGrid}>
                    <DataItem label="Package" value={vuln.package_name} />
                    <DataItem label="Installed Version" value={vuln.installed_version} />
                    <DataItem label="Fixed Version" value={vuln.fixed_version || 'Not available'} />
                    <DataItem label="Target" value={vuln.target} />
                  </div>
                  
                  {vuln.title && (
                    <div className={styles.vulnTitle}>
                      <strong>Title:</strong> {vuln.title}
                    </div>
                  )}
                  
                  {vuln.description && (
                    <div className={styles.vulnDescription}>
                      <strong>Description:</strong> {vuln.description}
                    </div>
                  )}
                  
                  {vuln.primary_url && (
                    <a 
                      href={vuln.primary_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.vulnLink}
                    >
                      <ExternalLink size={14} />
                      View Details
                    </a>
                  )}
                </div>
              )}
            </div>
          ))
        )}
        
        {filteredVulns.length > 50 && (
          <div className={styles.vulnMore}>
            Showing 50 of {filteredVulns.length} vulnerabilities
          </div>
        )}
      </div>
    </Card>
  )
}

