import { GithubAuthService, GithubSyncService } from "server/github";
import { IClientSyncEvent, IServerEndSyncEvent, IServerProgressSyncEvent, IServerStartSyncEvent } from "shared/github.service.sync/events";
import { wrapErr } from "shared/lib";
import { Socket } from "socket.io";

export const syncHandler = (socket: Socket, authService: GithubAuthService, syncService: GithubSyncService) => {

    socket.on('sync', async ({ sessionUserId }: IClientSyncEvent) => {

        const [error, authenticated] = await wrapErr(authService.authenticateGithubBySessionId(sessionUserId))

        if (!authenticated) { return }

        syncService.setOctokit(authService.getClient())

        syncService.start()

        syncService.on("sync-process-start", (event: { pages: number }) => {
            socket.emit("sync-server-start", <IServerStartSyncEvent>
                {
                    title: "Subscription process",
                    message: `the process is started, total pages to fetch: ${event.pages}`,
                    processName: "subscriptions",
                    totalPages: event.pages
                })
        })

        syncService.on("sync-page-end", (event: { page: number, pages: number }) => {
            socket.emit("sync-server-progress", <IServerProgressSyncEvent>{ page: event.page, pages: event.pages })
        })

        syncService.on("sync-process-end", (event: { message: string, completed: boolean }) => {
            socket.emit("sync-server-end", <IServerEndSyncEvent>{ key: "subscriptions", message: event.message, completed: event.completed })
        })
    });
}