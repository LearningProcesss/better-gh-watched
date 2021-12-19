import { Ctx } from 'next'
import db from "db"
import * as z from "zod"
import { ITopicGroupDto } from 'shared/models';

export default async function getTopicGrouped(_ = null, ctx: Ctx): Promise<ITopicGroupDto[]> {

    const dbResult: ITopicGroupDto[] = await db.$queryRaw<ITopicGroupDto[]>`SELECT GithubRepoTopics.value as topic, GRPTOPICS.cnt as count 
                                                                            FROM ( 
                                                                                SELECT B, count(A) cnt 
                                                                                FROM _GithubRepoToGithubRepoTopics 
                                                                                group by B
                                                                            ) GRPTOPICS 
                                                                            JOIN GithubRepoTopics ON GithubRepoTopics.id = GRPTOPICS.B 
                                                                            WHERE GRPTOPICS.cnt > 10 
                                                                            ORDER BY GRPTOPICS.cnt DESC LIMIT 30`;

    return dbResult
}