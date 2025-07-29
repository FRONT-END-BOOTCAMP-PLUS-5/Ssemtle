# Git

## commit convention

- **`type`**: 커밋의 종류를 나타냅니다. (아래 중 하나)
  - **feat**: 새로운 기능 추가
  - **fix**: 버그 수정
  - **docs**: 문서 수정
  - **style**: 코드 포맷팅, 세미콜론 누락 등 (코드 로직 변경 없음)
  - **refactor**: 코드 리팩토링
  - **test**: 테스트 코드 추가/수정
  - **chore**: 빌드 업무, 패키지 매니저 설정 등 (프로덕션 코드 변경 없음)

## branch name

**`타입/간단한설명`**

- main
- dev
  - feat/signup-page
  - feat/reservation
  - feat/mypage
  - feat/admin
  - refactor/supabase

## 🔥 PR 제목

> 작업 유형(예: feat, fix, refactor 등) + 간결한 작업 요약

## ✨ 작업 내용

- 주요 변경 사항을 정리
- 코드 리뷰어가 전체 작업 흐름을 빠르게 이해할 수 있도록 작성해 주세요.

## ✅ 체크리스트

- [ ] 코드가 정상적으로 동작하는지 확인했습니다.
- [ ] 문서화가 필요한 경우 문서를 업데이트했습니다.
- [ ] 코드 품질을 위한 자체 리뷰를 수행했습니다.
- [ ] 불필요한 코드, 콘솔 로그, 주석 등을 제거했습니다.

## 🚀 테스트 방법

> 직접 테스트한 방법 또는 테스트 코드 내용 (있다면)

## 📸 스크린샷 / 시연 (선택)

> UI 변경 사항이 있다면 스크린샷 또는 GIF를 첨부

## 🙏 리뷰어에게 한마디

> 코드 리뷰 시 참고할 점, 요청 사항 또는 감사 인사 등을 자유롭게 작성

### Component

```tsx
const Component = () => {
	return(...)
}

export default Component;
```

### Props

```tsx
const Component = ({}: ComponentProps) => {};
```

`/types/ComponentProps.ts`

```tsx
export type ComponentProps {

}
```

# Type 선언 방식

# Dir name

### api

/api/snake-text

# Dir architecture

## BE

```tsx
// 보라 : 폴더, 흰색: 파일
// 괄호: 설명
api
	user/reservation(실제 api 호출 url이 됨)
		(adapter)
			- route.ts
		application
			usecase
			dto
	domain
		entity(data base table)
		repository(interface)
	infrastructure
		repotitory(implements)
```

## FE

```tsx
app
	admin/reservation
		- page.tsx
		- layout.tsx
		components
			- ReservationPage.tsx
			(나중에 혹시 이 레벨에서 atom,molecules..등이 필요하면 폴더 추가 -> 파일)
hooks
	- use@@@.ts
ds
	components
		atoms
			button
				- Button.tsx
				- Button.types.ts
				- Button.styles.ts
		molecules
			- InputField.tsx
			- Header.tsx
		organisms
			- Modal.tsx

	styles
		token
			- spacing.ts
			- fontSize.ts ...
	package.json
```

# 기타

**Boolean 타입**: `is`, `has`, `can` 등으로 시작하여 `true`/`false` 값을 나타내는 것이 명확하게 합니다.

- `isLoggedIn`, `hasPermission`, `canSubmit`

**함수**: '동사 + 명사' 형태로, 함수가 어떤 동작을 하는지 명확하게 표현합니다.

- 좋은 예: `fetchUserData()`, `calculateTotalPrice()`
- 나쁜 예: `data()`, `price()`
- **약어 금지**: 명확성이 떨어진다면 약어를 사용하지 않습니다. 팀 내에서 모두가 아는 약어가 아니라면 전체 단어를 사용하세요.
  - 좋은 예: `userProfile`
  - 나쁜 예: `usrProf`

**상수**: `UPPER_SNAKE_CASE`를 사용하여 상수임을 명확히 합니다.

- `const MAX_LOGIN_ATTEMPTS = 5;`
