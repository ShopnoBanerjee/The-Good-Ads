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
    // For new users (signUp), check metadata for userType
    const userType = user.user_metadata?.userType
    if (userType) {
      redirect(`/register?userType=${userType}`)
    } else {
      // For signIn without profile, redirect back to auth
      redirect('/auth')
    }
  }

  // Redirect based on user_type
if (profile.user_type === 'business') {
    redirect('/business')
} else if (profile.user_type === 'college_society') {
    redirect('/society/marketplace')
} else {
    redirect('/error')
}

  // Fallback (should never render)
  return null
}