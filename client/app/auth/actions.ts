'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function signInWithOtpAction(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email')
  
  if (typeof email !== 'string' || !email) {
    return { error: 'Email is required' }
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/check`,
    },
  })

  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function signUpWithOtpAction(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email')
  const userType = formData.get('userType')
  
  if (typeof email !== 'string' || !email) {
    return { error: 'Email is required' }
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/register?userType=${userType ?? ''}`,
    },
  })

  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/', 'layout')
  return { success: true }
}
