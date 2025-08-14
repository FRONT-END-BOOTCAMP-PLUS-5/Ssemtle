import { object, string } from 'zod';

export const signInSchema = object({
  id: string({ message: '아이디를 입력해주세요' })
    .min(1, '아이디를 입력해주세요')
    .max(50, '아이디는 50자 이하로 입력해주세요'),
  password: string({ message: '비밀번호를 입력해주세요' })
    .min(1, '비밀번호를 입력해주세요')
    .max(100, '비밀번호는 100자 이하로 입력해주세요'),
});

export const signUpStudentSchema = object({
  userId: string({ message: '아이디를 입력해주세요' })
    .min(3, '아이디는 3자 이상이어야 합니다')
    .max(20, '아이디는 20자 이하로 입력해주세요')
    .regex(/^[a-zA-Z0-9_]+$/, '아이디는 영문, 숫자, 밑줄(_)만 사용 가능합니다'),
  password: string({ message: '비밀번호를 입력해주세요' })
    .min(6, '비밀번호는 6자 이상이어야 합니다')
    .max(100, '비밀번호는 100자 이하로 입력해주세요'),
  confirmPassword: string({ message: '비밀번호 확인을 입력해주세요' }),
  name: string({ message: '이름을 입력해주세요' })
    .min(2, '이름은 2자 이상이어야 합니다')
    .max(10, '이름은 10자 이하로 입력해주세요'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
});

export const signUpTeacherSchema = object({
  userId: string({ message: '아이디를 입력해주세요' })
    .min(3, '아이디는 3자 이상이어야 합니다')
    .max(20, '아이디는 20자 이하로 입력해주세요')
    .regex(/^[a-zA-Z0-9_]+$/, '아이디는 영문, 숫자, 밑줄(_)만 사용 가능합니다'),
  password: string({ message: '비밀번호를 입력해주세요' })
    .min(6, '비밀번호는 6자 이상이어야 합니다')
    .max(100, '비밀번호는 100자 이하로 입력해주세요'),
  confirmPassword: string({ message: '비밀번호 확인을 입력해주세요' }),
  name: string({ message: '이름을 입력해주세요' })
    .min(2, '이름은 2자 이상이어야 합니다')
    .max(10, '이름은 10자 이하로 입력해주세요'),
  teacherName: string({ message: '교사명을 입력해주세요' })
    .min(2, '교사명은 2자 이상이어야 합니다')
    .max(20, '교사명은 20자 이하로 입력해주세요'),
  imgUrl: string({ message: '증명서 이미지를 업로드해주세요' }).min(
    1,
    '증명서 이미지를 업로드해주세요'
  ),
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
});

export type SignInFormData = {
  id: string;
  password: string;
};

export type SignUpStudentFormData = {
  userId: string;
  password: string;
  confirmPassword: string;
  name: string;
};

export type SignUpTeacherFormData = {
  userId: string;
  password: string;
  confirmPassword: string;
  name: string;
  teacherName: string;
  imgUrl: string;
};
