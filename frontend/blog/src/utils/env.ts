const env = {
  apiUrl: import.meta.env.VITE_API_URL || '',
  env: import.meta.env.VITE_ENV || 'development',
  appName: import.meta.env.VITE_APP_NAME || 'My Blog',
  isDev: import.meta.env.VITE_ENV === 'development',
  isProd: import.meta.env.VITE_ENV === 'production',
};

export default env;