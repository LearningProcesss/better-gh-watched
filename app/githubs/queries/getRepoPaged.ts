import { Ctx } from 'next'
import db from "db"
import * as z from "zod"
import { repoDbToDto } from 'shared/mappers'
import { Paged, IGithubDto } from 'shared/models'

const GetRepoPaged = z.object({
    page: z.number(),
    take: z.number(),
    where: z.any(),
    orderBy: z.any()
})

export default async function getRepoPaged(input: z.infer<typeof GetRepoPaged>, ctx: Ctx) {

    const data = GetRepoPaged.parse(input)

    const { page, take, where, orderBy } = data

    const skip = (page - 1) * take;

    const count = await db.githubRepo.count({
        where: {
            ...where
        }
    })

    const repos = await db.githubRepo.findMany({
        skip: skip,
        take: take,
        include: {
            languages: true,
            topics: true
        },
        where: {
            ...where
        },
        orderBy: {
            ...orderBy
        }
    })

    const totalPagesHandler = (totalItems: number, take: number) => Math.round(count / take) == 0 ? 1 : Math.round(count / take)

    const result = <Paged<IGithubDto>> {
        items: repos.map(item => repoDbToDto(item)),
        page: page,
        totalPages: totalPagesHandler(count, take),
        totalItems: count
    }

    console.log(result.page, result.totalItems, result.totalPages);
    

    return result
}