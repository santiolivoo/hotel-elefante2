import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Admin routes
        if (pathname.startsWith('/admin')) {
          return token?.role === 'ADMIN'
        }
        
        // Operator routes
        if (pathname.startsWith('/operador')) {
          return token?.role === 'OPERATOR' || token?.role === 'ADMIN'
        }
        
        // Protected user routes
        // NOTE: /reservar handles its own auth redirects in the component
        if (pathname.startsWith('/mis-reservas') || 
            pathname.startsWith('/perfil')) {
          return !!token
        }
        
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/operador/:path*',
    // '/reservar' removed - handles its own auth
    '/mis-reservas',
    '/perfil'
  ]
}
