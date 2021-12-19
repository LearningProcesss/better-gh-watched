import { EventEmitter } from 'events'
import { IClientSyncEvent, IServerEndSyncEvent, IServerProgressSyncEvent, IServerStartSyncEvent } from 'shared/github.service.sync/events';
import io, { Socket } from 'socket.io-client'

export class BridgeService extends EventEmitter {

    private socket: Socket

    constructor() {
        super();
        this.setup()
    }

    setup() {
        this.socket = io("ws://127.0.0.1:3000")

        this.socket.on("sync-server-start", this.ServerStartSyncEventListner)

        this.socket.on("sync-server-end", this.ServerEndSyncEventListner)

        this.socket.on("sync-server-progress", this.ServerEndSyncEventListner)
    }

    startServerSync(sessionUserId: number) {

        const syncEvent: IClientSyncEvent = {
            sessionUserId
        }

        // this.socket.emit("sync", syncEvent)
    }

    ServerStartSyncEventListner(event: IServerStartSyncEvent) {
        console.log(JSON.stringify(event))
        this.emit("sync-server-start", event)
    }

    ServerEndSyncEventListner(event: IServerEndSyncEvent) {
        console.log(JSON.stringify(event))
        this.emit("sync-server-end", event)
    }

    ServerProgressSyncEventListner(event: IServerProgressSyncEvent) {
        console.log(JSON.stringify(event))
        this.emit("sync-server-progress", event)
    }
}

