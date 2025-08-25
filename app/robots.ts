import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://ssemtle.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/landing',
          '/signin',
          '/signup',
          '/signup/students',
          '/signup/teacher',
          '/practice',
          '/practice-category',
          '/unit',
          '/unit-exam',
          '/error-note',
        ],
        disallow: [
          '/api/*',
          '/admin/*',
          '/mypage/*',
          '/teacher/*',
          '/test/*',
          '/workbook/*',
          '/_next/',
          '/private/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
