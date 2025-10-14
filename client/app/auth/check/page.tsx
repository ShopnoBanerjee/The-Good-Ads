import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function CheckPage() {

  const supabase = await createClient()

  // Get user session
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/auth')
  }

  // Get user session for API calls
  const { data: sessionData } = await supabase.auth.getSession()
  const accessToken = sessionData.session?.access_token

  if (!accessToken) {
    redirect('/auth')
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
      redirect('/auth')
    }
  }

  // Profile exists
  if (!profile.user_type) {
    redirect('/register')
  }

  // Validate user_type
  if (profile.user_type !== 'business' && profile.user_type !== 'college_society') {
    redirect('/error')
  }

  // Check if corresponding profile exists
  if (profile.user_type === 'business') {
    let businessProfile = null
    let apiError = false

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/business-profile`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })
      businessProfile = response.ok ? await response.json() : null
    } catch {
      apiError = true
    }

    if (apiError || !businessProfile) {
      redirect('/register?userType=business')
    }

    redirect('/business')
  } else if (profile.user_type === 'college_society') {
    let societyProfile = null
    let apiError = false

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/society-profile`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })
      societyProfile = response.ok ? await response.json() : null
    } catch {
      apiError = true
    }

    if (apiError || !societyProfile) {
      redirect('/register?userType=college_society')
    }

    redirect('/society')
  }

  // Fallback (should never render)
  return null
}