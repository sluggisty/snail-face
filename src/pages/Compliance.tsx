import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  ClipboardCheck, Server, ChevronDown, ChevronRight, 
  AlertTriangle, CheckCircle, XCircle, AlertCircle
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { api } from '../api/client'
import { Card } from '../components/Card'
import { Badge } from '../components/Table'
import type { AggregatedPolicy, HostComplianceResult, ComplianceRule } from '../types'
import styles from './Compliance.module.css'

export default function Compliance() {
  const [expandedPolicy, setExpandedPolicy] = useState<string | null>(null)
  const [expandedHost, setExpandedHost] = useState<string | null>(null)
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['compliance'],
    queryFn: api.getCompliance,
    refetchInterval: 60000,
  })
  
  if (isLoading) {
    return <div className={styles.loading}>Loading compliance data...</div>
  }
  
  if (error) {
    return (
      <div className={styles.error}>
        <AlertTriangle size={24} />
        <p>Failed to load compliance data</p>
      </div>
    )
  }
  
  const compData = data!
  const policies = compData.policies ?? []
  
  const getScoreColor = (score: number): string => {
    if (score >= 90) return '#22c55e'
    if (score >= 70) return '#eab308'
    return '#ef4444'
  }
  
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <ClipboardCheck size={28} />
        </div>
        <div className={styles.headerInfo}>
          <h1>Fleet Compliance</h1>
          <p className={styles.subtitle}>
            Security policies across {compData.total_hosts} hosts
            {compData.generated_at && (
              <span className={styles.updatedAt}>
                · Updated {formatDistanceToNow(new Date(compData.generated_at), { addSuffix: true })}
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
            <span className={styles.statValue}>{compData.hosts_with_compliance}</span>
            <span className={styles.statLabel}>Hosts Scanned</span>
          </div>
          <span className={styles.statTotal}>of {compData.total_hosts}</span>
        </Card>
        
        <Card className={styles.statCard}>
          <div className={styles.statIcon}>
            <ClipboardCheck size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{compData.total_policies}</span>
            <span className={styles.statLabel}>Unique Policies</span>
          </div>
        </Card>
        
        {policies.length > 0 && (
          <>
            <Card className={`${styles.statCard} ${styles.passing}`}>
              <div className={styles.statContent}>
                <span className={styles.statValue}>
                  {policies.reduce((sum, p) => sum + p.total_passing, 0)}
                </span>
                <span className={styles.statLabel}>Fully Compliant</span>
              </div>
            </Card>
            
            <Card className={`${styles.statCard} ${styles.failing}`}>
              <div className={styles.statContent}>
                <span className={styles.statValue}>
                  {policies.reduce((sum, p) => sum + p.total_failing, 0)}
                </span>
                <span className={styles.statLabel}>Non-Compliant</span>
              </div>
            </Card>
          </>
        )}
      </div>
      
      {/* Policy List */}
      <div className={styles.policyList}>
        {policies.length === 0 ? (
          <Card className={styles.emptyState}>
            <ClipboardCheck size={48} />
            <h3>No Compliance Data</h3>
            <p>No hosts have been scanned with OpenSCAP yet.</p>
          </Card>
        ) : (
          policies.map((policy) => (
            <PolicyCard 
              key={policy.profile_id}
              policy={policy}
              expanded={expandedPolicy === policy.profile_id}
              expandedHost={expandedHost}
              onTogglePolicy={() => {
                setExpandedPolicy(expandedPolicy === policy.profile_id ? null : policy.profile_id)
                setExpandedHost(null)
              }}
              onToggleHost={(hostname) => {
                setExpandedHost(expandedHost === hostname ? null : hostname)
              }}
              getScoreColor={getScoreColor}
            />
          ))
        )}
      </div>
    </div>
  )
}

interface PolicyCardProps {
  policy: AggregatedPolicy
  expanded: boolean
  expandedHost: string | null
  onTogglePolicy: () => void
  onToggleHost: (hostname: string) => void
  getScoreColor: (score: number) => string
}

