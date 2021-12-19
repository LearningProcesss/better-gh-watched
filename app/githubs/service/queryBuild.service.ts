import { isObjectEmpty } from "shared/lib";
import { IGithubQuery } from "../models/models";

export interface IQueryBuilderService extends IWhereBuilder, IOrderBuilder {
    interpreters: IInterpreter[]
}

export interface IWhereBuilder {
    buildWhere(query: IGithubQuery): {}
}

export interface IOrderBuilder {
    buildOrder(query: IGithubQuery): {}
}

export interface IInterpreter {
    interpret(query: IGithubQuery): {}
}

// export interface IBuilderCtx {
//     data?: IGithubQuery
//     interpretaions: [{} | undefined]
//     where?: {}
// }

export class QueryBuilderService implements IQueryBuilderService {

    interpreters: IInterpreter[];

    constructor(interpreters: IInterpreter[]) {

        if (interpreters === null || interpreters === undefined) {
            throw new Error("interpreters can't be null or undefined");
        }

        if (interpreters.length === 0) {
            throw new Error("interpreters must contains at least one interpreter");
        }

        this.interpreters = interpreters
    }

    buildOrder(query: IGithubQuery): {} {
        const temporary: {}[] = []

        this.interpreters
            .map(interpreter => interpreter.interpret(query))
            .filter(interpretation => !isObjectEmpty(interpretation))
            .forEach(interpretation => temporary.push(interpretation))

        if(temporary.length === 0) { 
            return {}
        }

        return temporary[0]!
    }

    buildWhere(query: IGithubQuery): {} {

        let where = {}

        const temporary: {}[] = []

        this.interpreters
            .map(interpreter => interpreter.interpret(query))
            .filter(interpretation => !isObjectEmpty(interpretation))
            .forEach(interpretation => temporary.push(interpretation))

        if (temporary.length > 1) {
            const and = {
                AND: temporary
            }

            where = {
                ...and
            }
        }
        else if (temporary.length == 1) {
            where = {
                ...temporary[0]
            }
        }

        return where
    }
}

export class FullTextInterpreter implements IInterpreter {
    interpret(query: IGithubQuery): {} {
        if (!query.search?.fulltext) {
            return {}
        }

        return {
            OR: [
                {
                    name: {
                        contains: query.search?.fulltext
                    }
                },
                {
                    full_name: {
                        contains: query.search?.fulltext
                    }
                },
                {
                    description: {
                        contains: query.search?.fulltext
                    }
                },
                {
                    html_url: {
                        contains: query.search?.fulltext
                    }
                },
                {
                    topics: {
                        some: {
                            value: {
                                contains: query.search?.fulltext
                            }
                        }
                    }
                },
                {
                    languages: {
                        some: {
                            language: {
                                contains: query.search?.fulltext
                            }
                        }
                    }
                }
            ]
        }
    }
}

export class TopicInterpreter implements IInterpreter {
    interpret(query: IGithubQuery): {} {
        if (!query.search?.topics || query.search?.topics.length == 0) {
            return {}
        }

        return {
            topics: {
                some: {
                    value: {
                        in: query!.search!.topics!
                    }
                }
            }
        }
    }
}

export class LanguageInterpreter implements IInterpreter {
    interpret(query: IGithubQuery): {} {
        if (!query.search?.languages || query.search?.languages.length == 0) {
            return {}
        }

        return {
            languages: {
                some: {
                    language: {
                        in: query.search!.languages!
                    }
                }
            }
        }
    }
}

export class OrderInterpreter implements IInterpreter {
    interpret(query: IGithubQuery): {} {
        if(!query.order?.orderBy) {
            return {}
        }

        return {
            [query.order.orderBy]: query.order.orderDirection ?? "asc"
        }
    }
}

export class InterpreterFactory {
    static create(): IInterpreter[] {

        const fulltext: IInterpreter = new FullTextInterpreter()
        const topic: IInterpreter = new TopicInterpreter()
        const language: IInterpreter = new LanguageInterpreter()
        const orderby: IInterpreter = new OrderInterpreter()
        return [fulltext, topic, language, orderby]
    }
}