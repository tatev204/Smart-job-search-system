import api from './api'

export const login = async (email: string, password: string) => {
  const res = await api.post('/login', { email, password })
  return res.data
}

export const register = async (firstName: string, lastName: string, email: string, password: string) => {
  const res = await api.post('/users', { firstName, lastName, email, password })
  return res.data
}

