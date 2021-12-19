import { GithubAuthService, GithubSyncServiceEventer, GithubSyncService } from "server/github";
import { IClientSyncEvent, IServerEndSyncEvent, IServerProgressSyncEvent, IServerStartSyncEvent } from "shared/github.service.sync/events";
import { wrapErr } from "shared/lib";
import { Socket } from "socket.io";

export const syncHandler = (socket: Socket, authService: GithubAuthService, syncService: GithubSyncService) => {

    socket.on('sync', async ({ sessionUserId }: IClientSyncEvent) => {

        const [error, authenticated] = await wrapErr(authService.authenticate(sessionUserId))

        if (!authenticated) { return }

        console.log(`syncHandler->sync->sessionUserId:${sessionUserId} socket.id:${socket.id}`);

        // if (socketManager.isAlreadyWorking(socket.id)) {
        //     console.log("server -> socket.io -> event: sync -> blocked!", event, socket.id);
        //     return
        // }

        // socketManager.setIsWorking(socket.id, true)

        syncService.process(authService.getClient())

        syncService.on("sync-process-start", (totalPages: number) => {
            socket.emit("sync-server-start", <IServerStartSyncEvent>{ title: "Subscription process", message: `the process is started, total pages to fetch: ${totalPages}`, processName: "subscriptions", totalPages: 1000 })
        })

        syncService.on("sync-page-end", (page: number) => {

            console.log("syncHandler->sync->syncService.pageProcessed", page, 1000);

            socket.emit("sync-server-progress", <IServerProgressSyncEvent>{ page: page, pages: 1000 })

            // socketManager.setIsWorking(socket.id, false)
        })

        syncService.on("sync-process-end", () => {
            socket.emit("sync-server-end", <IServerEndSyncEvent>{ key: "subscriptions" })
        })
    });
}