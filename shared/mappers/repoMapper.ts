import { GithubRepo, GithubRepoLanguage, GithubRepoTopics } from "db";
import { IGhApiAggregate } from "server/github/githubapi.model";
import { IGithubDto } from "shared/models";

export const repoDbToDto = (repoDb: GithubRepo & { topics?: GithubRepoTopics[]; languages?: GithubRepoLanguage[]; }): IGithubDto => {

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
        languages: repoDb.languages ? Object.assign({}, ...repoDb.languages!.map((x) => ({ [x.language]: x.bytes }))) : undefined
    }

    return dto
}


export const repoApiToDto = (aggregate: IGhApiAggregate): IGithubDto => {
    const dto: IGithubDto = {
        id: aggregate.repo.id!!,
        name: aggregate.repo.name!,
        full_name: aggregate.repo.full_name!,
        html_url: aggregate.repo.html_url!,
        url: aggregate.repo.url!,
        description: aggregate.repo.description!,
        stargazers_count: aggregate.repo.stargazers_count!,
        avatar_url: aggregate.repo.owner!.avatar_url!,
        latest_commit: aggregate.commits[0]!.commit!.author?.date!,
        topics: aggregate.repo.topics!,
        languages: aggregate.languages
    }

    return dto
}