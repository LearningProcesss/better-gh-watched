import { Ctx } from 'next'
import db from "db"
import * as z from "zod"

const GetRepoCount = z.object({
    id: z.number(),
})

export default async function getTopicsCount(_ = null, ctx: Ctx): Promise<{}> {

    // ctx.session.$authorize()

    const count = await db.githubRepoTopics.count()

    return count
}