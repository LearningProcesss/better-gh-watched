import { PrismaClient } from 'db';
import * as HttpServer from 'http'
import { GithubAuthService, GithubSyncService, Secure } from 'server/github/services';
import { Server, Socket } from "socket.io";
import { syncHandler } from './handler';

export const ioModule = (httpServer: HttpServer.Server, db: PrismaClient) => {

    const ioServer: Server = new Server(httpServer, { cors: { origin: `http://localhost:${3000}`, methods: ["GET", "POST"] } })
    const authService: GithubAuthService = new GithubAuthService(db, new Secure())
    const syncService: GithubSyncService = new GithubSyncService(db)

    ioServer.on("connection", (socket: Socket) => {
        syncHandler(socket, authService, syncService)
    })
}