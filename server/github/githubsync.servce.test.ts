import { ISyncServiceTest, SyncServiceTest } from "./servicetest";

const mock = jest.fn<SyncServiceTest, []>(() => ({
    process: jest.fn().mockReturnValue("test")
}))

// jest.mock("./servicetest")



describe('GithubSyncService', () => {
    it('should ', () => {
        const mocked = new mock()

        const result = mocked.process("jdjdjdj", 83838);

        expect(result).toBe("test")
    });
})
