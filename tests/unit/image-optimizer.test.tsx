// ABOUTME: Unit tests that keep the Next.js image optimizer closed to arbitrary remote hosts
// ABOUTME: Covers next.config remotePatterns and the teacher auth card's user-supplied image URL
import { render, screen } from '@testing-library/react';
import nextConfig from '@/next.config';
import TeacherAuthCard from '@/app/admin/teacher-approval/components/TeacherAuthCard';

jest.mock(
  '@/app/admin/teacher-approval/components/TechApproval',
  () => () => null
);
jest.mock(
  '@/app/admin/teacher-approval/components/TechReject',
  () => () => null
);

describe('image optimizer', () => {
  it('does not allow any remote host through /_next/image', () => {
    expect(nextConfig.images?.remotePatterns ?? []).toEqual([]);
  });

  it('loads a user-supplied teacher auth image directly instead of through the optimizer', () => {
    const imgUrl = 'https://example.com/certificate.png';

    render(
      <TeacherAuthCard
        teacherAuth={{
          id: 1,
          teacherId: 'teacher1',
          name: '김선생',
          imgUrl,
          createdAt: new Date('2026-01-01'),
        }}
      />
    );

    expect(
      screen.getByAltText('김선생 선생님 인증 이미지').getAttribute('src')
    ).toBe(imgUrl);
  });
});
