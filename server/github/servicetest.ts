
export interface ISyncServiceTest { 
    process: (p1: string, p2: number) => string
}

export class SyncServiceTest {
    
    process(parameter1: string, parameter2: number): string {
        return parameter1
    }
}