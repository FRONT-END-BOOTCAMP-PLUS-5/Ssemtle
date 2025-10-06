import type { Metadata } from 'next';

export const SITE_CONFIG = {
  name: 'SSemtle',
  title: 'SSemtle - 기초학력의 수학',
  description:
    '기초학력 향상을 위한 AI 기반 학습 플랫폼. 개인 맞춤형 수학 학습으로 학생들의 기초 실력을 체계적으로 향상시킵니다.',
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ssemtle.com',
  keywords: [
    '기초학력',
    '수학',
    '학습',
    'AI',
    '교육',
    '개인맞춤',
    '학습플랫폼',
    '초등수학',
    '중등수학',
    '고등수학',
    '수학 문제 풀이',
    '온라인 학습',
    '단원평가',
    '수학 평가',
    '오답노트',
    '수학 실력 향상',
    '맞춤형 학습',
    '초등학생 수학',
    '중학생 수학',
    '고등학생 수학',
    '수학 시험',
  ],
  logo: '/logos/Ssemtle_logo.png',
  favicon: '/ssemtle_favicon.png',
  author: 'SSemtle Team',
  twitter: '@ssemtle',
} as const;

export function createMetadata({
  title,
  description,
  path = '',
  keywords = [],
  images,
  noIndex = false,
}: {
  title?: string;
  description?: string;
  path?: string;
  keywords?: string[];
  images?: { url: string; width: number; height: number; alt: string }[];
  noIndex?: boolean;
}): Metadata {
  const metaTitle = title
    ? `${title} - ${SITE_CONFIG.name}`
    : SITE_CONFIG.title;
  const metaDescription = description || SITE_CONFIG.description;
  const url = `${SITE_CONFIG.baseUrl}${path}`;
  const allKeywords = [...SITE_CONFIG.keywords, ...keywords];
  const metaImages = images || [
    {
      url: `${SITE_CONFIG.baseUrl}${SITE_CONFIG.logo}`,
      width: 1200,
      height: 630,
      alt: `${SITE_CONFIG.name} 로고 - 기초학력 학습 플랫폼`,
    },
  ];

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: allKeywords.join(', '),
    authors: [{ name: SITE_CONFIG.author }],
    creator: SITE_CONFIG.name,
    publisher: SITE_CONFIG.name,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(SITE_CONFIG.baseUrl),
    alternates: {
      canonical: path,
      languages: {
        'ko-KR': path,
      },
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url,
      siteName: SITE_CONFIG.name,
      locale: 'ko_KR',
      type: 'website',
      images: metaImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: metaImages.map((img) => img.url),
      creator: SITE_CONFIG.twitter,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
  };
}

export function getBaseUrl(): string {
  return SITE_CONFIG.baseUrl;
}
