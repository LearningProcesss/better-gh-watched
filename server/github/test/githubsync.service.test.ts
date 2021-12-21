import { Octokit } from "octokit";
import { GithubSyncService } from '..';
import { githubApiServerStub } from "./githubApiServerStub";
import { createMockContext, Context, MockContext, prismaMockSingleton } from 'db/test'
import { GithubRepoLanguage, GithubRepoTopics, PrismaClient } from 'db'
import fs from 'fs'
import path from 'path'
import { GhApiRepoConvert } from "../mappers";
import { IGhApiAggregate, IGhApiRepo } from "../githubapi.model";
import { repoApiToDto, repoDbToDto } from "shared/mappers";
import { GithubRepo } from 'db'
import { IGithubDto } from "shared/models";

// const mock = jest.fn<SyncServiceTest, []>(() => ({
//     process: jest.fn().mockReturnValue("test")
// }))

// jest.mock('../servicetest')

// const syncServiceTestMock = new SyncServiceTest() as jest.Mocked<SyncServiceTest>;
// syncServiceTestMock.process.mockReturnValue("")

githubApiServerStub()

let mockCtx: MockContext
let ctx: Context
let apiResponseSubscriptions: string
let apiRepoList: IGhApiRepo[]

beforeAll(() => {
    apiResponseSubscriptions = fs.readFileSync(path.join(__dirname, './fixtures/api.github.com.user.subscriptions.json'), 'utf-8')

    apiRepoList = GhApiRepoConvert.toRepo(apiResponseSubscriptions)
})

beforeEach(() => {
    mockCtx = createMockContext()
    ctx = mockCtx as unknown as Context
})

