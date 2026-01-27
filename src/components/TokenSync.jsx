'use client'

// Third-party Imports
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

/**
 * Component to sync NextAuth session token to localStorage
 * This ensures the backend token is available for API calls
 */
const TokenSync = () => {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'loading') {
      // Still loading, don't do anything yet
      return
    }

    if (session?.backendToken) {
      // Store backend token in localStorage for API calls
      localStorage.setItem('token', session.backendToken)
      console.log('Token synced to localStorage')
    } else {
      // Clear token if session is lost
      localStorage.removeItem('token')
      console.log('Token removed from localStorage (no session)')
    }
  }, [session?.backendToken, status])

  return null // This component doesn't render anything
}

export default TokenSync

