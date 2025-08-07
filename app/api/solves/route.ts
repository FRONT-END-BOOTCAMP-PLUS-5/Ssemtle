
import { GenerateSolvesByCategoryUseCase } from "@/backend/solves/usecases/GenerateSolvesByCategoryUseCase"
import { callGemini } from "@/libs/gemini/callGemini"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")

  if (!category) {
    return NextResponse.json({ error: "카테고리를 입력하세요" }, { status: 400 })
  }

  const usecase = new GenerateSolvesByCategoryUseCase({
    async generate(prompt: string) {
      const result = await callGemini(prompt)
      return result
    }
  })

  const solves = await usecase.execute(category)

  return NextResponse.json(solves)
}