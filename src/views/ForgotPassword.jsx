'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import DirectionalIcon from '@components/DirectionalIcon'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { authAPI } from '@/utils/api'

const ForgotPasswordV2 = ({ mode }) => {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [step, setStep] = useState(1) // 1: request OTP, 2: enter OTP + new password
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Vars
  const darkImg = '/images/pages/auth-v2-mask-4-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-4-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-forgot-password-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-forgot-password-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-forgot-password-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-forgot-password-light-border.png'

  // Hooks
  const { settings } = useSettings()
  const { lang: locale } = useParams()
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  const handleRequestOtp = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setError('Email is required')
      return
    }
    setLoading(true)
    try {
      await authAPI.forgotPassword(trimmedEmail)
      setSuccess('If an account exists with this email, you will receive an OTP to reset your password.')
      setStep(2)
    } catch (err) {
      setError(err.message || 'Failed to send reset instructions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    const trimmedOtp = String(otp).trim()
    const trimmedNew = newPassword.trim()
    const trimmedConfirm = confirmPassword.trim()
    if (!trimmedOtp) {
      setError('OTP is required')
      return
    }
    if (!trimmedNew) {
      setError('New password is required')
      return
    }
    if (trimmedNew.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (trimmedNew !== trimmedConfirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await authAPI.resetPassword({
        email: email.trim().toLowerCase(),
        otp: trimmedOtp,
        newPassword: trimmedNew
      })
      setSuccess('Password has been reset successfully. You can log in with your new password.')
      setStep(3)
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex items-center justify-center bs-full flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <div className='pli-6 max-lg:mbs-40 lg:mbe-24'>
          <img
            src={characterIllustration}
            alt='character-illustration'
            className='max-bs-[677px] max-is-full bs-auto'
          />
        </div>
        <img src={authBackground} className='absolute bottom-[4%] z-[-1] is-full max-md:hidden' />
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <Link
          href={getLocalizedUrl('/', locale)}
          className='absolute block-start-5 sm:block-start-[38px] inline-start-6 sm:inline-start-[38px]'
        >
          <Logo />
        </Link>
        <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-11 sm:mbs-14 md:mbs-0'>
          <div>
            <Typography variant='h4'>Forgot Password 🔒</Typography>
            <Typography className='mbs-1'>
              {step === 1 && "Enter your email and we'll send you an OTP to reset your password"}
              {step === 2 && 'Enter the OTP sent to your email and your new password'}
              {step === 3 && 'All set! You can sign in with your new password.'}
            </Typography>
          </div>

          {error && (
            <Alert severity='error' onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity='success' onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          {step === 1 && (
            <form noValidate autoComplete='off' onSubmit={handleRequestOtp} className='flex flex-col gap-5'>
              <TextField
                autoFocus
                fullWidth
                label='Email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <Button fullWidth variant='contained' type='submit' disabled={loading}>
                {loading ? 'Sending…' : 'Send OTP'}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form noValidate autoComplete='off' onSubmit={handleResetPassword} className='flex flex-col gap-5'>
              <TextField
                autoFocus
                fullWidth
                label='OTP (6 digits)'
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={loading}
                placeholder='Enter the code from email'
              />
              <TextField
                fullWidth
                label='New password'
                type='password'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                helperText='At least 6 characters'
              />
              <TextField
                fullWidth
                label='Confirm new password'
                type='password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              <Button fullWidth variant='contained' type='submit' disabled={loading}>
                {loading ? 'Resetting…' : 'Reset password'}
              </Button>
            </form>
          )}

          {step === 3 && (
            <Button
              fullWidth
              variant='contained'
              component={Link}
              href={getLocalizedUrl('/login', locale)}
            >
              Back to Login
            </Button>
          )}

          <Typography className='flex justify-center items-center' color='primary.main'>
            <Link href={getLocalizedUrl('/login', locale)} className='flex items-center gap-1.5'>
              <DirectionalIcon
                ltrIconClass='ri-arrow-left-s-line'
                rtlIconClass='ri-arrow-right-s-line'
                className='text-xl'
              />
              <span>Back to Login</span>
            </Link>
          </Typography>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordV2
