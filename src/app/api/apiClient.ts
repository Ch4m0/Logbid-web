import axios from 'axios'

const API_BASE_URL = 'http://ec2-18-218-54-190.us-east-2.compute.amazonaws.com:82'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
})
