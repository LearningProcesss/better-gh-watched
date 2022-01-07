export async function wrapErr<T>(promise: Promise<T>): Promise<[any, T | undefined]> {
    try {
        return [undefined, await promise];
    } catch (err) {
        return [err, undefined];
    }
}

export function range(start: number, end: number): number[] {

    start = Math.floor(start);
    end = Math.floor(end);

    const diff = end - start;
    if (diff === 0) {
        return [start];
    }

    const keys = Array(Math.abs(diff) + 1).keys();
    return Array.from(keys).map(x => {
        const increment = end > start ? x : -x;
        return start + increment;
    });
}

export const deepCopy = <T>(target: T): T => {
    if (target === null) {
        return target;
    }
    if (target instanceof Date) {
        return new Date(target.getTime()) as any;
    }
    if (target instanceof Array) {
        const cp = [] as any[];
        (target as any[]).forEach((v) => { cp.push(v); });
        return cp.map((n: any) => deepCopy<any>(n)) as any;
    }
    if (typeof target === 'object' && target !== {}) {
        const cp = { ...(target as { [key: string]: any }) } as { [key: string]: any };
        Object.keys(cp).forEach(k => {
            cp[k] = deepCopy<any>(cp[k]);
        });
        return cp as T;
    }
    return target;
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const isObjectEmpty = (object: {}) => Object.keys(object).length === 0

const pipe = (...args) => args.reduce((acc, el) => el(acc));