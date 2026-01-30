// Third-party Imports
import { getServerSession } from 'next-auth'

// Component Imports
import AuthRedirect from '@/components/AuthRedirect'

// Config Imports
import { authOptions } from '@/libs/auth'

export default async function AuthGuard({ children, locale }) {
  let session = null
  try {
    session = await getServerSession(authOptions)
  } catch (err) {
    // Invalid/old JWT cookie (e.g. NEXTAUTH_SECRET changed) → treat as not logged in
    session = null
  }

  return <>{session ? children : <AuthRedirect lang={locale} />}</>
}
