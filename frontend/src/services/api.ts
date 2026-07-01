const BASE = import.meta.env.VITE_API_URL || '/api'

async function fetchJSON(url: string, options?: RequestInit) {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || res.statusText)
  }
  return res.json()
}

export const api = {
  getNeighborhoods: () => fetchJSON('/neighborhoods'),
  getNeighborhood: (id: number) => fetchJSON(`/neighborhoods/${id}`),
  getIssues: (params?: { severity?: string; neighborhood_id?: number }) => {
    const q = new URLSearchParams()
    if (params?.severity) q.set('severity', params.severity)
    if (params?.neighborhood_id) q.set('neighborhood_id', String(params.neighborhood_id))
    return fetchJSON(`/accessibility/issues?${q}`)
  },
  getTransitStops: (neighborhood_id?: number) => {
    const q = neighborhood_id ? `?neighborhood_id=${neighborhood_id}` : ''
    return fetchJSON(`/transit/stops${q}`)
  },
  getServiceCenters: (params?: { center_type?: string; neighborhood_id?: number }) => {
    const q = new URLSearchParams()
    if (params?.center_type) q.set('center_type', params.center_type)
    if (params?.neighborhood_id) q.set('neighborhood_id', String(params.neighborhood_id))
    return fetchJSON(`/services/centers?${q}`)
  },
  getEquityScores: (params?: { neighborhood_id?: number; dimension?: string }) => {
    const q = new URLSearchParams()
    if (params?.neighborhood_id) q.set('neighborhood_id', String(params.neighborhood_id))
    if (params?.dimension) q.set('dimension', params.dimension)
    return fetchJSON(`/equity/scores?${q}`)
  },
  getEquitySummary: () => fetchJSON('/equity/summary'),
  getDashboardStats: () => fetchJSON('/dashboard/stats'),
  generateBrief: (neighborhood_id: number, focus = 'comprehensive') =>
    fetchJSON('/analysis/generate-brief', {
      method: 'POST',
      body: JSON.stringify({ neighborhood_id, focus }),
    }),
  getRecommendations: (params?: { dimension?: string; neighborhood_id?: number }) =>
    fetchJSON('/analysis/recommendations', {
      method: 'POST',
      body: JSON.stringify({ dimension: params?.dimension || 'all', neighborhood_id: params?.neighborhood_id }),
    }),
}
