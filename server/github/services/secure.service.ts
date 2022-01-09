import crypto from 'crypto';

export class Secure {
    constructor() {

    }

    encrypt(value: string): string {
        if (process.env.APP_HASH_SECRET === undefined || process.env.APP_HASH_SECRET === '') {
            throw new Error("env APP_HASH_SECRET not set.");
        }
        if (value === '') {
            throw new Error("value parameter not set");
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
            throw new Error("value parameter not set");
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