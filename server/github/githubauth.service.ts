import { PrismaClient, User } from "db";
import { Octokit } from "octokit";
import { wrapErr } from "shared/lib";
import crypto from 'crypto';

export class Secure {
    constructor() {

    }

    encrypt(value: string): string {
        if (process.env.APP_HASH_SECRET === undefined || process.env.APP_HASH_SECRET === '') {
            throw new Error("env APP_HASH_SECRET not set.");
        }
        if (value === '') {
            throw new Error("value parameter cannot be empty.");
        }

        const iv = crypto.randomBytes(16);

        const keyEnc = crypto.scryptSync(process.env.APP_HASH_SECRET + '', 'salt', 24);

        const cipher = crypto.createCipheriv('aes-192-cbc', keyEnc, iv);

        let encryptedData = cipher.update(value, "utf-8", "hex");

        encryptedData += cipher.final("hex");

        return `${encryptedData}.${iv.toString('hex')}`
    }

    decrypt(value: string): string {
        if (process.env.APP_HASH_SECRET === undefined || process.env.APP_HASH_SECRET === '') {
            throw new Error("env APP_HASH_SECRET not set.");
        }
        if (value === '') {
            throw new Error("value parameter cannot be empty.");
        }
        if (!value.includes('.')) {
            throw new Error("value parameter formatted incorrectly. dot missing.");
        }

        const dataEnc = value.split('.')[0];

        const iv = value.split('.')[1];

        const keyEnc = crypto.scryptSync(process.env.APP_HASH_SECRET + '', 'salt', 24);

        const decipher = crypto.createDecipheriv('aes-192-cbc', keyEnc, Buffer.from(iv!, 'hex'));

        let decryptedData = decipher.update(dataEnc!, "hex", "utf-8");

        decryptedData += decipher.final("utf-8");

        return decryptedData
    }
}

export class GithubAuthService {

    private client: Octokit

    constructor(private db: PrismaClient) {

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

        this.client = new Octokit({ auth: this.decrypt(user!.hashedPassword!) })

        const [error, authentication] = await wrapErr(this.client.rest.users.getAuthenticated())

        if (authentication?.status !== 200) {
            return false
        }

        return true
    }

    async secureThenSaveOauthUser(token: string, email: string, displayName: string): Promise<User> {

        const secured = this.encrypt(token)

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

            }
        })

        return userDb
    }

    encrypt(value: string): string {
        if (process.env.APP_HASH_SECRET === undefined || process.env.APP_HASH_SECRET === '') {
            throw new Error("env APP_HASH_SECRET not set.");
        }
        if (value === '') {
            throw new Error("value parameter cannot be empty.");
        }

        const iv = crypto.randomBytes(16);

        const keyEnc = crypto.scryptSync(process.env.APP_HASH_SECRET + '', 'salt', 24);

        const cipher = crypto.createCipheriv('aes-192-cbc', keyEnc, iv);

        let encryptedData = cipher.update(value, "utf-8", "hex");

        encryptedData += cipher.final("hex");

        return `${encryptedData}.${iv.toString('hex')}`
    }

    decrypt(value: string): string {
        if (process.env.APP_HASH_SECRET === undefined || process.env.APP_HASH_SECRET === '') {
            throw new Error("env APP_HASH_SECRET not set.");
        }
        if (value === '') {
            throw new Error("value parameter cannot be empty.");
        }
        if (!value.includes('.')) {
            throw new Error("value parameter formatted incorrectly. dot missing.");
        }

        const dataEnc = value.split('.')[0];

        const iv = value.split('.')[1];

        const keyEnc = crypto.scryptSync(process.env.APP_HASH_SECRET + '', 'salt', 24);

        const decipher = crypto.createDecipheriv('aes-192-cbc', keyEnc, Buffer.from(iv!, 'hex'));

        let decryptedData = decipher.update(dataEnc!, "hex", "utf-8");

        decryptedData += decipher.final("utf-8");

        return decryptedData
    }

    getClient(): Octokit {
        return this.client
    }
}