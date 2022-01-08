import { Octokit } from "octokit";
import { GithubSyncService, GithubSyncServiceGenerator } from 'server/github';
import { closeGithubApiServerStub, resetHandlersServerStub, listenGithubApiServerStub } from "./githubApiServerStub";
import { createMockContext, Context, MockContext, prismaMockSingleton } from 'db/test'
import { GithubRepoLanguage, GithubRepoTopics, PrismaClient } from 'db'
import fs from 'fs'
import path from 'path'
import { GhApiRepoConvert } from "../converters/GhApiRepoConvert";
import { IGhApiAggregate, IGhAPICommit, IGhApiRepo } from "../githubapi.model";
import { repoApiToDto, repoDbToDto } from "shared/mappers";
import { GithubRepo } from 'db'
import { IGithubDto } from "shared/models";
import { GhApiCommitConverter } from "server/github/converters";
import { setupServer, SetupServerApi } from 'msw/node'
import { commitsHandler, languagesHandler, rateLimitNotOkHandler, rateLimitOkHandler, subscriptionsHandler, userHandler } from "./githubApiServerStubHandler";

let worker: SetupServerApi
let mockCtx: MockContext
let ctx: Context
let apiResponseSubscriptions: string
let apiRepoList: IGhApiRepo[]
let apiCommitList: IGhAPICommit[]
let apiLanguageList: { [key: string]: number }
const client = new Octokit({ auth: 'aSuperFakeTokenStubbedByMsw' })

beforeAll(() => {

    // worker.listen()

    apiResponseSubscriptions = fs.readFileSync(path.join(__dirname, './fixtures/api.github.com.user.subscriptions.json'), 'utf-8')

    apiRepoList = GhApiRepoConvert.toRepo(apiResponseSubscriptions)

    const apiResponseCommits = fs.readFileSync(path.join(__dirname, './fixtures/api.github.com.repo.commit.json'), 'utf-8');

    apiCommitList = GhApiCommitConverter.toIGhAPICommit(apiResponseCommits)

    const apiLanguage = fs.readFileSync(path.join(__dirname, './fixtures/api.github.com.repo.languages.json'), 'utf-8')

    apiLanguageList = JSON.parse(apiLanguage)
})

beforeEach(() => {
    mockCtx = createMockContext()
    ctx = mockCtx as unknown as Context
})

afterEach(() => {
    worker.resetHandlers()
})

afterAll(() => {
    worker.close()
})

