import type { 
  Report, 
  ReportsResponse, 
  HostsResponse, 
  HostSummary,
  HealthResponse,
  VulnerabilitiesAggregation
} from '../types'

const API_BASE = '/api/v1'

async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }
  
  return response.json()
}

export const api = {
  // Health check
  getHealth: () => fetchApi<HealthResponse>('/health'),
  
  // Reports
  getReports: (params?: { limit?: number; offset?: number; hostname?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.offset) searchParams.set('offset', params.offset.toString())
    if (params?.hostname) searchParams.set('hostname', params.hostname)
    
    const query = searchParams.toString()
    return fetchApi<ReportsResponse>(`/reports${query ? `?${query}` : ''}`)
  },
  
  getReport: (id: string) => fetchApi<Report>(`/reports/${id}`),
  
  deleteReport: async (id: string) => {
    const response = await fetch(`${API_BASE}/reports/${id}`, { method: 'DELETE' })
    if (!response.ok) {
      throw new Error(`Failed to delete report: ${response.status}`)
    }
  },
  
  // Hosts
  getHosts: () => fetchApi<HostsResponse>('/hosts'),
  
  getHost: (hostname: string) => fetchApi<HostSummary>(`/hosts/${hostname}`),
  
  getHostReports: (hostname: string) => 
    fetchApi<{ hostname: string; reports: ReportsResponse['reports']; total: number }>(
      `/hosts/${hostname}/reports`
    ),
  
  // Vulnerabilities
  getVulnerabilities: () => fetchApi<VulnerabilitiesAggregation>('/vulnerabilities'),
}

