import { Ctx } from 'next'
import db from "db"
import * as z from "zod"

const GetRepoCount = z.object({
    id: z.number(),
})

export default async function getRepoCount(_ = null, ctx: Ctx): Promise<{}> {

    // ctx.session.$authorize()

    const count = await db.githubRepo.count()

    return count
}