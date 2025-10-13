'use client'

import { useState, Suspense } from 'react'
import Image from "next/image"
import Link from "next/link"
import { z } from 'zod'
import { useActionState } from 'react'
import { signInWithOtpAction, signUpWithOtpAction } from './actions'

// Zod schemas
const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  userType: z.enum(['business', 'college_society'], {
    errorMap: () => ({ message: 'Please select a user type' }),
  }),
})

// Types
interface SignUpForm {
  email: string;
  userType: 'business' | 'college_society';
}

interface SignInForm {
  email: string;
}

interface FormErrors {
  email?: string;
  userType?: string;
}

interface ActionState {
  success?: boolean;
  error?: string;
}

// Separate component that uses useSearchParams
function AuthPageContent() {
  const [isLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'signup' | 'signin'>('signup');

  const [signUpForm, setSignUpForm] = useState<SignUpForm>({ email: '', userType: 'business' });
  const [signInForm, setSignInForm] = useState<SignInForm>({ email: '' });
  const [signUpErrors, setSignUpErrors] = useState<FormErrors>({});
  const [signInErrors, setSignInErrors] = useState<FormErrors>({});

  const [signInState, signInAction] = useActionState<ActionState | null, FormData>(
    async (prevState: ActionState | null, formData: FormData): Promise<ActionState | null> => 
      await signInWithOtpAction(formData),
    null
  )
  
  const [signUpState, signUpAction] = useActionState<ActionState | null, FormData>(
    async (prevState: ActionState | null, formData: FormData): Promise<ActionState | null> => 
      await signUpWithOtpAction(formData),
    null
  )

  const validateSignIn = () => {
    const result = signInSchema.safeParse(signInForm);
    if (!result.success) {
      const errors: FormErrors = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'email') errors.email = err.message;
      });
      setSignInErrors(errors);
      return false;
    }
    setSignInErrors({});
    return true;
  };

  const validateSignUp = () => {
    const result = signUpSchema.safeParse(signUpForm);
    if (!result.success) {
      const errors: FormErrors = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'email') errors.email = err.message;
        if (err.path[0] === 'userType') errors.userType = err.message;
      });
      setSignUpErrors(errors);
      return false;
    }
    setSignUpErrors({});
    return true;
  };

  const handleSignUpEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSignUpForm({ ...signUpForm, email: e.target.value });
    // Clear error when user starts typing
    if (signUpErrors.email) {
      setSignUpErrors({ ...signUpErrors, email: undefined });
    }
  };

  const handleSignInEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSignInForm({ ...signInForm, email: e.target.value });
    // Clear error when user starts typing
    if (signInErrors.email) {
      setSignInErrors({ ...signInErrors, email: undefined });
    }
  };

  const handleUserTypeChange = (userType: 'business' | 'college_society'): void => {
    setSignUpForm({ ...signUpForm, userType });
  };

  const handleTabSwitch = (tab: 'signup' | 'signin'): void => {
    setActiveTab(tab);
  };

  // Normalize known Supabase security/rate-limit messages into friendly UX text
  const formatAuthError = (err?: unknown): string | null => {
    if (!err) return null
    const msg = typeof err === 'string' ? err : String(err)
    // Supabase returns: "For security purposes, you can only request this after X seconds."
    if (msg.includes('For security purposes, you can only request this after')) {
      return 'A magic link has already been sent. Please check your email or try again in a few minutes.'
    }
    return msg
  }

  return (
    <div className="relative min-h-screen grid grid-cols-12 overflow-hidden bg-white dark:bg-[#15325a] transition-colors duration-200 ease-in-out">
      <div className="col-span-2 lg:col-span-3 -ml-3 hidden md:flex items-center justify-center bg-white dark:bg-[#15325a]">
        <Image src="/illustrations/login illus1.png" alt="img1" width={466} height={600} />
      </div>

      <div className="col-span-12 md:col-span-8 lg:col-span-6 flex flex-col items-center justify-center px-6 py-10 bg-white dark:bg-[#15325a]">
        <div className="overflow-hidden mb-6">
          <Link href="/">
            <Image src="/logo/our-logo.png" alt="Logo" width={140} height={85} className="object-contain dark:brightness-0 dark:invert" />
          </Link>
        </div>

        {activeTab === 'signin' ? (
          <>
            <h1 className="text-2xl font-semibold font-outfit text-black dark:text-white mb-2">Log In</h1>
            <p className="mb-6 text-base font-outfit text-[#00000066] dark:text-gray-300">
              Don&apos;t have an account yet?{' '}
              <button onClick={() => handleTabSwitch('signup')} className="text-[#009dc9] font-outfit hover:underline">Sign up</button>
            </p>

            <form className="w-full max-w-md space-y-4" action={signInAction} onSubmit={(e) => { if (!validateSignIn()) e.preventDefault(); }}>
              <div className="flex flex-col space-y-2">
                <label className="text-black dark:text-white font-outfit text-sm font-medium">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={signInForm.email}
                  onChange={handleSignInEmailChange}
                  placeholder="Enter your email"
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-black dark:text-white bg-white dark:bg-[#1a2f4a] placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#11aad4]/20 focus:border-[#11aad4] transition-all duration-200"
                  required
                />
                {signInErrors.email && <p className="text-red-500 text-sm font-outfit">{signInErrors.email}</p>}
              </div>
              {signInState?.success && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl">
                  <p className="text-green-700 dark:text-green-300 text-sm font-outfit">Magic link sent! Check your email.</p>
                </div>
              )}
              {signInState?.error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl">
                  <p className="text-red-600 dark:text-red-300 text-sm font-outfit">{formatAuthError(signInState.error)}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="block mt-4 w-full text-center text-base font-outfit text-[#11aad4] bg-white dark:bg-[#1a2f4a] border-2 border-[#11aad4] py-3 rounded-xl hover:bg-[#11aad4] hover:text-white dark:hover:bg-[#11aad4] dark:hover:text-white transition-all duration-200 font-medium"
              >
                {isLoading ? 'Sending...' : 'Sign In'}
              </button>
              <Link
                href="/"
                className="block mt-4 w-full text-center text-base font-outfit text-[#11aad4] bg-white dark:bg-[#1a2f4a] border-2 border-[#11aad4] py-3 rounded-xl hover:bg-[#11aad4] hover:text-white dark:hover:bg-[#11aad4] dark:hover:text-white transition-all duration-200 font-medium"
              >
                Back to Home
              </Link>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold font-outfit text-black dark:text-white mb-2">Sign Up</h1>
            <p className="mb-6 text-base font-outfit text-[#00000066] dark:text-gray-300">
              Already have an account?{' '}
              <button onClick={() => handleTabSwitch('signin')} className="text-[#009dc9] font-outfit hover:underline">Sign in</button>
            </p>

            <form className="w-full max-w-md space-y-4" action={signUpAction} noValidate onSubmit={(e) => { if (!validateSignUp()) e.preventDefault(); }}>
              <div className="flex space-x-3 mb-6 p-1 bg-gray-100 dark:bg-[#1a2f4a] rounded-xl">
                <button
                  type="button"
                  onClick={() => handleUserTypeChange("business")}
                  className={`flex-1 px-4 py-3 rounded-lg font-outfit font-medium text-sm transition-all duration-200 ${
                    signUpForm.userType === "business"
                      ? "bg-white dark:bg-[#15325a] text-[#11aad4] shadow-sm border border-[#11aad4]/20 dark:border-[#11aad4]/30"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                >
                  Business
                </button>
                <button
                  type="button"
                  onClick={() => handleUserTypeChange("college_society")}
                  className={`flex-1 px-4 py-3 rounded-lg font-outfit font-medium text-sm transition-all duration-200 ${
                    signUpForm.userType === "college_society"
                      ? "bg-white dark:bg-[#15325a] text-[#11aad4] shadow-sm border border-[#11aad4]/20 dark:border-[#11aad4]/30"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                >
                  College Society
                </button>
              </div>
              <input type="hidden" name="userType" value={signUpForm.userType} />
              <div className="flex flex-col space-y-2">
                <label className="text-black dark:text-white font-outfit text-sm font-medium">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={signUpForm.email}
                  onChange={handleSignUpEmailChange}
                  placeholder="Enter your email"
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-black dark:text-white bg-white dark:bg-[#1a2f4a] placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#11aad4]/20 focus:border-[#11aad4] transition-all duration-200"
                  required
                />
                {signUpErrors.email && <p className="text-red-500 text-sm font-outfit">{signUpErrors.email}</p>}
              </div>
              {signUpState?.success && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl">
                  <p className="text-green-700 dark:text-green-300 text-sm font-outfit">Magic link sent! Check your email.</p>
                </div>
              )}
              {signUpState?.error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl">
                    <p className="text-red-600 dark:text-red-300 text-sm font-outfit">{formatAuthError(signUpState.error)}</p>
                  </div>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="block mt-4 w-full text-center text-base font-outfit text-[#11aad4] bg-white dark:bg-[#1a2f4a] border-2 border-[#11aad4] py-3 rounded-xl hover:bg-[#11aad4] hover:text-white dark:hover:bg-[#11aad4] dark:hover:text-white transition-all duration-200 font-medium"
              >
                {isLoading ? 'Sending...' : 'Sign Up'}
              </button>
              <Link
                href="/"
                className="block mt-4 w-full text-center text-base font-outfit text-[#11aad4] bg-white dark:bg-[#1a2f4a] border-2 border-[#11aad4] py-3 rounded-xl hover:bg-[#11aad4] hover:text-white dark:hover:bg-[#11aad4] dark:hover:text-white transition-all duration-200 font-medium"
              >
                Back to Home
              </Link>
            </form>
          </>
        )}
      </div>

      <div className="col-span-2 lg:col-span-3 hidden md:flex items-center justify-center bg-white dark:bg-[#15325a]">
        <Image src="/illustrations/login illus2.png" alt="img2" width={1250} height={100} className="absolute top-0 right-0 z-50 pointer-events-none" priority />
      </div>
    </div>
  )
}

// Main component that wraps the content in Suspense
export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#15325a]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-[#11aad4] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#11aad4] font-outfit">Loading...</p>
        </div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  )
} 