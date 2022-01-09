import { User } from "db";
import { Context, createMockContext, MockContext } from "db/test";
import { setupServer, SetupServerApi } from 'msw/node';
import { Octokit } from "octokit";
import { GithubAuthService } from "server/github/services";
import { Secure } from "../services/secure.service";
import { userHandler } from "./githubApiServerStubHandler";

jest.mock('../services/secure.service')


const secureMock = Secure as jest.MockedClass<typeof Secure>
// const secureMock: jest.Mocked<Secure> = new Secure() as jest.Mocked<Secure>;
// const secureMock: jest.Mocked<Secure> = { encrypt: jest.fn(), decrypt: jest.fn() }

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
    it('should not save OAuth user to db when token param is not set', async () => {
        const service: GithubAuthService = new GithubAuthService(ctx.prisma, secureMock.prototype)

        await expect(service.secureThenSaveOauthUser('', 'fake@mail.com', 'fakename')).rejects.toThrow();
    });
    it('should save OAuth user to db when params are correct', async () => {

        secureMock.prototype.encrypt.mockImplementationOnce((value) => {
            return encrypted
        })

        const userDbStub: User = {
            id: 1000,
            hashedPassword: encrypted,
            email: 'fake@mail.com',
            name: 'fakename',
            createdAt: new Date(),
            updatedAt: new Date(),
            role: ''
        }

        mockCtx.prisma.user.upsert.mockResolvedValue(userDbStub);

        const service: GithubAuthService = new GithubAuthService(ctx.prisma, secureMock.prototype)

        const userDb = await service.secureThenSaveOauthUser(tobeencrypted, 'fake@mail.com', 'fakename');

        expect(mockCtx.prisma.user.upsert).toBeCalledTimes(1)

        expect(secureMock.prototype.encrypt).toHaveBeenCalledTimes(1);

        expect(userDb.id).toBe(userDbStub.id)

    });
    it('should authenticate against to Github when sessionId correspond to OAuth user', async () => {

        worker = setupServer(userHandler())

        worker.listen()

        secureMock.prototype.decrypt.mockImplementationOnce((value) => {
            return 'stubbed'
        })

        const userDbStub: User = {
            id: 1,
            hashedPassword: encrypted,
            email: 'fake@mail.com',
            name: 'fakename',
            createdAt: new Date(),
            updatedAt: new Date(),
            role: ''
        }

        mockCtx.prisma.user.findFirst.mockResolvedValueOnce(userDbStub);

        const service: GithubAuthService = new GithubAuthService(ctx.prisma, secureMock.prototype)

        await expect(service.authenticateGithubBySessionId(1)).resolves.toBe(true);

        expect(secureMock.prototype.decrypt).toHaveBeenCalledTimes(1);
    });

    it('should not authenticate against to Github when sessionId not correspond to OAuth user', async () => {

        worker = setupServer(userHandler())

        worker.listen()

        const userDbStub: User | null = null

        mockCtx.prisma.user.findFirst.mockResolvedValueOnce(userDbStub);

        const service: GithubAuthService = new GithubAuthService(ctx.prisma, secureMock.prototype)

        await expect(service.authenticateGithubBySessionId(1)).resolves.toBe(false);
    });
});