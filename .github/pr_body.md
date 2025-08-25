## 🔥 PR 제목

feat: 랜딩 페이지 스크롤 네비게이션, SEO 강화, 루트 리다이렉트 추가

## ✨ 작업 내용

- 랜딩 페이지 개편 및 네비게이션 개선
  - `app/landing/page.tsx`: 섹션 기반 스크롤 스냅(`hero`, `features`, `about`, `contact`)과 우측 고정 네비게이션 도입
  - 구조화 데이터(JSON-LD) 추가 및 CTA 링크(`/signup/students`, `/signup/teacher`, `/signin`) 정리
- SEO 및 검색 노출 개선
  - 메타데이터 확장: `keywords`, `openGraph`, `twitter`, `robots`, `metadataBase`, `canonical` 추가/정리
  - `app/layout.tsx`: 문서 언어 `lang="ko"`로 설정
  - `app/robots.ts`: 공개/비공개 경로 규칙 설정 및 `sitemap` 참조 추가
  - `app/sitemap.ts`: 주요 라우트에 대한 정적 Sitemap 항목 정의
- 사용자 경험 및 성능
  - `hooks/useScrollspy.ts`: IntersectionObserver 기반 섹션 감지, URL 해시 동기화, 뒤/앞으로 탐색 대응, 스로틀링 적용
  - `app/landing/_component/ScrollNavigation.tsx`: framer-motion 기반 활성 표시/툴팁/부드러운 스크롤
- 라우팅
  - `next.config.ts`: `/` → `/landing` 영구 리다이렉트 추가

## ✅ 체크리스트

- [x] 코드가 정상적으로 동작하는지 확인했습니다.
- [x] 문서화가 필요한 경우 문서를 업데이트했습니다. (PR 본문에 요약)
- [x] 코드 품질을 위한 자체 리뷰를 수행했습니다.
- [x] 불필요한 코드, 콘솔 로그, 주석 등을 제거했습니다.

## 🚀 테스트 방법

1. `/` 접속 시 `/landing`으로 리다이렉트되는지 확인
2. `/landing`에서 섹션 스크롤 시 우측 네비게이션 활성 상태와 URL 해시 동기화(`#features` 등) 확인
3. 브라우저 뒤/앞으로 이동 시 해당 섹션으로 스크롤 되는지 확인
4. 모바일/데스크톱에서 우측 네비게이션이 레이아웃을 침범하지 않는지 확인
5. SEO 확인
   - `<html lang="ko">` 적용 확인
   - Open Graph/Twitter 메타 태그 노출 확인
   - `GET /robots.txt`, `GET /sitemap.xml` 정상 응답 확인

## 📸 스크린샷 / 시연 (선택)

> 필요 시 랜딩 페이지 섹션 및 네비게이션 동작 GIF 첨부

## 🙏 리뷰어에게 한마디

- 헤더가 고정된 환경에서는 `useScrollspy`의 `offset` 조정이 필요할 수 있습니다.
- 우측 네비게이션의 모바일 표시 정책(숨김/축소)에 대해 추가 의견 부탁드립니다.
