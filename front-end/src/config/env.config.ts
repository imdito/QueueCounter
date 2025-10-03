export const env = {
  APP: {
    API_KEY: process.env.NEXT_PUBLIC_API_KEY,
    API_URL: process.env.NEXT_PUBLIC_API_URL,
    COOKIES: {
      MAX_AGE_IN_DAYS: +(process.env.NEXT_PUBLIC_MAX_AGE_COOKIES_IN_DAYS || 1),
    },
  },
}
