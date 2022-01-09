import { Secure } from "../services"

const tobeencrypted = 'testtobeencrypt'
const encrypted = '8c223ea342d96de2353608c482160e82.e0ba5363e08e8545487d1c184ba91d34'
const env: string = process.env.APP_HASH_SECRET!


afterEach(() => {
    process.env.APP_HASH_SECRET = env
})

describe('Secure', () => {
    it('should encrypt value when APP_HASH_SECRET env is set', () => {
        const service: Secure = new Secure()

        const result: string = service.encrypt(tobeencrypted)

        expect(result).toContain('.')
    });
    it('should throw exception when APP_HASH_SECRET env is not set', () => {

        delete process.env.APP_HASH_SECRET

        const service: Secure = new Secure()

        expect(service.encrypt).toThrow()
    });
    it('should throw exception when value parameter is empty', () => {

        const service: Secure = new Secure()

        expect(() => service.encrypt('')).toThrow()
    });
    it('should decrypt when env and parameters are valid', () => {

        const service: Secure = new Secure()

        const decrypted = service.decrypt(encrypted);

        expect(decrypted).toBe(tobeencrypted)
    });
    it('should throw exception when APP_HASH_SECRET env is not set', () => {

        delete process.env.APP_HASH_SECRET

        const service: Secure = new Secure()

        expect(service.decrypt).toThrow()
    });
    it('should throw exception when value parameter is empty', () => {

        const service: Secure = new Secure()

        expect(() => service.decrypt('')).toThrow()
    });
    it('should throw exception when value parameter does not contains dot', () => {

        const service: Secure = new Secure()

        expect(() => service.decrypt('8c223ea342d96de2353608c482160e82')).toThrow()
    });
});