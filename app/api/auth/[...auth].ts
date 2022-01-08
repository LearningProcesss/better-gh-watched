import { passportAuth } from 'blitz'
import db, { User } from 'db'
import crypto from "crypto"
import GihubPassportGlobal, { Strategy } from 'passport-github2'
import { GithubAuthService } from 'server/github'

const GitHubStrategy = Strategy

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

                // const userDb: User = await db.user.upsert({
                //     where: {
                //         email
                //     },
                //     create: {
                //         email,
                //         name: profile.displayName,
                //         hashedPassword: accessToken
                //     },
                //     update: {

                //     }
                // })

                const authService: GithubAuthService = new GithubAuthService(db)

                const userId = await authService.secureThenSaveOauthUser(accessToken, email, profile.displayName)

                const publicData = {
                    userId: userId.id
                }

                const result = {
                    publicData
                }

                done(undefined, result)
            })
        }
    ]
}))