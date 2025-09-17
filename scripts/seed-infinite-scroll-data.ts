import { PrismaClient } from '@/app/generated/prisma/client';

const prisma = new PrismaClient();

const koreanMathCategories = [
  '대수',
  '기하',
  '함수',
  '확률과통계',
  '해석기하',
  '미적분',
  '집합',
  '수열',
  '방정식',
  '부등식',
];

const sampleQuestions = [
  // 대수 문제들
  'X + 3 = 8을 풀어보세요',
  '2X - 5 = 7을 풀어보세요',
  '3X + 4 = 19를 풀어보세요',
  'X² - 4 = 0을 풀어보세요 (양수 답만)',
  '5 × 3 + 2 = ?',

  // 기하 문제들
  '삼각형의 내각의 합은 몇 도인가요?',
  '직각삼각형에서 빗변의 길이는? (3, 4 변)',
  '정사각형의 한 변이 5일 때 넓이는?',
  '원의 반지름이 3일 때 넓이는? (π = 3.14)',
  '직각삼각형에서 빗변의 길이는? (5, 12 변)',

  // 함수 문제들
  'f(x) = 2x + 1일 때, f(3)은?',
  'f(x) = x² - 1일 때, f(2)는?',
  'y = 3x + 2의 기울기는?',
  'f(x) = 5x - 3일 때, f(4)는?',
  'f(x) = x² + x일 때, f(3)은?',

  // 확률과통계 문제들
  '동전을 던져 앞면이 나올 확률은? (소수로)',
  '주사위에서 짝수가 나올 확률은? (소수로)',
  '1~10 중 소수 개수는?',
  '1~20 중 5의 배수 개수는?',
  '1부터 100까지 짝수 개수는?',

  // 미적분 문제들
  'f(x) = 3x²의 도함수 계수는?',
  'f(x) = 5x³의 도함수에서 x² 계수는?',
  '2 + 3 × 4 = ?',
  '(8 + 2) ÷ 5 = ?',
  '12 ÷ 3 + 2 × 5 = ?',
];

const answers = [
  // 대수 답들
  '5',
  '6',
  '5',
  '2',
  '17',

  // 기하 답들
  '180',
  '5',
  '25',
  '28.26',
  '13',

  // 함수 답들
  '7',
  '3',
  '3',
  '17',
  '12',

  // 확률과통계 답들
  '0.5',
  '0.5',
  '4',
  '4',
  '50',

  // 미적분/연산 답들
  '6',
  '15',
  '14',
  '2',
  '14',
];

const helpTexts = [
  '기본 방정식 풀이: 양변에 같은 수를 더하거나 빼세요',
  '연산의 순서를 지켜 차근차근 계산해보세요',
  '공식을 정확히 기억하고 적용해보세요',
  '그래프를 그려보면 더 쉽게 이해할 수 있습니다',
  '정의를 다시 한번 확인해보세요',
  '비슷한 문제를 먼저 풀어보세요',
  '단계별로 나누어 생각해보세요',
  '조건을 정리하고 체계적으로 접근해보세요',
];

async function main() {
  console.log('🚀 무한 스크롤링 테스트를 위한 대용량 데이터 생성 시작...');

  // 기존 유닛들 가져오기
  const units = await prisma.unit.findMany();
  if (units.length === 0) {
    console.log(
      '❌ 유닛 데이터가 없습니다. 먼저 npm run db:seed를 실행하세요.'
    );
    return;
  }

  // 테스트 사용자 가져오기
  const testUser = await prisma.user.findFirst({
    where: { userId: 'test-user' },
  });

  if (!testUser) {
    console.log(
      '❌ 테스트 사용자가 없습니다. 먼저 npm run db:seed를 실행하세요.'
    );
    return;
  }

  // 현재 solves 수 확인
  const currentSolvesCount = await prisma.solve.count({
    where: { userId: testUser.id },
  });
  console.log(`📊 현재 ${currentSolvesCount}개의 solve 기록이 있습니다.`);

  // 대용량 데이터 생성 (100개씩 배치로 처리)
  const totalToCreate = 1500; // 무한 스크롤링 테스트를 위한 충분한 양
  const batchSize = 100;
  const batches = Math.ceil(totalToCreate / batchSize);

  console.log(
    `📝 ${totalToCreate}개의 새로운 solve 기록을 ${batches}개 배치로 생성합니다...`
  );

  for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
    const currentBatchSize = Math.min(
      batchSize,
      totalToCreate - batchIndex * batchSize
    );
    const solvesToCreate = [];

    for (let i = 0; i < currentBatchSize; i++) {
      const randomUnit = units[Math.floor(Math.random() * units.length)];
      const questionIndex = Math.floor(Math.random() * sampleQuestions.length);
      const category =
        koreanMathCategories[
          Math.floor(Math.random() * koreanMathCategories.length)
        ];

      // 지난 60일간 랜덤 날짜 생성 (더 넓은 범위)
      const now = new Date();
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      const randomDate = new Date(
        sixtyDaysAgo.getTime() +
          Math.random() * (now.getTime() - sixtyDaysAgo.getTime())
      );

      // 75% 정답률로 설정
      const isCorrect = Math.random() < 0.75;
      const correctAnswer = answers[questionIndex];
      const wrongAnswers = ['0', '1', '10', '99', '100'];
      const userInput = isCorrect
        ? correctAnswer
        : wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];

      solvesToCreate.push({
        question: sampleQuestions[questionIndex],
        answer: correctAnswer,
        helpText: `${category} - ${helpTexts[Math.floor(Math.random() * helpTexts.length)]}`,
        userInput,
        isCorrect,
        createdAt: randomDate,
        unitId: randomUnit.id,
        userId: testUser.id,
      });
    }

    // 배치로 데이터 삽입
    await prisma.solve.createMany({
      data: solvesToCreate,
      skipDuplicates: true,
    });

    console.log(
      `✅ 배치 ${batchIndex + 1}/${batches} 완료 (${currentBatchSize}개 기록 생성)`
    );
  }

  // 최종 통계 확인
  const finalCount = await prisma.solve.count({
    where: { userId: testUser.id },
  });

  const categoryStats = await prisma.solve.groupBy({
    by: ['unitId'],
    where: { userId: testUser.id },
    _count: {
      id: true,
    },
  });

  console.log('\n🎉 데이터 생성 완료!');
  console.log(`📈 총 solve 기록: ${finalCount}개`);
  console.log(`🆕 새로 생성된 기록: ${finalCount - currentSolvesCount}개`);
  console.log(`📚 ${categoryStats.length}개 유닛에 걸쳐 분산됨`);

  console.log('\n🧪 무한 스크롤링 테스트 가이드:');
  console.log('1. npm run dev로 서버 시작');
  console.log('2. /problem-solving 페이지 접속');
  console.log('3. 스크롤하면서 20개씩 로딩되는지 확인');
  console.log(`4. 총 ${Math.ceil(finalCount / 20)}페이지 정도 스크롤 가능`);
  console.log('5. 필터 기능도 함께 테스트해보세요!');
}

main()
  .catch((e) => {
    console.error('❌ 스크립트 실행 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
