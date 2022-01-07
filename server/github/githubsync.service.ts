import { GithubRepo, Prisma, PrismaClient, User } from "db";
import { EventEmitter } from 'events';
import { Octokit } from "octokit";
import { range, sleep, wrapErr } from "shared/lib";
import { repoApiToDto } from "shared/mappers";
import { IGithubDto } from "shared/models";
import { IGhApiAggregate, IGhAPICommit, IGhApiRepo } from "./githubapi.model";


export class GithubSyncServiceGenerator extends EventEmitter {

    client: Octokit

    constructor(private db: PrismaClient) {
        super()

        if (this.db === undefined) {
            throw new Error("db: PrismaClient cannot be undefined");
        }
    }

    async process(client: Octokit) {

        this.client = client

        for await (const iterator of this.processPagesStep()) {
            console.log(`process => ${iterator}`);
        }

        this.emit("sync-process-end")
    }

    async *processPagesStep() {

        const [error, response] = await wrapErr(this.client.rest.activity.listWatchedReposForAuthenticatedUser({ headers: { accept: "application/vnd.github.mercy-preview+json" } }))

        const totalPage: number = this.getPagesFromLink(response!.headers.link ?? '');

        response?.headers["x-ratelimit-remaining"]

        this.emit("sync-process-start", totalPage)

        let current = 1

        while (current <= totalPage) {
            console.log(`STEP 1 => processPagesStep => ${current} of ${totalPage}`);
            yield* this.processGetItemsPageStep(current)
            current++
        }

        return
    }

    async *processGetItemsPageStep(page: number) {
        console.log(`STEP 2 => processGetItemsPageStep => ${page}`);

        const [error, response] = await wrapErr(this.client.rest.activity.listWatchedReposForAuthenticatedUser({ headers: { accept: "application/vnd.github.mercy-preview+json" }, page }))

        if (!this.isRateLimitGuard(response?.headers["x-ratelimit-remaining"])) {
            return
        }

        for (const repo of response!.data) {
            yield* this.prepareItemStep(repo as IGhApiRepo)
        }

        this.emit("sync-page-end", page)

        return
    }

    async *prepareItemStep(repo: IGhApiRepo) {
        console.log(`STEP 3 => prepareItemStep => ${repo.id}`);

        const commits = await this.client.rest.repos.listCommits({ owner: repo.owner?.login!, repo: repo.name!, page: 1, per_page: 1 })

        const languages = await this.client.rest.repos.listLanguages({ owner: repo.owner!.login ?? '', repo: repo.name! })

        yield* this.transformItemStep({ repo, commits: commits.data! as IGhAPICommit[], languages: languages.data })
    }

    async *transformItemStep(aggregate: IGhApiAggregate) {
        console.log(`STEP 4 => transformItemStep => ${aggregate.repo.id}`);

        // const dto: IGithubDto = {
        //     id: aggregate.repo.id!!,
        //     name: aggregate.repo.name!,
        //     full_name: aggregate.repo.full_name!,
        //     html_url: aggregate.repo.html_url!,
        //     url: aggregate.repo.url!,
        //     description: aggregate.repo.description!,
        //     stargazers_count: aggregate.repo.stargazers_count!,
        //     avatar_url: aggregate.repo.owner!.avatar_url!,
        //     latest_commit: aggregate.commits[0]!.commit!.author?.date!,
        //     topics: aggregate.repo.topics!,
        //     languages: aggregate.languages
        // }

        const dto: IGithubDto = repoApiToDto(aggregate)

        yield dto

        yield* this.saveItemToDbStep(dto)
    }

