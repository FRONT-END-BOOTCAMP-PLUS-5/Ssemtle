---
name: Feature request
about: Suggest an idea for this project
title: 'Feature: 랜딩 페이지 스크롤 네비게이션 및 SEO 강화'
labels: 'feature'
assignees: ''
---

## 기능 설명

랜딩 페이지에 섹션 기반 스크롤 네비게이션을 추가하고, 검색 노출(SEO)을 강화합니다. 또한 루트 경로(`/`) 접근 시 `/landing`으로 리다이렉트하여 퍼스트 임프레션을 일관화합니다.

## 작업 상세 내용

- [x] 랜딩 페이지 섹션 스냅 및 우측 스크롤 네비게이션 구현 (`app/landing/page.tsx`, `app/landing/_component/ScrollNavigation.tsx`)
- [x] 스크롤 위치 기반 활성 섹션 감지 훅 구현 및 URL 해시 동기화 (`hooks/useScrollspy.ts`)
- [x] 메타데이터 확장(OG/Twitter/robots/canonical/metadataBase/keywords 등)
- [x] `robots` 및 `sitemap` 라우트 추가 (`app/robots.ts`, `app/sitemap.ts`)
- [x] 문서 언어 `lang="ko"` 설정 (`app/layout.tsx`)
- [x] `/` → `/landing` 영구 리다이렉트 설정 (`next.config.ts`)
- [ ] 모바일 뷰에서 우측 네비게이션 표시 정책 최종 결정(숨김/축소/반응형 정렬)
- [ ] 고정 헤더 환경에서 `useScrollspy` `offset` 값 튜닝 및 섹션 정렬 재확인
- [ ] 검색 콘솔 제출 및 OG/Twitter 카드 프리뷰 확인

## 참고할만한 자료(선택)

- Next.js Metadata: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- Next.js Sitemap/Robots: https://nextjs.org/docs/app/building-your-application/optimizing/metadata#sitemaptxt-and-robotstxt
- IntersectionObserver API: https://developer.mozilla.org/docs/Web/API/Intersection_Observer_API
