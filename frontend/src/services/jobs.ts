import api from './api'

export type Job = {
  id: number
  title: string
  company: string
  location: string
  salary_range?: string
  description?: string
}

export const getJobs = async (): Promise<Job[]> => {
  const res = await api.get('/jobs')
  return res.data
}

export const getJobById = async (id: string): Promise<Job> => {
  const res = await api.get(`/jobs/${id}`)
  return res.data
}

