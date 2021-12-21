import { IGhApiRepo } from "./githubapi.model";

export class GhApiRepoConvert {
    public static toRepo(json: string): IGhApiRepo[] {
        return cast(JSON.parse(json), a(r("Repo")));
    }

    public static repoToJson(value: IGhApiRepo[]): string {
        return JSON.stringify(uncast(value, a(r("Repo"))), null, 2);
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
    "Repo": o([
        { json: "id", js: "id", typ: 0 },
        { json: "node_id", js: "node_id", typ: "" },
        { json: "name", js: "name", typ: "" },
        { json: "full_name", js: "full_name", typ: "" },
        { json: "private", js: "private", typ: true },
        { json: "owner", js: "owner", typ: r("Owner") },
        { json: "html_url", js: "html_url", typ: "" },
        { json: "description", js: "description", typ: u(null, "") },
        { json: "fork", js: "fork", typ: true },
        { json: "url", js: "url", typ: "" },
        { json: "forks_url", js: "forks_url", typ: "" },
        { json: "keys_url", js: "keys_url", typ: "" },
        { json: "collaborators_url", js: "collaborators_url", typ: "" },
        { json: "teams_url", js: "teams_url", typ: "" },
        { json: "hooks_url", js: "hooks_url", typ: "" },
        { json: "issue_events_url", js: "issue_events_url", typ: "" },
        { json: "events_url", js: "events_url", typ: "" },
        { json: "assignees_url", js: "assignees_url", typ: "" },
        { json: "branches_url", js: "branches_url", typ: "" },
        { json: "tags_url", js: "tags_url", typ: "" },
        { json: "blobs_url", js: "blobs_url", typ: "" },
        { json: "git_tags_url", js: "git_tags_url", typ: "" },
        { json: "git_refs_url", js: "git_refs_url", typ: "" },
        { json: "trees_url", js: "trees_url", typ: "" },
        { json: "statuses_url", js: "statuses_url", typ: "" },
        { json: "languages_url", js: "languages_url", typ: "" },
        { json: "stargazers_url", js: "stargazers_url", typ: "" },
        { json: "contributors_url", js: "contributors_url", typ: "" },
        { json: "subscribers_url", js: "subscribers_url", typ: "" },
        { json: "subscription_url", js: "subscription_url", typ: "" },
        { json: "commits_url", js: "commits_url", typ: "" },
        { json: "git_commits_url", js: "git_commits_url", typ: "" },
        { json: "comments_url", js: "comments_url", typ: "" },
        { json: "issue_comment_url", js: "issue_comment_url", typ: "" },
        { json: "contents_url", js: "contents_url", typ: "" },
        { json: "compare_url", js: "compare_url", typ: "" },
        { json: "merges_url", js: "merges_url", typ: "" },
        { json: "archive_url", js: "archive_url", typ: "" },
        { json: "downloads_url", js: "downloads_url", typ: "" },
        { json: "issues_url", js: "issues_url", typ: "" },
        { json: "pulls_url", js: "pulls_url", typ: "" },
        { json: "milestones_url", js: "milestones_url", typ: "" },
        { json: "notifications_url", js: "notifications_url", typ: "" },
        { json: "labels_url", js: "labels_url", typ: "" },
        { json: "releases_url", js: "releases_url", typ: "" },
        { json: "deployments_url", js: "deployments_url", typ: "" },
        { json: "created_at", js: "created_at", typ: Date },
        { json: "updated_at", js: "updated_at", typ: Date },
        { json: "pushed_at", js: "pushed_at", typ: Date },
        { json: "git_url", js: "git_url", typ: "" },
        { json: "ssh_url", js: "ssh_url", typ: "" },
        { json: "clone_url", js: "clone_url", typ: "" },
        { json: "svn_url", js: "svn_url", typ: "" },
        { json: "homepage", js: "homepage", typ: u(null, "") },
        { json: "size", js: "size", typ: 0 },
        { json: "stargazers_count", js: "stargazers_count", typ: 0 },
        { json: "watchers_count", js: "watchers_count", typ: 0 },
        { json: "language", js: "language", typ: u(null, "") },
        { json: "has_issues", js: "has_issues", typ: true },
        { json: "has_projects", js: "has_projects", typ: true },
        { json: "has_downloads", js: "has_downloads", typ: true },
        { json: "has_wiki", js: "has_wiki", typ: true },
        { json: "has_pages", js: "has_pages", typ: true },
        { json: "forks_count", js: "forks_count", typ: 0 },
        { json: "mirror_url", js: "mirror_url", typ: null },
        { json: "archived", js: "archived", typ: true },
        { json: "disabled", js: "disabled", typ: true },
        { json: "open_issues_count", js: "open_issues_count", typ: 0 },
        { json: "license", js: "license", typ: u(r("License"), null) },
        { json: "allow_forking", js: "allow_forking", typ: true },
        { json: "is_template", js: "is_template", typ: true },
        { json: "topics", js: "topics", typ: a("") },
        { json: "visibility", js: "visibility", typ: r("Visibility") },
        { json: "forks", js: "forks", typ: 0 },
        { json: "open_issues", js: "open_issues", typ: 0 },
        { json: "watchers", js: "watchers", typ: 0 },
        { json: "default_branch", js: "default_branch", typ: r("DefaultBranch") },
        { json: "permissions", js: "permissions", typ: r("Permissions") },
    ], false),
    "License": o([
        { json: "key", js: "key", typ: "" },
        { json: "name", js: "name", typ: "" },
        { json: "spdx_id", js: "spdx_id", typ: "" },
        { json: "url", js: "url", typ: u(null, "") },
        { json: "node_id", js: "node_id", typ: "" },
    ], false),
    "Owner": o([
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
        { json: "type", js: "type", typ: r("Type") },
        { json: "site_admin", js: "site_admin", typ: true },
    ], false),
    "Permissions": o([
        { json: "admin", js: "admin", typ: true },
        { json: "maintain", js: "maintain", typ: true },
        { json: "push", js: "push", typ: true },
        { json: "triage", js: "triage", typ: true },
        { json: "pull", js: "pull", typ: true },
    ], false),
    "DefaultBranch": [
        "devel",
        "develop",
        "development",
        "main",
        "master",
    ],
    "Type": [
        "Organization",
        "User",
    ],
    "Visibility": [
        "public",
    ],
};