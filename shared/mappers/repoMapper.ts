import { GithubRepo, GithubRepoLanguage, GithubRepoTopics } from "db";
import { IGithubDto } from "shared/models";

export const repoDbToDto = (repoDb: GithubRepo & { topics?: GithubRepoTopics[]; languages?: GithubRepoLanguage[]; }) => {

    const dto: IGithubDto = {
        id: repoDb.id,
        avatar_url: repoDb.avatar_url,
        description: repoDb.description,
        full_name: repoDb.full_name,
        html_url: repoDb.html_url,
        name: repoDb.name,
        url: repoDb.url,
        stargazers_count: repoDb.stargazers_count,
        latest_commit: repoDb.latest_commit,
        topics: repoDb.topics ? repoDb.topics!.map(item => item.value) : undefined,
        languages: repoDb.languages ? Object.assign({}, ...repoDb.languages!.map((x) => ({[x.language]: x.bytes}))) : undefined
    }

    return dto
}