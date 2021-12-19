import { PrismaClient, User } from "db";
import { Octokit } from "octokit";
import { wrapErr } from "shared/lib";

export class GithubAuthService {

    private client: Octokit

    constructor(private db: PrismaClient) {

    }

    async authenticate(sessionUserId: number): Promise<boolean> {

        const user: User | null = await this.db.user.findFirst({
            where: {
                id: sessionUserId
            }
        })

        if (user === null) {
            return false
        }

        this.client = new Octokit({ auth: user!.hashedPassword })

        const [error, authentication] = await wrapErr(this.client.rest.users.getAuthenticated())

        if (authentication?.status !== 200) {
            return false
        }

        return true
    }

    getClient(): Octokit {
        return this.client
    }
}