function PolicyCard({ 
  policy, 
  expanded, 
  expandedHost,
  onTogglePolicy, 
  onToggleHost,
  getScoreColor
}: PolicyCardProps) {
  return (
    <Card className={styles.policyCard}>
      <div className={styles.policyHeader} onClick={onTogglePolicy}>
        <div className={styles.policyLeft}>
          {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          <div className={styles.policyInfo}>
            <span className={styles.policyName}>{policy.profile_name}</span>
            <code className={styles.policyId}>{policy.profile_id}</code>
          </div>
        </div>
        <div className={styles.policyRight}>
          <div className={styles.scoreCircleMini} style={{ '--score-color': getScoreColor(policy.average_score) } as React.CSSProperties}>
            <span className={styles.scoreValueMini}>{Math.round(policy.average_score)}%</span>
          </div>
          <div className={styles.hostCount}>
            <Server size={14} />
            <span>{policy.host_count} host{policy.host_count !== 1 ? 's' : ''}</span>
          </div>
          <div className={styles.passFail}>
            <span className={styles.passCount}>
              <CheckCircle size={14} /> {policy.total_passing}
            </span>
            <span className={styles.failCount}>
              <XCircle size={14} /> {policy.total_failing}
            </span>
          </div>
        </div>
      </div>
      
      {expanded && (
        <div className={styles.policyDetails}>
          <div className={styles.hostResults}>
            <div className={styles.hostResultsHeader}>
              <strong>Host Results</strong>
              <span className={styles.hostResultsSubtitle}>
                Sorted by compliance score (lowest first)
              </span>
            </div>
            
            {policy.host_results.map((result) => (
              <HostResultCard
                key={result.hostname}
                result={result}
                expanded={expandedHost === result.hostname}
                onToggle={() => onToggleHost(result.hostname)}
                getScoreColor={getScoreColor}
              />
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

interface HostResultCardProps {
  result: HostComplianceResult
  expanded: boolean
  onToggle: () => void
  getScoreColor: (score: number) => string
}

function HostResultCard({
  result,
  expanded,
  onToggle,
  getScoreColor
}: HostResultCardProps) {
  return (
    <div className={styles.hostResult}>
      <div className={styles.hostResultHeader} onClick={onToggle}>
        <div className={styles.hostResultLeft}>
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <Server size={16} />
          <span className={styles.hostname}>{result.hostname}</span>
        </div>
        <div className={styles.hostResultRight}>
          <div 
            className={styles.scoreBar}
            style={{ '--score': `${result.score}%`, '--score-color': getScoreColor(result.score) } as React.CSSProperties}
          >
            <div className={styles.scoreBarFill} />
            <span className={styles.scoreBarValue}>{Math.round(result.score)}%</span>
          </div>
          <div className={styles.ruleCounts}>
            <Badge variant="success">{result.pass_count} pass</Badge>
            <Badge variant="error">{result.fail_count} fail</Badge>
            {result.error_count > 0 && (
              <Badge variant="warning">{result.error_count} error</Badge>
            )}
          </div>
        </div>
      </div>
      
      {expanded && result.failed_rules && result.failed_rules.length > 0 && (
        <div className={styles.failedRules}>
          <div className={styles.failedRulesHeader}>
            <AlertCircle size={14} />
            <strong>Failed Rules</strong>
            <span>({result.failed_rules.length} shown)</span>
          </div>
          <div className={styles.rulesList}>
            {result.failed_rules.map((rule) => (
              <FailedRuleItem key={rule.id} rule={rule} />
            ))}
          </div>
        </div>
      )}
      
      {expanded && (!result.failed_rules || result.failed_rules.length === 0) && result.score >= 100 && (
        <div className={styles.fullCompliance}>
          <CheckCircle size={18} />
          <span>This host is fully compliant with this policy</span>
        </div>
      )}
    </div>
  )
}

interface FailedRuleItemProps {
  rule: ComplianceRule
}

function FailedRuleItem({ rule }: FailedRuleItemProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fail': return <XCircle size={14} className={styles.statusFail} />
      case 'error': return <AlertCircle size={14} className={styles.statusError} />
      default: return <AlertTriangle size={14} className={styles.statusUnknown} />
    }
  }
  
  const getSeverityVariant = (severity?: string): 'error' | 'warning' | 'info' | 'default' => {
    switch (severity?.toLowerCase()) {
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'info'
      default: return 'default'
    }
  }
  
  return (
    <div className={styles.ruleItem}>
      <div className={styles.ruleHeader}>
        {getStatusIcon(rule.status)}
        {rule.severity && (
          <Badge variant={getSeverityVariant(rule.severity)}>
            {rule.severity}
          </Badge>
        )}
        <span className={styles.ruleTitle}>{rule.title || rule.id}</span>
      </div>
      <code className={styles.ruleId}>{rule.id}</code>
      {rule.messages && rule.messages.length > 0 && (
        <div className={styles.ruleMessages}>
          {rule.messages.slice(0, 2).map((msg, i) => (
            <p key={i}>{msg}</p>
          ))}
        </div>
      )}
    </div>
  )
}