describe('GithubSyncService', () => {

    it('should emit start,progress,end sync events when executing sync process without any errors', async () => {

        worker = setupServer(userHandler(), subscriptionsHandler(), commitsHandler(), languagesHandler(), rateLimitOkHandler())

        worker.listen()

        const service: GithubSyncService = new GithubSyncService(ctx.prisma)

        let firedStart: boolean = false
        let firedEnd: boolean = false
        let firedProgress: boolean = false


        service.on("sync-process-start", () => {
            firedStart = true
        })

        service.on("sync-page-end", () => {
            firedProgress = true
        })

        service.on("sync-process-end", () => {
            firedEnd = true
        })

        service.setOctokit(client)

        await service.start();

        expect(firedStart).toBeTruthy()
        expect(firedProgress).toBeTruthy()
        expect(firedEnd).toBeTruthy()
    });

    it('should emit start,progress,end sync events when executing sync process without any errors', async () => {

        worker = setupServer(userHandler(), subscriptionsHandler(), commitsHandler(), languagesHandler(), rateLimitNotOkHandler())

        worker.listen()

        const service: GithubSyncService = new GithubSyncService(ctx.prisma)

        let firedEnd: boolean = false
        let eventFired: { message?: string, completed?: boolean } = {}
        let eventFiredExpected: { message?: string, completed?: boolean } = { completed: false, message: "rate limit near to be hit." }

        service.on("sync-process-end", (event: { message: string, completed: boolean }) => {
            firedEnd = true
            eventFired = event
        })

        service.setOctokit(client)

        await service.start();

        expect(firedEnd).toBeTruthy()
        expect(eventFired).toStrictEqual(eventFiredExpected)
    });

    it('should retrieve page list subscription when user is authenticated', async () => {

        worker = setupServer(userHandler(), subscriptionsHandler(), commitsHandler(), languagesHandler(), rateLimitOkHandler())

        worker.listen()

        const service: GithubSyncService = new GithubSyncService(ctx.prisma)

        service.setOctokit(client)

        const pageList = await service.processPagesStep();

        expect(pageList).toHaveLength(2)
    });

    it('should retrieve list of subscribed repo by the page', async () => {

        worker = setupServer(userHandler(), subscriptionsHandler(), commitsHandler(), languagesHandler(), rateLimitOkHandler())

        worker.listen()

        const service: GithubSyncService = new GithubSyncService(ctx.prisma)

        service.setOctokit(client)

        const repoList: IGhApiRepo[] = await service.processGetItemsPageStep(1)

        expect(apiRepoList).toStrictEqual(repoList)
    });

    it('should compose api aggregate from api repo model', async () => {

        worker = setupServer(userHandler(), subscriptionsHandler(), commitsHandler(), languagesHandler(), rateLimitOkHandler())

        worker.listen()

        const service: GithubSyncService = new GithubSyncService(ctx.prisma)

        service.setOctokit(client)

        const repo: IGhApiRepo = apiRepoList[0]!

        const apiAggregateExpected: IGhApiAggregate = {
            repo,
            commits: apiCommitList,
            languages: apiLanguageList
        }

        const apiAggregate: IGhApiAggregate = await service.prepareItemStep(repo)

        expect(apiAggregateExpected).toStrictEqual(apiAggregate)
    });

    it('should transform api aggregate parameter to dto when aggregate has all data', async () => {

        worker = setupServer(userHandler(), subscriptionsHandler(), commitsHandler(), languagesHandler(), rateLimitOkHandler())

        worker.listen()

        const service: GithubSyncService = new GithubSyncService(ctx.prisma)

        const aggregate: IGhApiAggregate = {
            repo: apiRepoList[0]!,
            commits: apiCommitList,
            languages: {
                "Typescript": 300,
                "Javascript": 10000,
                "Html": 1290
            }
        }

        const expectedDto: IGithubDto = {
            id: 1661758,
            name: "node-restify",
            full_name: "restify/node-restify",
            html_url: "https://github.com/restify/node-restify",
            url: "https://api.github.com/repos/restify/node-restify",
            description: "The future of Node.js REST development",
            stargazers_count: 10337,
            avatar_url: "https://avatars.githubusercontent.com/u/6948699?v=4",
            latest_commit: "2011-04-14T16:00:49Z",
            topics: ["rest-api", "restify", "server"],
            languages: { "Typescript": 300, "Javascript": 10000, "Html": 1290 }
        }

        const dto: IGithubDto = await service.transformItemStep(aggregate);

        expect(dto).toStrictEqual(expectedDto)
    });

    it('should upsert repo model when parameter dto has all valid data', async () => {

        worker = setupServer(userHandler(), subscriptionsHandler(), commitsHandler(), languagesHandler(), rateLimitOkHandler())

        worker.listen()

        const apiRepo: IGhApiRepo = apiRepoList[0]!

        const repoDbSnapshot: GithubRepo & {
            topics: GithubRepoTopics[]; languages?: GithubRepoLanguage[];
        } = {
            myId: 0,
            id: apiRepo.id!,
            description: apiRepo.description!,
            avatar_url: apiRepo.owner?.avatar_url!,
            name: apiRepo.name!,
            stargazers_count: apiRepo.stargazers_count!,
            full_name: apiRepo.full_name!,
            html_url: apiRepo.html_url!,
            latest_commit: "",
            url: apiRepo.url!,
            topics: [{ id: 100, value: "restapi" }],
            languages: [{ id: 1001, language: "Javascript", repoId: 1, bytes: 500 }]
        }

        const repoDbResult: GithubRepo = {
            myId: 45,
            id: apiRepo.id!,
            description: apiRepo.description!,
            avatar_url: apiRepo.owner?.avatar_url!,
            name: apiRepo.name!,
            stargazers_count: apiRepo.stargazers_count!,
            full_name: apiRepo.full_name!,
            html_url: apiRepo.html_url!,
            latest_commit: "fake string",
            url: apiRepo.url!,
        }

        const repoDto: IGithubDto = repoDbToDto(repoDbSnapshot)

        mockCtx.prisma.githubRepo.upsert.mockResolvedValue(repoDbResult);

        const service: GithubSyncService = new GithubSyncService(ctx.prisma)

        const result: GithubRepo | undefined = await service.saveItemToDbStep(repoDto)

        expect(mockCtx.prisma.githubRepo.upsert).toBeCalledTimes(1)

        expect(result).not.toBe(undefined)

        expect(result).toStrictEqual(repoDbResult)
    });

    it('should upsert repo model when parameter dto has not all valid data', async () => {

        worker = setupServer(userHandler(), subscriptionsHandler(), commitsHandler(), languagesHandler(), rateLimitOkHandler())

        worker.listen()

        const apiRepo: IGhApiRepo = apiRepoList[0]!

        const repoDbSnapshot: GithubRepo & {
            languages?: GithubRepoLanguage[];
        } = {
            myId: 0,
            id: apiRepo.id!,
            description: apiRepo.description!,
            avatar_url: apiRepo.owner?.avatar_url!,
            name: apiRepo.name!,
            stargazers_count: apiRepo.stargazers_count!,
            full_name: apiRepo.full_name!,
            html_url: apiRepo.html_url!,
            latest_commit: "",
            url: apiRepo.url!,
            languages: [{ id: 1001, language: "Javascript", repoId: 1, bytes: 500 }]
        }

        const repoDbResult: GithubRepo = {
            myId: 45,
            id: apiRepo.id!,
            description: apiRepo.description!,
            avatar_url: apiRepo.owner?.avatar_url!,
            name: apiRepo.name!,
            stargazers_count: apiRepo.stargazers_count!,
            full_name: apiRepo.full_name!,
            html_url: apiRepo.html_url!,
            latest_commit: "fake string",
            url: apiRepo.url!,
        }

        const repoDto: IGithubDto = repoDbToDto(repoDbSnapshot)

        mockCtx.prisma.githubRepo.upsert.mockResolvedValue(repoDbResult);

        const service: GithubSyncService = new GithubSyncService(ctx.prisma)

        const result: GithubRepo | undefined = await service.saveItemToDbStep(repoDto)

        expect(mockCtx.prisma.githubRepo.upsert).toBeCalledTimes(1)

        expect(result).not.toBe(undefined)

        expect(result).toStrictEqual(repoDbResult)
    });

    it('should not guard ratelimit when github api rate limit its not near to be hitten', async () => {

        worker = setupServer(userHandler(), subscriptionsHandler(), commitsHandler(), languagesHandler(), rateLimitOkHandler())

        worker.listen()

        const service: GithubSyncService = new GithubSyncService(ctx.prisma)

        service.setOctokit(client)

        const guard = await service.rateLimitGuard();

        expect(guard).toBeTruthy()
    });

    it('should guard ratelimit when github api rate limit its near to be hitten', async () => {

        worker = setupServer(userHandler(), subscriptionsHandler(), commitsHandler(), languagesHandler(), rateLimitNotOkHandler())

        worker.listen()

        const service: GithubSyncService = new GithubSyncService(ctx.prisma)

        service.setOctokit(client)

        const guard = await service.rateLimitGuard();

        expect(guard).toBeFalsy()
    });
})
