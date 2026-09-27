// ABOUTME: Unit tests for the teacher student-list Excel export and its SheetJS dependency
// ABOUTME: Checks the workbook ExportButton builds and that xlsx is at a patched SheetJS version
import { fireEvent, render, waitFor } from '@testing-library/react';
import * as XLSX from 'xlsx';
import ExportButton from '@/app/teacher/student/components/ExportButton';

jest.mock('xlsx', () => ({
  ...jest.requireActual('xlsx'),
  writeFile: jest.fn(),
}));

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { id: 'teacher1' } } }),
}));

const students = [
  { name: '김학생', userId: 'student1', createdAt: '2026-03-02T00:00:00Z' },
  { name: '이학생', userId: 'student2', createdAt: '2026-03-03T00:00:00Z' },
];

jest.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    refetch: () => Promise.resolve({ data: { students } }),
  }),
}));

jest.mock('react-toastify', () => ({
  toast: {
    info: jest.fn(),
    success: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// SheetJS versions below 0.20.2 have known advisories (prototype pollution, ReDoS)
function isAtLeast(version: string, minimum: string): boolean {
  const a = version.split('.').map(Number);
  const b = minimum.split('.').map(Number);
  for (let i = 0; i < b.length; i++) {
    if (a[i] !== b[i]) return a[i] > b[i];
  }
  return true;
}

describe('ExportButton', () => {
  it('uses a SheetJS release with the known advisories patched', () => {
    expect(isAtLeast(XLSX.version, '0.20.2')).toBe(true);
  });

  it('writes the students to a 학생목록 sheet in an .xlsx file', async () => {
    const { getByText } = render(<ExportButton />);

    fireEvent.click(getByText('내보내기'));

    await waitFor(() => expect(XLSX.writeFile).toHaveBeenCalledTimes(1));
    const [workbook, fileName] = (XLSX.writeFile as jest.Mock).mock.calls[0];
    expect(fileName).toMatch(/^학생목록_\d{4}-\d{2}-\d{2}\.xlsx$/);
    expect(workbook.SheetNames).toEqual(['학생목록']);

    const rows = XLSX.utils.sheet_to_json<string[]>(
      workbook.Sheets['학생목록'],
      { header: 1 }
    );
    expect(rows[1]).toEqual(['김학생', 'student1', '1234', '2026. 3. 2.']);
    expect(rows[2]).toEqual(['이학생', 'student2', '1234', '2026. 3. 3.']);
  });
});
