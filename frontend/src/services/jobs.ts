import api from './api'

export type Job = {
  id: number
  title: string
  company: string
  location: string
  salary_range?: string
  description?: string
    phone_number: string;
    full_description: string;
}

export const getJobs = async (): Promise<Job[]> => {
  const res = await api.get('/jobs')
  return res.data
}

export const getJobById = async (id: string): Promise<Job> => {
    const res = await api.get(`/jobs/${id}`);
  return res.data
}

export type SearchFilters = {
  q?: string
  title?: string
  limit?: number
  offset?: number
}

export const searchJobs = async (filters: SearchFilters): Promise<{items: Job[], limit: number, offset: number, count: number}> => {
  const params = new URLSearchParams()
  if (filters.q) params.append('q', filters.q)
  if (filters.title) params.append('title', filters.title)
  if (filters.limit) params.append('limit', filters.limit.toString())
  if (filters.offset) params.append('offset', filters.offset.toString())

  const res = await api.get(`/search?${params.toString()}`)
  return res.data
}