    async *saveItemToDbStep(repo: IGithubDto) {
        console.log(`STEP 5 => saveItemToDbStep => ${repo.id}`);

        try {
            const repoDb = await this.db.githubRepo.upsert({
                where: {
                    id: repo.id
                },
                create: {
                    id: repo.id,
                    name: repo.name,
                    full_name: repo.full_name,
                    html_url: repo.html_url,
                    url: repo.url,
                    description: repo.description,
                    stargazers_count: repo.stargazers_count,
                    avatar_url: repo.avatar_url,
                    latest_commit: repo.latest_commit,
                    topics: {
                        connectOrCreate: this.prepareTopicQuery(repo.topics)
                    },
                    languages: {
                        create: this.prepareLanguageQuery(repo.languages)
                    }
                },
                update: {
                    name: repo.name,
                    full_name: repo.full_name,
                    html_url: repo.html_url,
                    url: repo.url,
                    description: repo.description,
                    stargazers_count: repo.stargazers_count,
                    avatar_url: repo.avatar_url,
                    latest_commit: repo.latest_commit,
                    topics: {
                        connectOrCreate: this.prepareTopicQuery(repo.topics)
                    }
                }
            })
            // console.log(repoDb);

            yield repoDb
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                console.log(JSON.stringify(error));
            }
            if (error instanceof Prisma.PrismaClientUnknownRequestError) {
                console.log(JSON.stringify(error));
            }
            if (error instanceof Prisma.PrismaClientRustPanicError) {
                console.log(JSON.stringify(error));
            }
            if (error instanceof Prisma.PrismaClientInitializationError) {
                console.log(JSON.stringify(error));
            }
            console.log(error);
            yield false
        }
    }

    prepareLanguageQuery(languages?: { [key: string]: number }): { language: string, bytes: number }[] {
        return languages ? Object.entries(languages!).map(([key, value]) => ({ language: key, bytes: value })) : []
    }

    prepareTopicQuery(topics?: string[]): { where: { value: string }, create: { value: string } }[] {
        return topics ?
            topics!.map(topic => ({ where: { value: topic }, create: { value: topic } }))
            :
            []
    }

    isRateLimitGuard(limitRemaining: string | undefined): boolean {
        if (limitRemaining !== undefined) {
            const limitRemainingNr = parseInt(limitRemaining);

            return limitRemainingNr >= 10
        }

        return false
    }

    getPagesFromLink(link: string): number {

        // let nextPage = response.headers.get('Link').match(/<(.*?)>; rel="next"/);
        // nextPage = nextPage?.[1];

        if (link === '') { return 0; }
        var regex = /page=/g;
        var current: RegExpExecArray | null;
        let matchIndexes: number[] = [];

        while ((current = regex.exec(link)) != null) {
            matchIndexes.push(current.index);
        }

        var regex1 = />;/g;
        var matchIndexes1: number[] = [];

        while ((current = regex1.exec(link)) != null) {
            matchIndexes1.push(current.index);
        }

        return Number(link.substring(matchIndexes[1]! + 5, matchIndexes1[1]));
    }
}

export class GithubSyncServiceEventer extends EventEmitter {

    constructor(private db: PrismaClient) {
        super()

        if (this.db === undefined) {
            throw new Error("db: PrismaClient cannot be undefined");
        }
    }

    startSync(client: Octokit) {

        if (client === undefined || client === null) {
            throw new Error("client:Octokit cannot be undefined");
        }

        this.on("onFetchFromGithub", this.onFetchFromGithub)
        this.on("onFetchSinglePage", this.onFetchSinglePage)
        this.on("onSaveAllItemsPageToDb", this.onSaveAllItemsPageToDb)

        this.emit("onFetchFromGithub", { client })
    }

    reset() {
        this.removeAllListeners()
    }

    async onFetchFromGithub(event: { client: Octokit }) {
        console.log(`onFetchFromGithub`);

        const { client } = event

        const [error, response] = await wrapErr(client.rest.activity.listWatchedReposForAuthenticatedUser({ headers: { accept: "application/vnd.github.mercy-preview+json" } }))

        const pages: number = this.getPagesFromLink(response!.headers.link ?? '');

        this.emit("processStart", { pages })

        const rangePage = range(1, 2)

        for (const page of rangePage) {
            this.emit("onFetchSinglePage", { page, pages, client })
            await sleep(2000)
            console.log(`awaited 2000 after page: ${page}`)
        }

        this.reset()

        this.emit("processEnded", {})
    }

