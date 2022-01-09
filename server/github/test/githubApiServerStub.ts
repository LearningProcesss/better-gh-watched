import { rest } from 'msw'
import { setupServer, SetupServerApi } from 'msw/node'
import fs from 'fs'
import path from 'path'
import { GhApiCommitConverter, GhApiRepoConvert } from '../converters'

let worker: SetupServerApi

export const listenGithubApiServerStub = () => {
    worker.listen()
}

export const closeGithubApiServerStub = () => {
    worker.close()
}

export const resetHandlersServerStub = () => {
    worker.resetHandlers()
}

// export const githubApiServerStub = () => {
//     worker = setupServer(
//         rest.get('https://api.github.com/user', (req, res, ctx) => {
//             console.log("worker intercepted!")
//             return res(
//                 ctx.json(
//                     {
//                         "login": "LearningProcesss",
//                         "id": 38817460,
//                         "node_id": "MDQ6VXNlcjM4ODE3NDYw",
//                         "avatar_url": "https://avatars.githubusercontent.com/u/38817460?v=4",
//                         "gravatar_id": "",
//                         "url": "https://api.github.com/users/LearningProcesss",
//                         "html_url": "https://github.com/LearningProcesss",
//                         "followers_url": "https://api.github.com/users/LearningProcesss/followers",
//                         "following_url": "https://api.github.com/users/LearningProcesss/following{/other_user}",
//                         "gists_url": "https://api.github.com/users/LearningProcesss/gists{/gist_id}",
//                         "starred_url": "https://api.github.com/users/LearningProcesss/starred{/owner}{/repo}",
//                         "subscriptions_url": "https://api.github.com/users/LearningProcesss/subscriptions",
//                         "organizations_url": "https://api.github.com/users/LearningProcesss/orgs",
//                         "repos_url": "https://api.github.com/users/LearningProcesss/repos",
//                         "events_url": "https://api.github.com/users/LearningProcesss/events{/privacy}",
//                         "received_events_url": "https://api.github.com/users/LearningProcesss/received_events",
//                         "type": "User",
//                         "site_admin": false,
//                         "name": "Mattia M.",
//                         "company": null,
//                         "blog": "",
//                         "location": null,
//                         "email": null,
//                         "hireable": true,
//                         "bio": null,
//                         "twitter_username": null,
//                         "public_repos": 19,
//                         "public_gists": 0,
//                         "followers": 15,
//                         "following": 76,
//                         "created_at": "2018-04-28T18:30:02Z",
//                         "updated_at": "2021-12-20T06:49:28Z"
//                     }
//                 )
//             )
//         }),
//         rest.get('https://api.github.com/user/subscriptions', (req, res, ctx) => {

//             const apiRepoList = GhApiRepoConvert.toRepo(fs.readFileSync(path.join(__dirname, './fixtures/api.github.com.user.subscriptions.json'), 'utf-8'))

//             return res(
//                 ctx.status(200),
//                 ctx.set('x-ratelimit-remaining', '4999'),
//                 ctx.set('link', '<https://api.github.com/user/subscriptions?page=2>; rel="next", <https://api.github.com/user/subscriptions?page=2>; rel="last">'),
//                 ctx.json(apiRepoList)
//             )
//         }),
//         rest.get('https://api.github.com/repos/restify/node-restify/commits', (req, res, ctx) => {

//             const apiCommitList = GhApiCommitConverter.toIGhAPICommit(fs.readFileSync(path.join(__dirname, './fixtures/api.github.com.repo.commit.json'), 'utf-8'))

//             return res(
//                 ctx.status(200),
//                 ctx.set('x-ratelimit-remaining', '4999'),
//                 ctx.set('link', '<https://api.github.com/user/subscriptions?per_page=1&page=2>; rel="next", <https://api.github.com/user/subscriptions?per_page=30&page=1>; rel="last">'),
//                 ctx.json(apiCommitList)
//             )
//         }),
//         rest.get('https://api.github.com/repos/restify/node-restify/languages', (req, res, ctx) => {

//             const apiLanguage = fs.readFileSync(path.join(__dirname, './fixtures/api.github.com.repo.languages.json'), 'utf-8')

//             const apiLanguageList: { [key: string]: number } = JSON.parse(apiLanguage)

//             return res(
//                 ctx.status(200),
//                 ctx.set('x-ratelimit-remaining', '4999'),
//                 ctx.set('link', '<https://api.github.com/user/subscriptions?per_page=1&page=2>; rel="next", <https://api.github.com/user/subscriptions?per_page=30&page=1>; rel="last"'),
//                 ctx.json(apiLanguageList)
//             )
//         }),
//         rest.get('https://api.github.com/rate_limit', (req, res, ctx) => {

//             const apiRate = fs.readFileSync(path.join(__dirname, './fixtures/api.github.com.ratelimit.json'), 'utf-8')

//             return res(
//                 ctx.status(200),
//                 ctx.json(JSON.parse(apiRate))
//             )
//         })
//     )

//     listenGithubApiServerStub()
// }