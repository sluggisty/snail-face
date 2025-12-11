export interface ReportMeta {
  hostname: string
  collection_id: string
  timestamp: string
  snail_version: string
}

export interface Report {
  id: string
  received_at: string
  meta: ReportMeta
  data: ReportData
  errors?: string[]
}

export interface VulnerabilitySummary {
  total_vulnerabilities?: number
  critical?: number
  high?: number
  medium?: number
  low?: number
  unknown?: number
}

export interface ReportSummary {
  id: string
  hostname: string
  collection_id: string
  timestamp: string
  received_at: string
  has_errors: boolean
  vulnerability_summary?: VulnerabilitySummary
  compliance_summary?: ComplianceSummary
}

export interface HostSummary {
  hostname: string
  report_count: number
  first_seen: string
  last_seen: string
  latest_report_id: string
  latest_vulnerability_summary?: VulnerabilitySummary
  latest_compliance_summary?: ComplianceSummary
}

export interface ReportData {
  system?: SystemData
  hardware?: HardwareData
  network?: NetworkData
  packages?: PackagesData
  services?: ServicesData
  filesystem?: FilesystemData
  security?: SecurityData
  logs?: LogsData
  vulnerabilities?: VulnerabilitiesData
  compliance?: ComplianceData
}

export interface SystemData {
  os?: {
    name?: string
    id?: string
    version?: string
    architecture?: string
  }
  kernel?: {
    release?: string
    version?: string
  }
  hostname?: {
    hostname?: string
    fqdn?: string
  }
  uptime?: {
    days?: number
    hours?: number
    minutes?: number
    human_readable?: string
  }
  virtualization?: {
    type?: string
    is_virtual?: boolean
  }
}

export interface HardwareData {
  cpu?: {
    model?: string
    physical_cores?: number
    logical_cores?: number
    load_average?: {
      '1min'?: number
      '5min'?: number
      '15min'?: number
    }
  }
  memory?: {
    total?: number
    total_human?: string
    used?: number
    available?: number
    percent_used?: number
  }
  disks?: {
    partitions?: Array<{
      device?: string
      mountpoint?: string
      fstype?: string
      total_human?: string
      percent_used?: number
    }>
  }
}

export interface NetworkData {
  interfaces?: Array<{
    name?: string
    mac?: string
    is_up?: boolean
    addresses?: Array<{
      type?: string
      address?: string
    }>
  }>
  dns?: {
    nameservers?: string[]
  }
}

export interface PackagesData {
  summary?: {
    total_count?: number
  }
  upgradeable?: {
    count?: number
    security_count?: number
  }
}

export interface ServicesData {
  running_services?: Array<{
    name?: string
    description?: string
  }>
  failed_units?: Array<{
    name?: string
    description?: string
  }>
}

export interface FilesystemData {
  mounts?: Array<{
    device?: string
    mountpoint?: string
    fstype?: string
    percent_used?: number
  }>
}

export interface SecurityData {
  selinux?: {
    enabled?: boolean
    mode?: string
  }
  fips?: {
    enabled?: boolean
  }
}

export interface LogsData {
  kernel_errors?: Array<{
    timestamp?: string
    message?: string
  }>
  service_failures?: Array<{
    unit?: string
    message?: string
  }>
}

export interface VulnerabilitiesData {
  scanner?: string
  trivy_available?: boolean
  trivy_version?: string
  scan_completed?: boolean
  error?: string
  summary?: {
    total_vulnerabilities?: number
    critical?: number
    high?: number
    medium?: number
    low?: number
    unknown?: number
  }
  total_unique_cves?: number
  vulnerabilities?: Vulnerability[]
  targets?: Array<{
    name?: string
    type?: string
    class?: string
  }>
}

export interface Vulnerability {
  cve_id: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN'
  package_name?: string
  installed_version?: string
  fixed_version?: string
  title?: string
  description?: string
  target?: string
  target_type?: string
  primary_url?: string
  references?: string[]
  cvss?: {
    v3_score?: number
    v3_vector?: string
    v2_score?: number
    v2_vector?: string
    source?: string
  }
  published_date?: string
  last_modified?: string
}

export interface ComplianceData {
  scanner?: string
  oscap_available?: boolean
  scap_content_available?: boolean
  scan_completed?: boolean
  oscap_version?: string
  content_file?: string
  error?: string
  distro?: {
    id?: string
    original_id?: string
    version?: string
    major_version?: string
    name?: string
    like?: string
  }
  profile_info?: {
    name?: string
    id?: string
  }
  available_profiles?: string[]
  summary?: ComplianceSummary
  rules?: ComplianceRule[]
  scan_time?: {
    start?: string
    end?: string
  }
  rules_truncated?: boolean
  total_failed_rules?: number
}

export interface ComplianceSummary {
  total_rules?: number
  pass?: number
  fail?: number
  error?: number
  unknown?: number
  notapplicable?: number
  notchecked?: number
  notselected?: number
  informational?: number
  fixed?: number
  score?: number
}

export interface ComplianceRule {
  id: string
  status: 'fail' | 'error' | 'unknown'
  severity?: string
  title?: string
  messages?: string[]
}

export interface ApiResponse<T> {
  data: T
  error?: string
}

export interface ReportsResponse {
  reports: ReportSummary[]
  total: number
  limit: number
  offset: number
}

export interface HostsResponse {
  hosts: HostSummary[]
  total: number
}

export interface HealthResponse {
  status: string
  timestamp: string
}

// Aggregated vulnerability types
export interface AggregatedCVE {
  cve_id: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN'
  title?: string
  description?: string
  primary_url?: string
  fixed_version?: string
  published_date?: string
  affected_hosts: string[]
  affected_count: number
  package_names?: string[]
  cvss_v3_score?: number
}

export interface VulnerabilitiesAggregation {
  total_hosts: number
  hosts_with_vulns: number
  total_unique_cves: number
  severity_counts: VulnerabilitySummary
  cves: AggregatedCVE[]
  generated_at: string
}

// Aggregated compliance types
export interface HostComplianceResult {
  hostname: string
  score: number
  pass_count: number
  fail_count: number
  error_count: number
  total_rules: number
  scan_time?: string
  failed_rules?: ComplianceRule[]
}

export interface AggregatedPolicy {
  profile_id: string
  profile_name: string
  content_file?: string
  host_count: number
  average_score: number
  total_failing: number
  total_passing: number
  host_results: HostComplianceResult[]
}

export interface ComplianceAggregation {
  total_hosts: number
  hosts_with_compliance: number
  total_policies: number
  policies: AggregatedPolicy[]
  generated_at: string
}