    async onFetchSinglePage(event: { page: number, pages: number, client: Octokit }) {

        const { page, pages, client } = event

        console.log(`onFetchSinglePage->${page}`);

        const [error, response] = await wrapErr(client.rest.activity.listWatchedReposForAuthenticatedUser({ headers: { accept: "application/vnd.github.mercy-preview+json" }, page }))

        const data = await Promise.all(response!.data.map(async repo => {
            return {
                repo: repo,
                topicmap: this.prepareTopicQuery(repo.topics),
                commits: await client.rest.repos.listCommits({ owner: repo.owner?.login, repo: repo.name, page: 1, per_page: 1 }),
                languages: await client.rest.repos.listLanguages({ owner: repo.owner.login ?? '', repo: repo.name })
            }
        }))

        const repoWithAggregate: IGithubDto[] = data.map(rawData => {

            const { repo, commits, languages } = rawData

            return {
                id: repo.id,
                name: repo.name,
                full_name: repo.full_name,
                html_url: repo.html_url,
                url: repo.url,
                description: repo.description,
                stargazers_count: repo.stargazers_count,
                avatar_url: repo.owner.avatar_url,
                latest_commit: commits.data[0]?.commit.author?.date,
                topics: repo.topics,
                languages: languages.data
            } as IGithubDto
        })

        this.emit("onSaveAllItemsPageToDb", { page, pages, data: repoWithAggregate })
    }

    async onSaveAllItemsPageToDb(event: { page: number, pages: number, data: IGithubDto[] }) {

        const { page, pages, data } = event

        console.log(`onSaveAllItemsPageToDb->data count: ${data.length}`);

        const results: { error: any, repoDbId: number | undefined }[] = []

        for (const repoDto of data) {
            console.log(`onSaveAllItemsPageToDb->page:${page}->repo:${repoDto.id}`);

            try {
                const repoDb = await this.db.githubRepo.upsert({
                    where: {
                        id: repoDto.id
                    },
                    create: {
                        id: repoDto.id,
                        name: repoDto.name,
                        full_name: repoDto.full_name,
                        html_url: repoDto.html_url,
                        url: repoDto.url,
                        description: repoDto.description,
                        stargazers_count: repoDto.stargazers_count,
                        avatar_url: repoDto.avatar_url,
                        latest_commit: repoDto.latest_commit,
                        topics: {
                            connectOrCreate: this.prepareTopicQuery(repoDto.topics)
                        },
                        languages: {
                            create: this.prepareLanguageQuery(repoDto.languages)
                        }
                    },
                    update: {
                        name: repoDto.name,
                        full_name: repoDto.full_name,
                        html_url: repoDto.html_url,
                        url: repoDto.url,
                        description: repoDto.description,
                        stargazers_count: repoDto.stargazers_count,
                        avatar_url: repoDto.avatar_url,
                        latest_commit: repoDto.latest_commit,
                        topics: {
                            connectOrCreate: this.prepareTopicQuery(repoDto.topics)
                        }
                    }
                })
            } catch (error) {
                if (error instanceof Prisma.PrismaClientKnownRequestError) {
                    console.log(JSON.stringify(error));
                }
                if (error instanceof Prisma.PrismaClientUnknownRequestError) {
                    console.log(JSON.stringify(error));
                }
                if (error instanceof Prisma.PrismaClientRustPanicError) {
                    console.log(JSON.stringify(error));
                }
                if (error instanceof Prisma.PrismaClientInitializationError) {
                    console.log(JSON.stringify(error));
                }
            }
        }

        this.emit("pageProcessed", { page, pages })
    }

    async saveOrUpdate(repoDto: IGithubDto) {
        return await wrapErr(this.db.githubRepo.upsert({
            where: {
                id: repoDto.id
            },
            create: {
                id: repoDto.id,
                name: repoDto.name,
                full_name: repoDto.full_name,
                html_url: repoDto.html_url,
                url: repoDto.url,
                description: repoDto.description,
                stargazers_count: repoDto.stargazers_count,
                avatar_url: repoDto.avatar_url,
                latest_commit: repoDto.latest_commit,
                topics: {
                    connectOrCreate: this.prepareTopicQuery(repoDto.topics)
                }
            },
            update: {
                name: repoDto.name,
                full_name: repoDto.full_name,
                html_url: repoDto.html_url,
                url: repoDto.url,
                description: repoDto.description,
                stargazers_count: repoDto.stargazers_count,
                avatar_url: repoDto.avatar_url,
                latest_commit: repoDto.latest_commit,
                topics: {
                    connectOrCreate: this.prepareTopicQuery(repoDto.topics)
                }
            }
        }))
    }

