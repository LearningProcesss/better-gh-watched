import { IGhAPICommit } from "../githubapi.model";

export class GhApiCommitConverter {
    public static toIGhAPICommit(json: string): IGhAPICommit[] {
        return cast(JSON.parse(json), a(r("IGhAPICommit")));
    }

    public static iGhAPICommitToJson(value: IGhAPICommit[]): string {
        return JSON.stringify(uncast(value, a(r("IGhAPICommit"))), null, 2);
    }
}

function invalidValue(typ: any, val: any, key: any = ''): never {
    if (key) {
        throw Error(`Invalid value for key "${key}". Expected type ${JSON.stringify(typ)} but got ${JSON.stringify(val)}`);
    }
    throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`,);
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) { }
        }
        return invalidValue(typs, val);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases, val);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue("array", val);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue("Date", val);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue("object", val);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, prop.key);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val);
    }
    if (typ === false) return invalidValue(typ, val);
    while (typeof typ === "object" && typ.ref !== undefined) {
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems") ? transformArray(typ.arrayItems, val)
                : typ.hasOwnProperty("props") ? transformObject(getProps(typ), typ.additional, val)
                    : invalidValue(typ, val);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: [], additional };
}

function r(name: string) {
    return { ref: name };
}

const typeMap: any = {
    "IGhAPICommit": o([
        { json: "url", js: "url", typ: "" },
        { json: "sha", js: "sha", typ: "" },
        { json: "node_id", js: "node_id", typ: "" },
        { json: "html_url", js: "html_url", typ: "" },
        { json: "comments_url", js: "comments_url", typ: "" },
        { json: "commit", js: "commit", typ: r("Commit") },
        { json: "author", js: "author", typ: r("IGhAPICommitAuthor") },
        { json: "committer", js: "committer", typ: r("IGhAPICommitAuthor") },
        { json: "parents", js: "parents", typ: a(r("Tree")) },
    ], false),
    "IGhAPICommitAuthor": o([
        { json: "login", js: "login", typ: "" },
        { json: "id", js: "id", typ: 0 },
        { json: "node_id", js: "node_id", typ: "" },
        { json: "avatar_url", js: "avatar_url", typ: "" },
        { json: "gravatar_id", js: "gravatar_id", typ: "" },
        { json: "url", js: "url", typ: "" },
        { json: "html_url", js: "html_url", typ: "" },
        { json: "followers_url", js: "followers_url", typ: "" },
        { json: "following_url", js: "following_url", typ: "" },
        { json: "gists_url", js: "gists_url", typ: "" },
        { json: "starred_url", js: "starred_url", typ: "" },
        { json: "subscriptions_url", js: "subscriptions_url", typ: "" },
        { json: "organizations_url", js: "organizations_url", typ: "" },
        { json: "repos_url", js: "repos_url", typ: "" },
        { json: "events_url", js: "events_url", typ: "" },
        { json: "received_events_url", js: "received_events_url", typ: "" },
        { json: "type", js: "type", typ: "" },
        { json: "site_admin", js: "site_admin", typ: true },
    ], false),
    "Commit": o([
        { json: "url", js: "url", typ: "" },
        { json: "author", js: "author", typ: r("CommitAuthor") },
        { json: "committer", js: "committer", typ: r("CommitAuthor") },
        { json: "message", js: "message", typ: "" },
        { json: "tree", js: "tree", typ: r("Tree") },
        { json: "comment_count", js: "comment_count", typ: 0 },
        { json: "verification", js: "verification", typ: r("Verification") },
    ], false),
    "CommitAuthor": o([
        { json: "name", js: "name", typ: "" },
        { json: "email", js: "email", typ: "" },
        { json: "date", js: "date", typ: "" },
    ], false),
    "Tree": o([
        { json: "url", js: "url", typ: "" },
        { json: "sha", js: "sha", typ: "" },
    ], false),
    "Verification": o([
        { json: "verified", js: "verified", typ: true },
        { json: "reason", js: "reason", typ: "" },
        { json: "signature", js: "signature", typ: null },
        { json: "payload", js: "payload", typ: null },
    ], false),
};
