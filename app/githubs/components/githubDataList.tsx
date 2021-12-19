import { ReactNode } from 'react';
import { IGithubDto } from '../../../shared/models';

type Props = {
    children?: ReactNode,
    style?: React.CSSProperties
    data?: IGithubDto[]
    renderItem?: (item: IGithubDto) => JSX.Element;
}

export default function List({ style, children, data, renderItem }: Props) {

    return (
        <div style={{ backgroundColor: "", borderRadius: "10px 10px 10px 10px", padding: "1rem", ...style }} >
            DataList component!
            {
                // state.map(repo => (<li style={{ margin: "0.5rem" }} key={repo.title}>{repo.title}</li>))
                data?.map(item => (renderItem ? renderItem(item) : item))
            }
        </div>
    )
}
