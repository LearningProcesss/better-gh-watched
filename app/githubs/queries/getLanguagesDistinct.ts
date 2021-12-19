import { Ctx } from 'next'
import db, { GithubRepoLanguage } from "db"
import * as z from "zod"

export default async function getLanguagesGrouped(_ = null, ctx: Ctx): Promise<{ language: string, count: number }[]> {

    // ctx.session.$authorize()

    const languagesDb = await db.githubRepoLanguage.groupBy({ by: ['language'], _sum: { repoId: true } })

    const dto = languagesDb.map(item => ({ language: item.language, count: item._sum.repoId ?? 0 }))

    return dto
}