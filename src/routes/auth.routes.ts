export const authRoutes = {
  login: {
    method: 'POST',
    path: '/auth/login',
    description: 'Authenticate user and return JWT token',
  },

  logout: {
    method: 'POST',
    path: '/auth/logout',
    description: 'Logout user (client should remove token)',
  },

  forgotPassword: {
    method: 'POST',
    path: '/auth/forgot-password',
    description: 'Request password reset OTP',
  },

  verifyEmail: {
    method: 'POST',
    path: '/auth/verify-email',
    description: 'Verify email address using OTP',
  },
};

export const allRoutes = {
  auth: authRoutes,
};

