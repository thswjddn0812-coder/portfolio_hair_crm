# 로즈헤어 미용실 회원관리 프론트엔드

Next.js로 개발된 미용실 회원 관리 시스템 프론트엔드입니다.

## 설치 방법

```bash
npm install
```

## 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3001](http://localhost:3001)를 열어 확인할 수 있습니다.

## 환경 변수

`.env.local` 파일을 생성하여 다음을 설정하세요:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

백엔드 서버가 다른 포트에서 실행 중이라면 해당 URL로 변경하세요.

## 기능

- 회원가입
- 로그인
- 회원 등록
- 회원 검색

## 페이지 구조

- `/` - 메인 대시보드
- `/login` - 로그인 페이지
- `/register` - 회원가입 페이지
- `/members/add` - 회원 등록 페이지
- `/members/search` - 회원 검색 페이지
