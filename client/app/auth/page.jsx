'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from "next/image"
import Link from "next/link"
import { z } from 'zod'
import { useActionState } from 'react'
import { signInWithOtpAction, signUpWithOtpAction } from './actions'

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signup');
  const router = useRouter();
  const searchParams = useSearchParams();

  const [signUpForm, setSignUpForm] = useState({ email: '', userType: 'business' });
  const [signInForm, setSignInForm] = useState({ email: '' });
  const [signUpErrors, setSignUpErrors] = useState({});
  const [signInErrors, setSignInErrors] = useState({});

  const [signInState, signInAction] = useActionState(
    async (prevState, formData) => await signInWithOtpAction(formData),
    null
  )
  const [signUpState, signUpAction] = useActionState(
    async (prevState, formData) => await signUpWithOtpAction(formData),
    null
  )


  return (
    <div className="relative min-h-screen grid grid-cols-12 overflow-hidden">
      <div className="col-span-2 lg:col-span-3 -ml-3 hidden md:flex items-center justify-center bg-white">
        <Image src="/illustrations/login illus1.png" alt="img1" width={466} height={600} />
      </div>

      <div className="col-span-12 md:col-span-8 lg:col-span-6 flex flex-col items-center justify-center px-6 py-10 bg-white">
        <div className="overflow-hidden mb-6">
          <Image src="/logo/our-logo.png" alt="Logo" width={140} height={85} className="object-contain" />
        </div>

        {activeTab === 'signin' ? (
          <>
            <h1 className="text-2xl font-semibold font-outfit text-black mb-2">Log In</h1>
            <p className="mb-6 text-base font-outfit text-[#00000066]">
              Don't have an account yet?{' '}
              <button onClick={() => setActiveTab('signup')} className="text-[#009dc9] font-outfit hover:underline">Sign up</button>
            </p>

            <form className="w-full max-w-md space-y-4" action={signInAction}>
              <div className="flex flex-col space-y-1">
                <label className="text-black font-outfit text-sm">Email</label>
                <input
                  type="email"
                  name="email"
                  value={signInForm.email}
                  onChange={(e) => setSignInForm({ ...signInForm, email: e.target.value })}
                  className="w-full border border-[#dcdcdc] rounded-xl px-4 py-2 text-black"
                  required
                />
                {signInErrors.email && <p className="text-red-500 text-sm">{signInErrors.email}</p>}
              </div>
              {signInState?.success && <p className="text-green-600">Magic link sent! Check your email.</p>}
              {signInState?.error && <p className="text-red-600">{signInState.error}</p>}
              <button type="submit" className="w-full bg-[#11aad4] border border-[#11aad4] text-white py-2 rounded-[40px] hover:text-[#11aad4] hover:bg-white hover:border hover:border-[#11aad4] font-outfit font-semibold transition duration-300">
                Sign In
              </button>
              <Link href="/" className="block mt-2 w-full text-center text-base font-outfit text-[#11aad4] bg-white border border-[#11aad4] py-2 rounded-[40px] hover:bg-[#11aad4] hover:text-white transition duration-300">Back to Home</Link>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold font-outfit text-black mb-2">Sign Up</h1>
            <p className="mb-6 text-base font-outfit text-[#00000066]">
              Already have an account?{' '}
              <button onClick={() => setActiveTab('signin')} className="text-[#009dc9] font-outfit hover:underline">Sign in</button>
            </p>

            <form className="w-full max-w-md space-y-4" action={signUpAction} noValidate>
              <div className="flex space-x-2 mb-4">
                <button
                  type="button"
                  onClick={() => setSignUpForm({ ...signUpForm, userType: "business" })}
                  className={`px-4 py-2 rounded ${signUpForm.userType === "business" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                >
                  Business
                </button>
                <button
                  type="button"
                  onClick={() => setSignUpForm({ ...signUpForm, userType: "college_society" })}
                  className={`px-4 py-2 rounded ${signUpForm.userType === "college_society" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                >
                  College Society
                </button>
              </div>
              <input type="hidden" name="userType" value={signUpForm.userType} />
              <div className="flex flex-col space-y-1">
                <label className="text-black font-outfit text-sm">Email</label>
                <input
                  type="email"
                  name="email"
                  value={signUpForm.email}
                  onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                  className="w-full border border-[#dcdcdc] rounded-xl px-4 py-2 text-black"
                  required
                />
                {signUpErrors.email && <p className="text-red-500 text-sm">{signUpErrors.email}</p>}
              </div>
              {signUpState?.success && <p className="text-green-600">Magic link sent! Check your email.</p>}
              {signUpState?.error && <p className="text-red-600">{signUpState.error}</p>}
              <button type="submit" className="w-full bg-[#11aad4] border border-[#11aad4] text-white py-2 rounded-[40px] hover:text-[#11aad4] hover:bg-white hover:border hover:border-[#11aad4] font-outfit font-semibold transition duration-300">
                Sign Up
              </button>
              <Link href="/" className="block mt-2 w-full text-center text-base font-outfit text-[#11aad4] bg-white border border-[#11aad4] py-2 rounded-[40px] hover:bg-[#11aad4] hover:text-white transition duration-300">Back to Home</Link>
            </form>
          </>
        )}
      </div>

      <div className="col-span-2 lg:col-span-3 hidden md:flex items-center justify-center bg-white">
        <Image src="/illustrations/login illus2.png" alt="img2" width={1250} height={100} className="absolute top-0 right-0 z-50 pointer-events-none" priority />
      </div>
    </div>
  )
}
