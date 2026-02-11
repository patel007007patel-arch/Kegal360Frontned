// Third-party Imports
import CredentialProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions = {
  // No adapter needed - using JWT strategy with separate backend API

  // ** Configure one or more authentication providers
  // ** Please refer to https://next-auth.js.org/configuration/options#providers for more `providers` options
  providers: [
    CredentialProvider({
      // ** The name to display on the sign in form (e.g. 'Sign in with...')
      // ** For more details on Credentials Provider, visit https://next-auth.js.org/providers/credentials
      name: 'Credentials',
      type: 'credentials',

      /*
       * As we are using our own Sign-in page, we do not need to change
       * username or password attributes manually in following credentials object.
       */
      credentials: {},
      async authorize(credentials) {
        /*
         * You need to provide your own logic here that takes the credentials submitted and returns either
         * an object representing a user or value that is false/null if the credentials are invalid.
         * For e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
         * You can also use the `req` object to obtain additional parameters (i.e., the request IP address)
         */
        const { email, password } = credentials

        if (!email || !password) {
          throw new Error(JSON.stringify({
            success: false,
            message: 'Email and password are required'
          }))
        }

        try {
          // Get API URL from environment variable
          // Backend is at http://localhost:5000 and routes are at /api/auth/login
          let apiUrl = process.env.API_URL || 'http://localhost:5000'
          
          // Ensure API_URL doesn't have trailing slash
          apiUrl = apiUrl.replace(/\/$/, '')
          
          if (!apiUrl) {
            throw new Error(JSON.stringify({
              success: false,
              message: 'API URL is not configured'
            }))
          }

          // ** Login API Call to match the user credentials and receive user data in response along with his role
          // If API_URL already ends with /api (e.g. https://backend.onrender.com/api), use /auth/login; else use /api/auth/login
          const loginUrl = apiUrl.endsWith('/api') ? `${apiUrl}/auth/login` : `${apiUrl}/api/auth/login`
          
          // Ensure we're calling the backend, not the frontend API route
          if (loginUrl.includes('localhost:3000') || loginUrl.startsWith('/api/')) {
            throw new Error(JSON.stringify({
              success: false,
              message: 'Invalid API URL configuration. Must point to backend server.'
            }))
          }
          
          // Log the API call for debugging
          console.log('🔐 Calling backend API:', loginUrl)
          console.log('📧 Email:', email)
          
          let res
          try {
            res = await fetch(loginUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ email, password })
            })
            console.log('✅ Backend response status:', res.status)
          } catch (fetchError) {
            // Network error - backend might not be running
            console.error('❌ Backend fetch error:', fetchError)
            throw new Error(JSON.stringify({
              success: false,
              message: `Cannot connect to backend server at ${loginUrl}. Please ensure the backend is running on ${apiUrl}. Error: ${fetchError.message}`
            }))
          }

          // Check if response is ok before parsing JSON
          let responseData
          try {
            responseData = await res.json()
            console.log('📦 Backend response data:', JSON.stringify(responseData).substring(0, 200))
          } catch (jsonError) {
            // If we can't parse JSON, the backend might be returning HTML or an error page
            console.error('❌ JSON parse error:', jsonError)
            const textResponse = await res.text()
            console.error('📄 Response text:', textResponse.substring(0, 500))
            throw new Error(JSON.stringify({
              success: false,
              message: `Backend server returned invalid response. Status: ${res.status}. Please check if the backend is running correctly.`
            }))
          }

          if (res.status === 401) {
            console.log('⚠️ Backend returned 401 - Invalid credentials')
            throw new Error(JSON.stringify({
              success: false,
              message: responseData.message || 'Invalid email or password'
            }))
          }

          if (res.status === 404) {
            throw new Error(JSON.stringify({
              success: false,
              message: 'Login endpoint not found. Please check backend routes.'
            }))
          }

          if (res.status === 200) {
            if (responseData.success && responseData.data) {
              /*
               * Extract user data and token from backend response
               * Backend returns: { success: true, data: { user: {...}, token: "..." } }
               */
              const { user, token } = responseData.data

              if (!user || !token) {
                console.error('❌ Missing user or token in response')
                throw new Error(JSON.stringify({
                  success: false,
                  message: 'Invalid response format from server'
                }))
              }

              console.log('✅ Login successful for user:', user.email)
              
              // Return user object with token for NextAuth
              // This will be available in the jwt() callback
              return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                onboardingCompleted: user.onboardingCompleted,
                subscription: user.subscription,
                token: token // Store backend JWT token
              }
            } else {
              console.error('❌ Backend returned 200 but success=false or missing data')
              throw new Error(JSON.stringify({
                success: false,
                message: responseData.message || 'Invalid response from server'
              }))
            }
          }

          // If we get here, the response was not successful (not 200)
          console.error(`❌ Backend returned status ${res.status}`)
          throw new Error(JSON.stringify({
            success: false,
            message: responseData.message || `Login failed with status ${res.status}`
          }))
        } catch (e) {
          // If error is already a JSON string, re-throw it
          if (e.message && e.message.startsWith('{')) {
            throw e
          }
          // Otherwise, wrap it in a proper error format
          throw new Error(JSON.stringify({
            success: false,
            message: e.message || 'An error occurred during login'
          }))
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })

    // ** ...add more providers here
  ],

  // ** Please refer to https://next-auth.js.org/configuration/options#session for more `session` options
  session: {
    /*
     * Choose how you want to save the user session.
     * The default is `jwt`, an encrypted JWT (JWE) stored in the session cookie.
     * If you use an `adapter` however, NextAuth default it to `database` instead.
     * You can still force a JWT session by explicitly defining `jwt`.
     * When using `database`, the session cookie will only contain a `sessionToken` value,
     * which is used to look up the session in the database.
     * If you use a custom credentials provider, user accounts will not be persisted in a database by NextAuth.js (even if one is configured).
     * The option to use JSON Web Tokens for session tokens must be enabled to use a custom credentials provider.
     */
    strategy: 'jwt',

    // ** Seconds - How long until an idle session expires and is no longer valid
    maxAge: 30 * 24 * 60 * 60 // ** 30 days
  },

  // ** Please refer to https://next-auth.js.org/configuration/options#pages for more `pages` options
  pages: {
    signIn: '/login'
  },

  // ** Please refer to https://next-auth.js.org/configuration/options#callbacks for more `callbacks` options
  callbacks: {
    /*
     * While using `jwt` as a strategy, `jwt()` callback will be called before
     * the `session()` callback. So we have to add custom parameters in `token`
     * via `jwt()` callback to make them accessible in the `session()` callback
     */
    async jwt({ token, user }) {
      if (user) {
        /*
         * For adding custom parameters to user in session, we first need to add those parameters
         * in token which then will be available in the `session()` callback
         */
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = user.role
        token.onboardingCompleted = user.onboardingCompleted
        token.subscription = user.subscription
        token.backendToken = user.token // Store backend JWT token
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        // ** Add custom params to user in session which are added in `jwt()` callback via `token` parameter
        session.user.id = token.id
        session.user.email = token.email
        session.user.name = token.name
        session.user.role = token.role
        session.user.onboardingCompleted = token.onboardingCompleted
        session.user.subscription = token.subscription
        session.backendToken = token.backendToken // Backend JWT token for API calls
      }

      return session
    }
  }
}
