/** @type {import('next').NextConfig} */
import path from 'path'

export default {
  webpack(config) {
    config.resolve.alias['@'] = path.resolve(process.cwd(), 'src')
    return config
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
}
