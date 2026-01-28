/** @type {import('next').NextConfig} */
// Backend origin for rewrites (e.g. http://localhost:5000). Do not include /api.
const backendOrigin = process.env.BACKEND_URL || 'http://localhost:5000';

const nextConfig = {
    basePath: process.env.BASEPATH,
    // Proxy /api/* to backend, but keep /api/auth for NextAuth (session, signin, etc.) on Next.js
    rewrites: async () => [
        { source: '/api/auth', destination: '/api/auth' },
        { source: '/api/auth/:path*', destination: '/api/auth/:path*' },
        { source: '/api/:path*', destination: `${backendOrigin}/api/:path*` }
    ],
    redirects: async () => {
        return [
            {
                source: '/',
                destination: '/en/admin/dashboard',
                permanent: false,
                locale: false
            },
            {
                source: '/:lang(en|fr|ar)',
                destination: '/:lang/admin/dashboard',
                permanent: false,
                locale: false
            },
            {
                source: '/:path((?!en|fr|ar|front-pages|images|api|favicon.ico).*)*',
                destination: '/en/:path*',
                permanent: false,
                locale: false
            }
        ];
    }
};
export default nextConfig;
