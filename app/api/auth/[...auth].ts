import { passportAuth } from 'blitz'
import db, { User } from 'db'
import GihubPassportGlobal, { Strategy } from 'passport-github2'

const GitHubStrategy = Strategy

// async function encrypt(toBeHashed: string, key: string): Promise<string> {
//     const result = AES.encrypt(toBeHashed, key)

//     return result.toString();
// }

// async function decrypt(toBeDescrypt: string, key: string) {
//     const result = AES.decrypt(toBeDescrypt, key)

//     return result.toString()
// }

export default passportAuth(({ ctx, req, res }) => ({
    successRedirectUrl: "",
    errorRedirectUrl: "",
    strategies: [
        {
            strategy: new GitHubStrategy({
                clientID: process.env.GITHUB_OAUTHAPP_CLIENTID + '',
                clientSecret: process.env.GITHUB_OAUTHAPP_CLIENTSECRET + '',
                callbackURL: process.env.GITHUB_OAUTHAPP_CALLBACKURL + ''
            }, async function (accessToken: string, refreshToken: string, profile: GihubPassportGlobal.Profile, done) {
                console.log(`GithubStrategy -> accessToken: ${accessToken} - refreshToken: ${refreshToken} - profile: ${JSON.stringify(profile)}`)

                const email = profile.emails && profile.emails[0]?.value || ""

                if (email === "") {
                    //error
                }

                // const encrypted: string = await encrypt(accessToken, process.env.APP_HASH_SECRET + '')

                // const decrypted = await decrypt(encrypted, process.env.APP_HASH_SECRET + '')

                // console.log(encrypted)
                // console.log(decrypted);
                
                const userDb: User = await db.user.upsert({
                    where: {
                        email
                    },
                    create: {
                        email,
                        name: profile.displayName,
                        hashedPassword: accessToken
                    },
                    update: {

                    }
                })

                const publicData = {
                    userId: userDb.id
                }

                const result = {
                    publicData
                }

                done(undefined, result)
            })
        }
    ]
}))