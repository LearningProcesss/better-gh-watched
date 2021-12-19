import { BridgeService, InterpreterFactory, IQueryBuilderService, QueryBuilderService } from "app/githubs/service"
import { createContext, useContext } from 'react'
import io, { Socket } from 'socket.io-client'

export interface IContextDiServices {
    bridgeService: BridgeService
    socket: Socket
    queryBuilderService: IQueryBuilderService
}

export const defaultAppContext: IContextDiServices = {
    bridgeService: new BridgeService(),
    socket: io("ws://127.0.0.1:3000"),
    queryBuilderService: new QueryBuilderService(InterpreterFactory.create())
};

function createCtx<A extends {} | null>() {

    const ctx = createContext<A | undefined>(undefined);

    function useCtx() {

        const c = useContext(ctx);

        if (c === undefined)
            throw new Error("useCtx must be inside a Provider with a value");
        return c;
    }

    return [useCtx, ctx.Provider] as const; // 'as const' makes TypeScript infer a tuple
}

export const [useContextDiServices, ContextDiServicesProvider] = createCtx<IContextDiServices>();
