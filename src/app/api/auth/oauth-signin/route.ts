import { createClient } from '@/lib/supabase/server'
import { redirect } from "next/navigation"
import { NextRequest } from 'next/server'
import { Provider } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const provider = searchParams.get('provider')

  const supabase = await createClient()

const { data, error } = await supabase.auth.signInWithOAuth({
  provider: provider as Provider,
  options: {
    redirectTo: 'http://localhost:3000/api/auth/callback',
  },
})
if (data.url) {
  redirect(data.url) // use the redirect API for your server framework
}
}