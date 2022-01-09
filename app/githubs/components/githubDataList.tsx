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
            {
                data?.map(item => (renderItem ? renderItem(item) : item))
            }
        </div>
    )
}
