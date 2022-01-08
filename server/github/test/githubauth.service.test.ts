import { User } from "db";
import { Context, createMockContext, MockContext } from "db/test";
import { Octokit } from "octokit";
import { GithubAuthService } from "server/github";
import { setupServer, SetupServerApi } from 'msw/node'
import { commitsHandler, languagesHandler, rateLimitNotOkHandler, rateLimitOkHandler, subscriptionsHandler, userHandler } from "./githubApiServerStubHandler";
import { Secure } from "../githubauth.service";

jest.mock('../githubauth.service')

const secureMock = Secure as jest.MockedClass<typeof Secure>
const myApi = new Secure() as jest.Mocked<Secure>;

let worker: SetupServerApi
let mockCtx: MockContext
let ctx: Context
const client = new Octokit({ auth: 'aSuperFakeTokenStubbedByMsw' })
const tobeencrypted = 'testtobeencrypt'
const encrypted = '8c223ea342d96de2353608c482160e82.e0ba5363e08e8545487d1c184ba91d34'
const env: string = process.env.APP_HASH_SECRET!

beforeEach(() => {
    mockCtx = createMockContext()
    ctx = mockCtx as unknown as Context
})

afterEach(() => {
    process.env.APP_HASH_SECRET = env
})

describe('GithubAuthService', () => {
    it('should encrypt value when APP_HASH_SECRET env is set', () => {
        const service: GithubAuthService = new GithubAuthService(ctx.prisma)

        const result: string = service.encrypt(tobeencrypted)

        expect(result).toContain('.')
    });
    it('should throw exception when APP_HASH_SECRET env is not set', () => {

        delete process.env.APP_HASH_SECRET

        const service: GithubAuthService = new GithubAuthService(ctx.prisma)

        expect(service.encrypt).toThrow()
    });
    it('should throw exception when value parameter is empty', () => {

        const service: GithubAuthService = new GithubAuthService(ctx.prisma)

        expect(() => service.encrypt('')).toThrow()
    });
    it('should decrypt when env and parameters are valid', () => {

        const service: GithubAuthService = new GithubAuthService(ctx.prisma)

        const decrypted = service.decrypt(encrypted);

        expect(decrypted).toBe(tobeencrypted)
    });
    it('should throw exception when APP_HASH_SECRET env is not set', () => {

        delete process.env.APP_HASH_SECRET

        const service: GithubAuthService = new GithubAuthService(ctx.prisma)

        expect(service.decrypt).toThrow()
    });
    it('should throw exception when value parameter is empty', () => {

        const service: GithubAuthService = new GithubAuthService(ctx.prisma)

        expect(() => service.decrypt('')).toThrow()
    });
    it('should throw exception when value parameter does not contains dot', () => {

        const service: GithubAuthService = new GithubAuthService(ctx.prisma)

        expect(() => service.decrypt('8c223ea342d96de2353608c482160e82')).toThrow()
    });
    it('should save OAuth user to db when params are correct', async () => {

        const userDbMock: User = {
            id: 1000,
            hashedPassword: encrypted,
            email: 'fake@mail.com',
            name: 'fakename',
            createdAt: new Date(),
            updatedAt: new Date(),
            role: ''
        }

        mockCtx.prisma.user.upsert.mockResolvedValue(userDbMock);

        const service: GithubAuthService = new GithubAuthService(ctx.prisma)

        const userDb = await service.secureThenSaveOauthUser(tobeencrypted, 'fake@mail.com', 'fakename');

        expect(mockCtx.prisma.user.upsert).toBeCalledTimes(1)

        expect(userDb.id).toBe(userDbMock.id)

    });
    it('should ', async () => {

        worker = setupServer(userHandler())

        worker.listen()

        const service: GithubAuthService = new GithubAuthService(ctx.prisma)

        const lo = secureMock.mock.instances[0]!


        const authenticated = await service.authenticateGithubBySessionId(1);
    });
});