'use client'

// Third-party Imports
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

/**
 * Custom hook to ensure auth token is available before making API calls
 * Returns the token and loading state
 */
export const useAuthToken = () => {
  const { data: session, status } = useSession()
  const [tokenReady, setTokenReady] = useState(false)

  useEffect(() => {
    if (status === 'loading') {
      setTokenReady(false)
      return
    }

    if (session?.backendToken) {
      // Ensure token is in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', session.backendToken)
        setTokenReady(true)
      }
    } else {
      // No session, clear token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        setTokenReady(false)
      }
    }
  }, [session?.backendToken, status])

  return {
    token: session?.backendToken,
    isReady: tokenReady && status !== 'loading',
    isLoading: status === 'loading'
  }
}

