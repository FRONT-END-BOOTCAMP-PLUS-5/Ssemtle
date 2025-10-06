import { MetadataRoute } from 'next';
import { getBaseUrl } from '@/libs/metadata';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

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
