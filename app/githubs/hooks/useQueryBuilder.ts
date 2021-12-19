import { useCallback, useEffect, useState } from "react";
import { IGithubQuery } from "../models/models";
import { IQueryBuilderService } from "../service";


export default function useQueryBuilder(queryBuilder: IQueryBuilderService): {
    where: {},
    orderBy: {},
    withFullText: (fullText: string) => void,
    withTopics: (topic: string[]) => void,
    withLanguages: (topic: string[]) => void,
    withOrderBy: (orderBy: string) => void,
    withOrderByDirection: (orderDirection: string) => void
} {

    const [query, setQuery] = useState<IGithubQuery>({})
    const [order, setOrder] = useState<IGithubQuery>({})
    const [where, setWhere] = useState<{}>({})
    const [orderBy, setOrderBy] = useState<{}>({})

    useEffect(() => {

        const whereResult = queryBuilder.buildWhere(query)

        setWhere(whereResult)

        return () => {

        }
    }, [query])

    useEffect(() => {

        const orderResult = queryBuilder.buildOrder(order)

        setOrderBy(orderResult)

        return () => {

        }
    }, [order])

    const withFullText = useCallback((fullText: string) => {
        setQuery(previousState => ({
            ...previousState,
            search: {
                ...previousState.search,
                fulltext: fullText
            }
        }))
    }, [])

    const withTopics = useCallback((topics: string[]) => {
        setQuery(previousState => ({
            ...previousState,
            search: {
                ...previousState.search,
                topics: [...topics]
            }
        }))
    }, [])

    const withLanguages = useCallback((languages: string[]) => {
        setQuery(previousState => ({
            ...previousState,
            search: {
                ...previousState.search,
                languages: [...languages]
            }
        }))
    }, [])

    const withOrderBy = useCallback((orderBy: string) => {
        setOrder(previousState => ({
            ...previousState,
            order: {
                ...previousState.order,
                orderBy: orderBy
            }
        }))
    }, [])

    const withOrderByDirection = useCallback((orderDirection: string) => {
        setOrder(previousState => ({
            ...previousState,
            order: {
                ...previousState.order,
                orderDirection: orderDirection
            }
        }))
    }, [])

    return { where, orderBy, withFullText, withTopics, withLanguages, withOrderBy, withOrderByDirection }
}

