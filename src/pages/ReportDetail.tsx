import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { 
  ArrowLeft, Server, Cpu, HardDrive, Network, Package, 
  Settings, Shield, FileText, Clock, AlertTriangle 
} from 'lucide-react'
import { format } from 'date-fns'
import { api } from '../api/client'
import { Card } from '../components/Card'
import { Badge } from '../components/Table'
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

