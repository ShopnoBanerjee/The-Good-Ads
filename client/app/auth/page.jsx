'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from "next/image"
import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons"
import { authClient } from "@/lib/auth-client"

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('signin')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const [signUpForm, setSignUpForm] = useState({
    name: '',
    email: '',
    password: ''
  })

  const [signInForm, setSignInForm] = useState({
    email: '',
    password: '',
    rememberMe: true
  })

  const handleSignUp = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await authClient.signUp.email({
        email: signUpForm.email,
        password: signUpForm.password,
        name: signUpForm.name,
        callbackURL: "/dashboard"
      }, {
        onRequest: () => {
          setIsLoading(true)
        },
        onSuccess: () => {
          router.push("/dashboard")
        },
        onError: (ctx) => {
          alert(ctx.error.message)
          setIsLoading(false)
        },
      })

      if (error) {
        alert(error.message)
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await authClient.signIn.email({
        email: signInForm.email,
        password: signInForm.password,
        callbackURL: "/dashboard",
        rememberMe: signInForm.rememberMe
      }, {
        onRequest: () => {
          setIsLoading(true)
        },
        onSuccess: () => {
          router.push("/dashboard")
        },
        onError: (ctx) => {
          alert(ctx.error.message)
          setIsLoading(false)
        },
      })

      if (error) {
        alert(error.message)
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard"
      })
    } catch (error) {
      alert(error.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen grid grid-cols-12 overflow-hidden">
      {/* Left Illus */}
      <div className="col-span-2 lg:col-span-3 -ml-3 hidden md:flex items-center justify-center bg-white">
        <Image
          src="/illustrations/login illus1.png"
          alt="img1"
          width={466}
          height={600}
        />
      </div>

      {/* Auth Form */}
      <div className="col-span-12 md:col-span-8 lg:col-span-6 flex flex-col items-center justify-center px-6 py-10 bg-white">
        <div className="overflow-hidden mb-2">
          <Image
            src="/logo/our-logo.png"
            alt="Logo"
            width={140}
            height={85}
            className="object-contain"
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('signin')}
            className={`px-6 py-2 rounded-md font-outfit font-medium transition-colors ${
              activeTab === 'signin'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`px-6 py-2 rounded-md font-outfit font-medium transition-colors ${
              activeTab === 'signup'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Sign Up
          </button>
        </div>

        {activeTab === 'signin' ? (
          <>
            <h1 className="text-2xl font-semibold font-outfit text-black mb-2">Log In</h1>
            <p className="mb-6 text-base font-outfit text-[#00000066]">
              Don't have an account yet?{" "}
              <button 
                onClick={() => setActiveTab('signup')}
                className="text-[#009dc9] font-outfit hover:underline"
              >
                Sign up
              </button>
            </p>

            <form className="w-full max-w-md space-y-4" onSubmit={handleSignIn}>
              <div className="flex flex-col space-y-1">
                <label className="text-black font-outfit text-sm">Email</label>
                <input
                  type="email"
                  placeholder="user@goodads.in"
                  value={signInForm.email}
                  onChange={(e) => setSignInForm({ ...signInForm, email: e.target.value })}
                  className="w-full border border-[#dcdcdc] rounded-xl px-4 py-2 text-black"
                  required
                />
              </div>
              
              <div className="flex flex-col space-y-1">
                <label className="text-black font-outfit text-sm">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={signInForm.password}
                    onChange={(e) => setSignInForm({ ...signInForm, password: e.target.value })}
                    className="w-full border border-[#dcdcdc] rounded-xl px-4 py-2 text-black pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={signInForm.rememberMe}
                  onChange={(e) => setSignInForm({ ...signInForm, rememberMe: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="remember-me" className="text-sm font-outfit text-black">
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#11aad4] border border-[#11aad4] text-white py-2 rounded-[40px] hover:text-[#11aad4] hover:bg-white hover:border hover:border-[#11aad4] font-outfit font-semibold transition duration-300"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>

              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-4 text-sm text-gray-500 font-outfit">or</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full bg-white border border-gray-300 text-gray-700 py-2 rounded-[40px] hover:bg-gray-50 font-outfit font-medium transition duration-300 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
              
              <Link
                href="/"
                className="block mt-2 w-full text-center text-base font-outfit text-[#11aad4] bg-white border border-[#11aad4] py-2 rounded-[40px] hover:bg-[#11aad4] hover:text-white transition duration-300"
              >
                Back to Home
              </Link>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold font-outfit text-black mb-2">Sign Up</h1>
            <p className="mb-6 text-base font-outfit text-[#00000066]">
              Already have an account?{" "}
              <button 
                onClick={() => setActiveTab('signin')}
                className="text-[#009dc9] font-outfit hover:underline"
              >
                Sign in
              </button>
            </p>

            <form className="w-full max-w-md space-y-4" onSubmit={handleSignUp}>
              <div className="flex flex-col space-y-1">
                <label className="text-black font-outfit text-sm">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={signUpForm.name}
                  onChange={(e) => setSignUpForm({ ...signUpForm, name: e.target.value })}
                  className="w-full border border-[#dcdcdc] rounded-xl px-4 py-2 text-black"
                  required
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-black font-outfit text-sm">Email</label>
                <input
                  type="email"
                  placeholder="user@goodads.in"
                  value={signUpForm.email}
                  onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                  className="w-full border border-[#dcdcdc] rounded-xl px-4 py-2 text-black"
                  required
                />
              </div>
              
              <div className="flex flex-col space-y-1">
                <label className="text-black font-outfit text-sm">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password (min 8 characters)"
                    value={signUpForm.password}
                    onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                    className="w-full border border-[#dcdcdc] rounded-xl px-4 py-2 text-black pr-10"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#11aad4] border border-[#11aad4] text-white py-2 rounded-[40px] hover:text-[#11aad4] hover:bg-white hover:border hover:border-[#11aad4] font-outfit font-semibold transition duration-300"
              >
                {isLoading ? "Creating account..." : "Sign Up"}
              </button>

              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-4 text-sm text-gray-500 font-outfit">or</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full bg-white border border-gray-300 text-gray-700 py-2 rounded-[40px] hover:bg-gray-50 font-outfit font-medium transition duration-300 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              <Link
                href="/"
                className="block mt-2 w-full text-center text-base font-outfit text-[#11aad4] bg-white border border-[#11aad4] py-2 rounded-[40px] hover:bg-[#11aad4] hover:text-white transition duration-300"
              >
                Back to Home
              </Link>
            </form>
          </>
        )}
      </div>

      {/* Right Illus */}
      <div className="col-span-2 lg:col-span-3 hidden md:flex items-center justify-center bg-white">
        <Image
          src="/illustrations/login illus2.png"
          alt="img2"
          width={1250}
          height={100}
          className="absolute top-0 right-0 z-50 pointer-events-none"
          priority
        />
      </div>
    </div>
  )
}