    getPagesFromLink(link: string): number {

        if (link === '') { return 0; }
        var regex = /page=/g;
        var current: RegExpExecArray | null;
        let matchIndexes: number[] = [];

        while ((current = regex.exec(link)) != null) {
            matchIndexes.push(current.index);
        }

        var regex1 = />;/g;
        var matchIndexes1: number[] = [];

        while ((current = regex1.exec(link)) != null) {
            matchIndexes1.push(current.index);
        }

        return Number(link.substring(matchIndexes[1]! + 5, matchIndexes1[1]));
    }

    prepareLanguageQuery(languages?: { [key: string]: number }): { language: string, bytes: number }[] {
        return languages ? Object.entries(languages!).map(([key, value]) => ({ language: key, bytes: value })) : []
    }

    prepareTopicQuery(topics?: string[]): { where: { value: string }, create: { value: string } }[] {
        const t = topics!.map(topic => ({ where: { value: topic }, create: { value: topic } }))
        return topics ?
            topics!.map(topic => ({ where: { value: topic }, create: { value: topic } }))
            :
            []
    }
}

export class GithubSyncService extends EventEmitter {

    private client: Octokit

    constructor(private db: PrismaClient) {
        super();
    }

    setOctokit(client: Octokit) {
        this.client = client
    }

    async start() {

        let canProceed = await this.rateLimitGuard()

        if (!canProceed) {
            this.emit("sync-process-end", { message: "rate limit near to be hit.", completed: false })
            return
        }

        const pages: number[] = await this.processPagesStep();

        this.emit("sync-process-start", { pages: pages.length })

        for (const page of pages) {

            let canProceed = await this.rateLimitGuard()

            if (!canProceed) {
                this.emit("sync-process-end", { message: "rate limit near to be hit.", completed: false })
                return;
            }

            const ghApiRepoList = await this.processGetItemsPageStep(page)

            canProceed = await this.rateLimitGuard()

            if (!canProceed) {
                this.emit("sync-process-end", { message: "rate limit near to be hit.", completed: false })
                return;
            }

            for (const ghApiRepo of ghApiRepoList) {

                const ghApiAggregate: IGhApiAggregate = await this.prepareItemStep(ghApiRepo);

                canProceed = await this.rateLimitGuard()

                if (!canProceed) {
                    this.emit("sync-process-end", { message: "rate limit near to be hit.", completed: false })
                    return;
                }

                const dto: IGithubDto = await this.transformItemStep(ghApiAggregate)

                canProceed = await this.rateLimitGuard()

                if (!canProceed) {
                    this.emit("sync-process-end", { message: "rate limit near to be hit.", completed: false })
                    return;
                }

                const result: GithubRepo | undefined = await this.saveItemToDbStep(dto)

                canProceed = await this.rateLimitGuard()

                if (!canProceed) {
                    this.emit("sync-process-end", { message: "rate limit near to be hit.", completed: false })
                    return;
                }
            }

            this.emit("sync-page-end", { page, pages: pages.length })
        }

        this.emit("sync-process-end", { message: "", completed: true })
    }

    async processPagesStep() {
        const [error, response] = await wrapErr(this.client.rest.activity.listWatchedReposForAuthenticatedUser({ headers: { accept: "application/vnd.github.mercy-preview+json" } }))

        const pages: number = this.getPagesFromLink(response!.headers.link ?? '');

        const rangePage = range(1, pages)

        return rangePage
    }

