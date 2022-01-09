import { PrismaClient, User } from "db";
import { Octokit } from "octokit";
import { Secure } from "server/github/services";
import { wrapErr } from "shared/lib";

export class GithubAuthService {

    private client: Octokit

    constructor(private db: PrismaClient, private secure: Secure) {

    }

    async authenticateGithubBySessionId(sessionUserId: number): Promise<boolean> {

        const user: User | null = await this.db.user.findFirst({
            where: {
                id: sessionUserId
            }
        })

        if (user === null) {
            return false
        }

        this.client = new Octokit({ auth: this.secure.decrypt(user!.hashedPassword!) })

        const [error, authentication] = await wrapErr(this.client.rest.users.getAuthenticated())

        if (authentication?.status !== 200) {
            return false
        }

        return true
    }

    async secureThenSaveOauthUser(token: string, email: string, displayName: string): Promise<User> {

        if (!token || token === '') {
            throw new Error("token parameter not set");
        }

        const secured = this.secure.encrypt(token)

        const userDb: User = await this.db.user.upsert({
            where: {
                email
            },
            create: {
                email,
                name: displayName,
                hashedPassword: secured
            },
            update: {
                email,
                name: displayName,
                hashedPassword: secured
            }
        })

        return userDb
    }

    getClient(): Octokit {
        return this.client
    }
}