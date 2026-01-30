// Next Imports
import { redirect } from 'next/navigation'

// Third-party Imports
import { getServerSession } from 'next-auth'

// Config Imports
import themeConfig from '@configs/themeConfig'
import { authOptions } from '@/libs/auth'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

const GuestOnlyRoute = async ({ children, lang }) => {
  let session = null
  try {
    session = await getServerSession(authOptions)
  } catch (err) {
    // Invalid/old JWT cookie (e.g. NEXTAUTH_SECRET changed) → treat as guest
    session = null
  }

  if (session) {
    redirect(getLocalizedUrl(themeConfig.homePageUrl, lang))
  }

  return <>{children}</>
}

export default GuestOnlyRoute
