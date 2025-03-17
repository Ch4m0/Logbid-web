import axios from 'axios'

const API_BASE_URL =
  'http://ec2-3-16-160-190.us-east-2.compute.amazonaws.com:82'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
})
