'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from "next/image"
import Link from "next/link"
import { z } from 'zod'
import { useActionState } from 'react'
import { useTheme } from 'next-themes'
import { signInWithOtpAction, signUpWithOtpAction } from './actions'
import Header from '@/components/header'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, AlertCircle, Loader2, Mail, Building2, Users } from "lucide-react"

// Types remain the same...
interface SignUpForm {
  email: string;
  userType: 'business' | 'college_society';
}

interface SignInForm {
  email: string;
}

interface FormErrors {
  email?: string;
}

interface ActionState {
  success?: boolean;
  error?: string;
}

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
})

function AuthPageContent() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'signup' | 'signin'>('signup');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();

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

  const handleSignUpEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSignUpForm({ ...signUpForm, email: e.target.value });
  };

  const handleSignInEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSignInForm({ ...signInForm, email: e.target.value });
  };

  const handleUserTypeChange = (userType: 'business' | 'college_society'): void => {
    setSignUpForm({ ...signUpForm, userType });
  };

  const handleTabSwitch = (tab: 'signup' | 'signin'): void => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-background font-outfit">
      {/* Header Component - Higher z-index */}
      <div className="relative z-50">
        <Header />
      </div>
      
      {/* Left Illustration - Behind header, starts after header */}
      <div className="hidden xl:block fixed left-0 top-20 bottom-0 w-80 pointer-events-none z-10">
        <div className="h-full flex items-center justify-center p-8">
          <div className="relative w-full max-w-sm">
            <Image 
              src="/illustrations/login illus1.png" 
              alt="Login illustration" 
              width={466} 
              height={600} 
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </div>

      {/* Right Illustration - Behind header, starts after header */}
      <div className="hidden xl:block fixed right-0 top-20 bottom-0 w-80 pointer-events-none z-10">
        <div className="h-full flex items-center justify-center p-8">
          <div className="relative w-full max-w-sm">
            <Image 
              src="/illustrations/login illus2.png" 
              alt="Login illustration" 
              width={1250} 
              height={600} 
              className="w-full h-auto object-contain" 
              priority 
            />
          </div>
        </div>
      </div>
      
      {/* Main Content - Centered, higher z-index than illustrations */}
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 xl:px-80 relative z-20">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border border-border bg-card">
            <CardContent className="p-8">
              {/* Logo - Only visible on mobile/tablet */}
              <div className="xl:hidden text-center mb-6">
                <Image 
                  src="/logo/our-logo.png" 
                  alt="Logo" 
                  width={120} 
                  height={75} 
                  className="object-contain mx-auto" 
                />
              </div>

              {activeTab === 'signin' ? (
                <>
                  {/* Header */}
                  <div className="text-center mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 font-outfit">
                      Log In
                    </h1>
                    <p className="text-muted-foreground text-sm font-outfit">
                      Don't have an account yet?{' '}
                      <button 
                        onClick={() => handleTabSwitch('signup')} 
                        className="text-primary hover:text-primary/80 underline font-outfit transition-colors duration-300"
                      >
                        Sign up
                      </button>
                    </p>
                  </div>

                  {/* Success/Error Messages */}
                  {signInState?.success && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl animate-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-medium font-outfit">Magic link sent! Check your email.</span>
                      </div>
                    </div>
                  )}
                  
                  {signInState?.error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm font-outfit">{signInState.error}</span>
                      </div>
                    </div>
                  )}

                  <form className="space-y-6" action={signInAction}>
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-sm font-medium text-foreground flex items-center gap-2 font-outfit">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        Email
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="signin-email"
                          type="email"
                          name="email"
                          value={signInForm.email}
                          onChange={handleSignInEmailChange}
                          placeholder="Enter your email"
                          className="h-11 font-outfit bg-background border-input rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:ring-offset-0 placeholder:text-muted-foreground transition-all duration-300"
                          required
                        />
                        <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                      {signInErrors.email && (
                        <div className="flex items-center gap-1 text-xs text-red-500 animate-in slide-in-from-top-1 duration-200 font-outfit">
                          <AlertCircle className="w-3 h-3" />
                          {signInErrors.email}
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium font-outfit rounded-[40px] transition-all duration-300 transform hover:scale-[1.02] mt-8"
                    >
                      Sign In
                    </Button>
                    
                    <Button 
                      asChild
                      variant="outline"
                      className="w-full h-12 bg-transparent hover:bg-primary border-2 border-primary hover:border-primary text-primary hover:text-primary-foreground font-medium font-outfit rounded-[40px] transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      <Link href="/">Back to Home</Link>
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  {/* Sign Up Form - Same structure as before */}
                  <div className="text-center mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 font-outfit">
                      Sign Up
                    </h1>
                    <p className="text-muted-foreground text-sm font-outfit">
                      Already have an account?{' '}
                      <button 
                        onClick={() => handleTabSwitch('signin')} 
                        className="text-primary hover:text-primary/80 underline font-outfit transition-colors duration-300"
                      >
                        Sign in
                      </button>
                    </p>
                  </div>

                  {signUpState?.success && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl animate-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-medium font-outfit">Magic link sent! Check your email.</span>
                      </div>
                    </div>
                  )}
                  
                  {signUpState?.error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm font-outfit">{signUpState.error}</span>
                      </div>
                    </div>
                  )}

                  <form className="space-y-6" action={signUpAction} noValidate>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground flex items-center gap-2 font-outfit">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        Account Type
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => handleUserTypeChange("business")}
                          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-outfit font-medium transition-all duration-300 border-2 ${
                            signUpForm.userType === "business" 
                              ? "bg-primary text-primary-foreground border-primary" 
                              : "bg-transparent text-muted-foreground border-border hover:border-primary hover:text-primary"
                          }`}
                        >
                          <Building2 className="w-4 h-4" />
                          Business
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUserTypeChange("college_society")}
                          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-outfit font-medium transition-all duration-300 border-2 ${
                            signUpForm.userType === "college_society" 
                              ? "bg-primary text-primary-foreground border-primary" 
                              : "bg-transparent text-muted-foreground border-border hover:border-primary hover:text-primary"
                          }`}
                        >
                          <Users className="w-4 h-4" />
                          College Society
                        </button>
                      </div>
                    </div>
                    
                    <input type="hidden" name="userType" value={signUpForm.userType} />
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-sm font-medium text-foreground flex items-center gap-2 font-outfit">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        Email
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="signup-email"
                          type="email"
                          name="email"
                          value={signUpForm.email}
                          onChange={handleSignUpEmailChange}
                          placeholder="Enter your email"
                          className="h-11 font-outfit bg-background border-input rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:ring-offset-0 placeholder:text-muted-foreground transition-all duration-300"
                          required
                        />
                        <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                      {signUpErrors.email && (
                        <div className="flex items-center gap-1 text-xs text-red-500 animate-in slide-in-from-top-1 duration-200 font-outfit">
                          <AlertCircle className="w-3 h-3" />
                          {signUpErrors.email}
                        </div>
                      )}
                    </div>
                    
                    {/* Commented out Sign Up button */}
                    {/*
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium font-outfit rounded-[40px] transition-all duration-300 transform hover:scale-[1.02] mt-8"
                    >
                      Sign Up
                    </Button>
                    */}
                    
                    {/* New Join Waitlist button */}
                    <Button 
                      asChild
                      className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium font-outfit rounded-[40px] transition-all duration-300 transform hover:scale-[1.02] mt-8"
                    >
                      <Link href="https://google.com" target="_blank" rel="noopener noreferrer">
                        Join Waitlist
                      </Link>
                    </Button>
                    
                    <Button 
                      asChild
                      variant="outline"
                      className="w-full h-12 bg-transparent hover:bg-primary border-2 border-primary hover:border-primary text-primary hover:text-primary-foreground font-medium font-outfit rounded-[40px] transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      <Link href="/">Back to Home</Link>
                    </Button>
                  </form>
                </>
              )}

              <div className="mt-8 text-center">
                <p className="text-xs text-muted-foreground leading-relaxed font-outfit">
                  By continuing, you agree to our{" "}
                  <a href="#" className="text-primary hover:text-primary/80 underline">Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" className="text-primary hover:text-primary/80 underline">Privacy Policy</a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-foreground" />
          <span className="text-foreground font-medium font-outfit">Loading...</span>
        </div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  )
}
