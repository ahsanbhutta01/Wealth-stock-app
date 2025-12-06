'use client'

import FooterLink from '@/components/forms/FooterLink'
import InputField from '@/components/forms/InputField'
import { Button } from '@/components/ui/button'
import { signInWithEmail } from '@/lib/actions/action'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

const SignIn = () => {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignInFormData>(
    {
      defaultValues: {
        email: "",
        password: ""
      },
      mode: "onBlur"
    }
  )

  async function onSubmit(data: SignInFormData) {
    try {
      const result = await signInWithEmail(data);
      if (result.success) return router.push('/')
    } catch (e) {
      console.error(e);
      toast.error('Sign up failed', {
        description: e instanceof Error ? e.message : "Failed to create account"
      })
    }
  }

  return (
    <>
      <h1 className="form-title">Welcome back</h1>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>

        <InputField
          name="email"
          label='Email'
          placeholder='Enter your email'
          register={register}
          error={errors.email}
          validation={{
            required: "Email is required",
            pattern: {
              value: /^\w+@\w+\.\w+$/,
              message: "Invalid email address"
            }
          }}
        />

        <InputField
          name="password"
          label="Password"
          type='password'
          placeholder="Enter your password"
          register={register}
          error={errors.password}
          validation={{ required: "Password is required", minLength: { value: 8, message: "At least 8 characters required" } }}
        />

        <Button type='submit' disabled={isSubmitting} className='yellow-btn w-full mt-5'>
          {isSubmitting ? "Signing In..." : "Sign In"}
        </Button>

        <FooterLink text="Don't have an account?" linkText='Sign Up' href='/sign-up' />
      </form>
    </>
  )
}

export default SignIn