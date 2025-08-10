import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const koreanMathUnits = [
  '소인수분해',
  '정수와 유리수',
  '유리수와 순환소수',
  '제곱근과 실수',
  '문자 사용과 식',
  '일차방정식',
  '좌표평면과 그래프',
  '식의 계산',
  '일차부등식',
  '연립일차방정식',
  '일차함수와 그 그래프',
  '일차함수와 일차방정식의 관계',
  '다항식의 곱셈과 인수분해',
  '이차방정식',
  '이차함수와 그 그래프',
  '기본 도형',
  '작도와 합동',
  '평면도형과 입체도형의 성질',
  '삼각형과 사각형의 성질',
  '도형의 닮음',
  '피타고라스의 정리',
  '삼각비',
  '원의 성질',
  '대푯값',
  '도수분포표와 상대도수',
  '경우의 수와 확률',
  '산포도',
  '상자그림과 산점도',
];

async function main() {
  console.log('Starting seed...');

  // Create units (idempotent - only create if not exists)
  for (const unitName of koreanMathUnits) {
    const existingUnit = await prisma.unit.findFirst({
      where: { name: unitName },
    });

    if (!existingUnit) {
      await prisma.unit.create({
        data: {
          name: unitName,
          vidUrl: `https://example.com/videos/${encodeURIComponent(unitName)}`,
        },
      });
    }
  }

  console.log(`✓ Created/verified ${koreanMathUnits.length} units`);

  // Get all units for solve generation
  const units = await prisma.unit.findMany();

  // Get or create a test user
  let testUser = await prisma.user.findFirst({
    where: { userId: 'test-user' },
  });

  if (!testUser) {
    testUser = await prisma.user.create({
      data: {
        userId: 'test-user',
        password: 'test-password',
        name: '테스트 사용자',
        role: 'student',
      },
    });
  }

  console.log('✓ Created/verified test user');

  // Check if we already have solve data
  const existingSolvesCount = await prisma.solve.count();
  if (existingSolvesCount > 0) {
    console.log(`✓ Seed data already exists (${existingSolvesCount} solves)`);
    return;
  }

  // Generate solve data over the last 30 days
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const sampleQuestions = [
    '2x + 5 = 13을 풀어보세요.',
    '다음 식을 간단히 하세요: 3(x + 2) - 2(x - 1)',
    '√25의 값은?',
    '삼각형 ABC에서 각 A = 60°, 각 B = 70°일 때 각 C는?',
    '2의 5제곱을 계산하세요.',
    '직선 y = 2x + 3의 기울기는?',
    '다음 방정식을 풀어보세요: x² - 5x + 6 = 0',
    '원의 둘레 공식은?',
    '확률을 구해보세요: 주사위를 던져 짝수가 나올 확률',
    '평균을 구하세요: 80, 90, 70, 85, 75',
  ];

  const answers = [
    'x = 4',
    'x + 8',
    '5',
    '50°',
    '32',
    '2',
    'x = 2 또는 x = 3',
    '2πr',
    '1/2',
    '80',
  ];

  // Generate ~200 solves distributed over 30 days
  const solvesToCreate = [];
  for (let i = 0; i < 200; i++) {
    const randomUnit = units[Math.floor(Math.random() * units.length)];
    const questionIndex = Math.floor(Math.random() * sampleQuestions.length);

    // Random date in the last 30 days
    const randomDate = new Date(
      thirtyDaysAgo.getTime() +
        Math.random() * (now.getTime() - thirtyDaysAgo.getTime())
    );

    // Mix of correct/incorrect answers (70% correct)
    const isCorrect = Math.random() < 0.7;
    const userInput = isCorrect ? answers[questionIndex] : '잘못된 답';

    solvesToCreate.push({
      question: sampleQuestions[questionIndex],
      answer: answers[questionIndex],
      helpText: `${randomUnit.name} 단원의 문제입니다. 차근차근 풀어보세요.`,
      userInput,
      isCorrect,
      createdAt: randomDate,
      unitId: randomUnit.id,
      userId: testUser.id,
    });
  }

  // Batch create solves
  await prisma.solve.createMany({
    data: solvesToCreate,
    skipDuplicates: true,
  });

  console.log(`✓ Created ${solvesToCreate.length} solve records`);
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
