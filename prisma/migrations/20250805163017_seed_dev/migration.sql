-- CreateTable
CREATE TABLE "public"."pets" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "img_url" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "owner_id" INTEGER,

    CONSTRAINT "pets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."own_pets" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "pet_id" INTEGER NOT NULL,

    CONSTRAINT "own_pets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "point" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."stores" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "img_url" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "pets_id" INTEGER,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."unit_codes" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teacher_id" INTEGER NOT NULL,

    CONSTRAINT "unit_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."unit_math_solves" (
    "id" SERIAL NOT NULL,
    "user_input" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "question_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "unit_code_id" INTEGER,

    CONSTRAINT "unit_math_solves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."unit_math_questions" (
    "id" SERIAL NOT NULL,
    "unit_code" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "help_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category_id" INTEGER NOT NULL,
    "user_id" INTEGER,

    CONSTRAINT "unit_math_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."math_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "vid_url" TEXT NOT NULL,

    CONSTRAINT "math_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."math_solves" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "help_url" TEXT NOT NULL,
    "user_input" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "math_solves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."teacher_approvals" (
    "id" SERIAL NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "img_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teacher_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."student_managements" (
    "id" SERIAL NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,

    CONSTRAINT "student_managements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_user_id_key" ON "public"."users"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "unit_codes_code_key" ON "public"."unit_codes"("code");

-- AddForeignKey
ALTER TABLE "public"."pets" ADD CONSTRAINT "pets_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."unit_math_solves" ADD CONSTRAINT "unit_math_solves_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."unit_math_solves" ADD CONSTRAINT "unit_math_solves_unit_code_id_fkey" FOREIGN KEY ("unit_code_id") REFERENCES "public"."unit_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."unit_math_questions" ADD CONSTRAINT "unit_math_questions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."math_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."unit_math_questions" ADD CONSTRAINT "unit_math_questions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."math_solves" ADD CONSTRAINT "math_solves_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teacher_approvals" ADD CONSTRAINT "teacher_approvals_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
