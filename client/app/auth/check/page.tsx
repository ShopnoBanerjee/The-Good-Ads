import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function CheckPage() {
  const supabase = await createClient()

  // Get user session
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/auth')
  }

  // Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.user_type) {
    redirect('/auth')
  }

  // Redirect based on user_type
if (profile.user_type === 'business') {
    redirect('/dashboard/business')
} else if (profile.user_type === 'college_society') {
    redirect('/dashboard/society')
} else {
    redirect('/error')
}

  // Fallback (should never render)
  return null
}