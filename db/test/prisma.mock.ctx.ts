import { PrismaClient } from '@prisma/client'
import { mockDeep, DeepMockProxy } from 'jest-mock-extended'

// jest.mock('..', () => ({
//     __esModule: true,
//     default: mockDeep<PrismaClient>(),
// }))

// export const prismaMock = db as unknown as DeepMockProxy<PrismaClient>

export type Context = {
    prisma: PrismaClient
}

export type MockContext = {
    prisma: DeepMockProxy<PrismaClient>
}

export const createMockContext = (): MockContext => {
    return {
        prisma: mockDeep<PrismaClient>(),
    }
}