describe('GithubSyncService', () => {

    it('should saveItemToDbStep - upsert GithubRepo by a IGithubDto object', async () => {

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

        const syncService: GithubSyncService = new GithubSyncService(ctx.prisma)

        for await (const iterator of syncService.saveItemToDbStep(repoDto)) {
            expect(mockCtx.prisma.githubRepo.upsert).toBeCalledTimes(1)
            expect(iterator as GithubRepo).toStrictEqual(repoDbResult)
        }
    });

    it('should saveItemToDbStep - upsert GithubRepo by a partial (no topic) IGithubDto object', async () => {

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

        const syncService: GithubSyncService = new GithubSyncService(ctx.prisma)

        //da testare come risultato che non vada in eccezione se topic o lang non ci sono
        for await (const iterator of syncService.saveItemToDbStep(repoDto)) {
            expect(mockCtx.prisma.githubRepo.upsert).toBeCalledTimes(1)
            expect(iterator as GithubRepo).toStrictEqual(repoDbResult)
        }
    });

    it('should transformItemStep', async () => {
        const syncService: GithubSyncService = new GithubSyncService(ctx.prisma)

        const aggregate: IGhApiAggregate = {
            repo: apiRepoList[0]!,
            commits: [{
                "sha": "4d404d47145a02ed0d79a518d1fc34c0c0b0fc12",
                "node_id": "C_kwDOABlbPtoAKDRkNDA0ZDQ3MTQ1YTAyZWQwZDc5YTUxOGQxZmMzNGMwYzBiMGZjMTI",
                "commit": {
                    "author": {
                        "name": "Joey Harrington",
                        "email": "dev@jharring.com",
                        "date": "2021-11-23T21:45:14Z"
                    },
                    "committer": {
                        "name": "GitHub",
                        "email": "noreply@github.com",
                        "date": "2021-11-23T21:45:14Z"
                    },
                    "message": "docs: fix handleUncaughtExceptions docs typos (#1885)\n\nThere are a few lines in docs for `handleUncaughtExceptions` option,\r\nboth in markdown docs and in jsdoc, which seem irrelevant and\r\ndisconnected. This appears to be a mistake that has been copied to\r\nseveral places.",
                    "tree": {
                        "sha": "05c907502bcf66267e92fe89287f0ec5b82e0afc",
                        "url": "https://api.github.com/repos/restify/node-restify/git/trees/05c907502bcf66267e92fe89287f0ec5b82e0afc"
                    },
                    "url": "https://api.github.com/repos/restify/node-restify/git/commits/4d404d47145a02ed0d79a518d1fc34c0c0b0fc12",
                    "comment_count": 0,
                    "verification": {
                        "verified": true,
                        "reason": "valid",
                        "signature": "-----BEGIN PGP SIGNATURE-----\n\nwsBcBAABCAAQBQJhnWDqCRBK7hj4Ov3rIwAAjOUIACi8izN7wExhV1sPJUrUovCY\ntzKa1hgQNiGrKy0/EHh8rruOjnKHhxiuyAEh4AFAtBkkFU+l4FVi+xF/VzXh6yft\nMsNPS9+Nirf6K2GkoBbYcbNnBmw1iG/ZXTFIsGf4DDI0qUliv82gkqPGLXE98mMJ\nXbRZPNlELTf9nFCaDeQBxo6Zf11wK1/L+zIT1IIPWmChpqfKr8wdIKhp+78ug3hZ\nTA+kM35mnzblbDL9LSgvhVKQnuszUaeXUuMnP20koxtGK8YDkksz7gGdt7xUH34+\nkRs5syUHp3W88h7E/BdM0OK698MQTPRqQJcguxYb+igtZL8YhfvfCEn8l6YhYA8=\n=6sE8\n-----END PGP SIGNATURE-----\n",
                        "payload": "tree 05c907502bcf66267e92fe89287f0ec5b82e0afc\nparent 71c7f4965342c13cac55847f87149cc34c1ad566\nauthor Joey Harrington <dev@jharring.com> 1637703914 -0800\ncommitter GitHub <noreply@github.com> 1637703914 -0800\n\ndocs: fix handleUncaughtExceptions docs typos (#1885)\n\nThere are a few lines in docs for `handleUncaughtExceptions` option,\r\nboth in markdown docs and in jsdoc, which seem irrelevant and\r\ndisconnected. This appears to be a mistake that has been copied to\r\nseveral places."
                    }
                },
                "url": "https://api.github.com/repos/restify/node-restify/commits/4d404d47145a02ed0d79a518d1fc34c0c0b0fc12",
                "html_url": "https://github.com/restify/node-restify/commit/4d404d47145a02ed0d79a518d1fc34c0c0b0fc12",
                "comments_url": "https://api.github.com/repos/restify/node-restify/commits/4d404d47145a02ed0d79a518d1fc34c0c0b0fc12/comments",
                "author": {
                    "login": "josephharrington",
                    "id": 1109303,
                    "node_id": "MDQ6VXNlcjExMDkzMDM=",
                    "avatar_url": "https://avatars.githubusercontent.com/u/1109303?v=4",
                    "gravatar_id": "",
                    "url": "https://api.github.com/users/josephharrington",
                    "html_url": "https://github.com/josephharrington",
                    "followers_url": "https://api.github.com/users/josephharrington/followers",
                    "following_url": "https://api.github.com/users/josephharrington/following{/other_user}",
                    "gists_url": "https://api.github.com/users/josephharrington/gists{/gist_id}",
                    "starred_url": "https://api.github.com/users/josephharrington/starred{/owner}{/repo}",
                    "subscriptions_url": "https://api.github.com/users/josephharrington/subscriptions",
                    "organizations_url": "https://api.github.com/users/josephharrington/orgs",
                    "repos_url": "https://api.github.com/users/josephharrington/repos",
                    "events_url": "https://api.github.com/users/josephharrington/events{/privacy}",
                    "received_events_url": "https://api.github.com/users/josephharrington/received_events",
                    "type": "User",
                    "site_admin": false
                },
                "committer": {
                    "login": "web-flow",
                    "id": 19864447,
                    "node_id": "MDQ6VXNlcjE5ODY0NDQ3",
                    "avatar_url": "https://avatars.githubusercontent.com/u/19864447?v=4",
                    "gravatar_id": "",
                    "url": "https://api.github.com/users/web-flow",
                    "html_url": "https://github.com/web-flow",
                    "followers_url": "https://api.github.com/users/web-flow/followers",
                    "following_url": "https://api.github.com/users/web-flow/following{/other_user}",
                    "gists_url": "https://api.github.com/users/web-flow/gists{/gist_id}",
                    "starred_url": "https://api.github.com/users/web-flow/starred{/owner}{/repo}",
                    "subscriptions_url": "https://api.github.com/users/web-flow/subscriptions",
                    "organizations_url": "https://api.github.com/users/web-flow/orgs",
                    "repos_url": "https://api.github.com/users/web-flow/repos",
                    "events_url": "https://api.github.com/users/web-flow/events{/privacy}",
                    "received_events_url": "https://api.github.com/users/web-flow/received_events",
                    "type": "User",
                    "site_admin": false
                },
                "parents": [
                    {
                        "sha": "71c7f4965342c13cac55847f87149cc34c1ad566",
                        "url": "https://api.github.com/repos/restify/node-restify/commits/71c7f4965342c13cac55847f87149cc34c1ad566",
                        "html_url": "https://github.com/restify/node-restify/commit/71c7f4965342c13cac55847f87149cc34c1ad566"
                    }
                ]
            }],
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
            latest_commit: "2021-11-23T21:45:14Z",
            topics: ["rest-api", "restify", "server"],
            languages: { "Typescript": 300, "Javascript": 10000, "Html": 1290 }
        }

        const iterator = syncService.transformItemStep(aggregate);

        const result = await iterator.next()

        const dto = result.value as IGithubDto

        expect(dto).toStrictEqual(expectedDto)
    });
})