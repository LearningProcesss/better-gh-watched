import React, { ReactNode } from 'react'
import { useQuery } from "blitz";
import getRepoPaged from "app/githubs/queries/getRepoPaged";
import { IGithubDto } from 'shared/models';

type Props = {
    setTotalPagesHandler: (totalPages: number) => void,
    children: (data: IGithubDto[]) => ReactNode,
    style?: React.CSSProperties
    currentPage: number
    where?: {},
    orderBy?: {}
}

export default function GithubWrapper({ setTotalPagesHandler, children, currentPage, where, orderBy }: Props) {

    const [pagedResult] = useQuery(getRepoPaged, { page: currentPage, take: 30, where: where ?? {}, orderBy: orderBy ?? {} })

    setTotalPagesHandler(pagedResult.totalPages)

    return (
        <div >
            {
                children(pagedResult.items)
            }
        </div>
    )
}
