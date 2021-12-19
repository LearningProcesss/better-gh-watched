import { Notification } from '@mantine/core';
import { NotificationsContextProps } from "@mantine/notifications/lib/types";
import { Dispatch, MutableRefObject, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IClientSyncEvent, IServerProgressSyncEvent, IServerStartSyncEvent, IServerSyncEvent } from "shared/github.service.sync/events";
import { Socket } from "socket.io-client";
import { BsFillCheckCircleFill } from 'react-icons/bs'

// type event = "sync-server-start" | "sync-server-progress" | "sync-server-end"

// interface IHandlerAction {
//     eventArgs: IServerSyncEvent
//     container: MutableRefObject<string>
// }

// interface IHandler {
//     event: event
//     action: (handlerActionArgs: IHandlerAction) => void
// }

// export function useTest(handlers: IHandler[]) {

//     const mutableContainer = useRef<string>("")

//     const set = useCallback(() => {

//     }, [])

//     useEffect(() => {

//         for (const handler of handlers) {
            
//         }

//         return () => {

//         }
//     }, [])

// }

export function useBridgeService(sessionUserId: number, socket: Socket, notifications: NotificationsContextProps): {
    setStart: Dispatch<SetStateAction<boolean>>
} {
    console.log(`useBridgeService=>render=>sessionUserId${sessionUserId}`)

    const [start, setStart] = useState<boolean>(false)

    const notificationId = useRef<string>("")

    useEffect(() => {

        if (start && sessionUserId !== null) {

            console.log(`useBridgeService=>useEffect=>sessionUserId=>${sessionUserId}`);

            socket.on("sync-server-start", (event: IServerStartSyncEvent) => {
                const id = notifications.showNotification({
                    loading: true,
                    title: event.title,
                    message: event.message,
                    autoClose: false,
                    disallowClose: true,
                });

                notificationId.current = id
            })

            socket.on("sync-server-progress", (event: IServerProgressSyncEvent) => {
                notifications.showNotification({ color: "teal", autoClose: 1500, message: `page: ${event.page!} of ${event.pages}` })
            })

            socket.on("sync-server-end", (event: IServerProgressSyncEvent) => {
                setTimeout(() => {
                    notifications.updateNotification(notificationId.current, { color: "teal", title: "", message: "process completed successfully!", autoClose: 2500 })
                }, 1000);
            })

            socket.emit("sync", <IClientSyncEvent>{ sessionUserId })

            return () => {
                console.log("unmounted")
                socket.removeAllListeners()
            }
        }

        return () => {

        }
    }, [start])

    return { setStart }
}