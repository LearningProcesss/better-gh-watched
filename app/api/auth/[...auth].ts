import { passportAuth } from 'blitz'
import db from 'db'
import GihubPassportGlobal, { Strategy } from 'passport-github2'
import { GithubAuthService, Secure } from 'server/github/services'

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
                // console.log(`GithubStrategy -> accessToken: ${accessToken} - refreshToken: ${refreshToken} - profile: ${JSON.stringify(profile)}`)

                const email = profile.emails && profile.emails[0]?.value || ""

                if (email === "") {
                    //error
                }

                const authService: GithubAuthService = new GithubAuthService(db, new Secure())

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