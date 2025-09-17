import axios from 'axios';
import type {
  SignUpStudentFormData,
  SignUpTeacherFormData,
} from '@/libs/zod/auth';

export interface DuplicateCheckResponse {
  exists: boolean;
  message?: string;
}

export interface RegisterResponse {
  message: string;
  user: {
    id: string;
    userId: string;
    name: string;
    role: string;
  };
}

export interface TeacherAuthResponse {
  message: string;
  data: {
    id: number;
    teacherId: string;
    name: string;
    email: string;
    imgUrl: string;
    createdAt: string;
  };
}

// 아이디 중복 확인
export async function checkDuplicate(
  userId: string
): Promise<DuplicateCheckResponse> {
  const response = await axios.post('/api/auth/duplicates', { userId });
  return response.data;
}

// 학생 회원가입
export async function registerStudent(
  data: Omit<SignUpStudentFormData, 'confirmPassword'>
): Promise<RegisterResponse> {
  const response = await axios.post('/api/auth/register', {
    userId: data.userId,
    password: data.password,
    name: data.name,
    role: 'student',
  });
  return response.data;
}

// 교사 회원가입 (2단계 프로세스)
export async function registerTeacher(
  data: Omit<SignUpTeacherFormData, 'confirmPassword'>
): Promise<{
  user: RegisterResponse;
  teacherAuth: TeacherAuthResponse;
}> {
  // 1단계: 사용자 등록 (pending_teacher 역할)
  const userResponse = await axios.post('/api/auth/register', {
    userId: data.userId,
    password: data.password,
    name: data.name,
    role: 'pending_teacher',
  });

  try {
    // 2단계: 교사 인증 요청
    const teacherAuthResponse = await axios.post('/api/admin/teachers', {
      teacherId: userResponse.data.user.id,
      name: data.teacherName,
      email: data.email,
      imgUrl: data.imgUrl,
    });

    return {
      user: userResponse.data,
      teacherAuth: teacherAuthResponse.data,
    };
  } catch (error) {
    // 교사 인증 요청 실패 시 사용자 등록은 유지 (pending_teacher 상태)
    // 실제 프로덕션에서는 rollback을 고려할 수 있지만,
    // 사용자가 다시 교사 인증을 요청할 수 있도록 pending 상태로 유지
    console.error('Teacher auth request failed:', error);
    throw new Error(
      '교사 인증 요청 중 오류가 발생했습니다. 관리자에게 문의해주세요.'
    );
  }
}