    async processGetItemsPageStep(page: number) {
        console.log(`STEP 2 => processGetItemsPageStep => ${page}`);

        const [error, response] = await wrapErr(this.client.rest.activity.listWatchedReposForAuthenticatedUser({ headers: { accept: "application/vnd.github.mercy-preview+json" }, page }))

        return response?.data as IGhApiRepo[]
    }

    async prepareItemStep(repo: IGhApiRepo): Promise<IGhApiAggregate> {
        console.log(`STEP 3 => prepareItemStep => ${repo.id}`);

        const commits = await this.client.rest.repos.listCommits({ owner: repo.owner?.login!, repo: repo.name!, page: 1, per_page: 1 })

        const languages = await this.client.rest.repos.listLanguages({ owner: repo.owner!.login ?? '', repo: repo.name! })

        return <IGhApiAggregate>{
            repo, commits: commits.data! as IGhAPICommit[], languages: languages.data
        }
    }

    async transformItemStep(aggregate: IGhApiAggregate) {
        console.log(`STEP 4 => transformItemStep => ${aggregate.repo.id}`);

        const dto: IGithubDto = repoApiToDto(aggregate)

        return dto
    }

    async saveItemToDbStep(repo: IGithubDto): Promise<GithubRepo | undefined> {
        console.log(`STEP 5 => saveItemToDbStep => ${repo.id}`);

        try {
            const repoDb = await this.db.githubRepo.upsert({
                where: {
                    id: repo.id
                },
                create: {
                    id: repo.id,
                    name: repo.name,
                    full_name: repo.full_name,
                    html_url: repo.html_url,
                    url: repo.url,
                    description: repo.description,
                    stargazers_count: repo.stargazers_count,
                    avatar_url: repo.avatar_url,
                    latest_commit: repo.latest_commit,
                    topics: {
                        connectOrCreate: this.prepareTopicQuery(repo.topics)
                    },
                    languages: {
                        create: this.prepareLanguageQuery(repo.languages)
                    }
                },
                update: {
                    name: repo.name,
                    full_name: repo.full_name,
                    html_url: repo.html_url,
                    url: repo.url,
                    description: repo.description,
                    stargazers_count: repo.stargazers_count,
                    avatar_url: repo.avatar_url,
                    latest_commit: repo.latest_commit,
                    topics: {
                        connectOrCreate: this.prepareTopicQuery(repo.topics)
                    }
                }
            })

            return repoDb

        } catch (error) {

            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                console.log(JSON.stringify(error));
            }
            if (error instanceof Prisma.PrismaClientUnknownRequestError) {
                console.log(JSON.stringify(error));
            }
            if (error instanceof Prisma.PrismaClientRustPanicError) {
                console.log(JSON.stringify(error));
            }
            if (error instanceof Prisma.PrismaClientInitializationError) {
                console.log(JSON.stringify(error));
            }

            console.log(JSON.stringify(repo));

            return undefined
        }
    }

    async rateLimitGuard() {
        const ratelimit = await this.client.request("GET /rate_limit")

        return ratelimit.data.rate.remaining >= 5
    }

    getPagesFromLink(link: string): number {

        console.log(link)

        if (link === '') { return 0; }
        var regex = /page=/g;
        var current: RegExpExecArray | null;
        let matchIndexes: number[] = [];

        while ((current = regex.exec(link)) != null) {
            matchIndexes.push(current.index);
        }

        var regex1 = />;/g;
        var matchIndexes1: number[] = [];

        while ((current = regex1.exec(link)) != null) {
            matchIndexes1.push(current.index);
        }

        return Number(link.substring(matchIndexes[1]! + 5, matchIndexes1[1]));

        // let nextPage = link.match(/<(.*?)>; rel="next"/);
        // nextPage = nextPage?.[1];

        // url = nextPage;


    }

    prepareTopicQuery(topics?: string[]): { where: { value: string }, create: { value: string } }[] {
        return topics ?
            topics!.map(topic => ({ where: { value: topic }, create: { value: topic } }))
            :
            []
    }

    prepareLanguageQuery(languages?: { [key: string]: number }): { language: string, bytes: number }[] {
        return languages ? Object.entries(languages!).map(([key, value]) => ({ language: key, bytes: value })) : []
    }
}