import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function CheckPage() {
  const supabase = await createClient()

  // Get user session
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/auth')
  }

  // Check if email is confirmed (optional but recommended)
  if (!user.email_confirmed_at) {
    redirect('/auth/confirm')
  }

  // Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single()

  if (profileError) {
    // If profile doesn't exist, check metadata for userType
    const userType = user.user_metadata?.userType
    if (userType && (userType === 'business' || userType === 'college_society')) {
      redirect(`/register?userType=${userType}`)
    } else {
      // No profile and no valid metadata, redirect to auth
      redirect('/auth')
    }
  }

  // Profile exists
  if (!profile.user_type) {
    // Profile exists but user_type is null, redirect to register to complete
    redirect('/register')
  }

  // Validate user_type
  if (profile.user_type !== 'business' && profile.user_type !== 'college_society') {
    redirect('/error')
  }

  // Check if corresponding profile exists
  if (profile.user_type === 'business') {
    const { data: businessProfile, error: bpError } = await supabase
      .from('business_profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (bpError || !businessProfile) {
      // Business profile not complete, redirect to register
      redirect('/register?userType=business')
    }
    redirect('/business')
  } else if (profile.user_type === 'college_society') {
    const { data: societyProfile, error: spError } = await supabase
      .from('college_society_profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (spError || !societyProfile) {
      // Society profile not complete, redirect to register
      redirect('/register?userType=college_society')
    }
    redirect('/society/marketplace')
  }

  // Fallback (should never render)
  return null
}