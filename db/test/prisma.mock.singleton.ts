import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'

import db from '..'

jest.mock('..', () => ({
    __esModule: true,
    default: mockDeep<PrismaClient>(),
}))

beforeEach(() => {
    mockReset(prismaMockSingleton)
})

export const prismaMockSingleton = db as unknown as DeepMockProxy<PrismaClient>