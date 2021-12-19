import React from 'react'
import { useQuery } from "blitz"
import getTopicGrouped from '../queries/getTopicGrouped'
import { ITopicGroupDto } from 'shared/models';
import { MultiSelect } from '@mantine/core';
import { FaHashtag } from 'react-icons/fa';

interface ItemProps {
    label: string
    value: string
}

const mapper = (apiData: ITopicGroupDto[]) => {

    const mapped = apiData.map(({ topic, count }) => ({ label: topic, value: topic }))

    return mapped
}


// const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
//     ({ label, value }: ItemProps, ref) => (
//         <div ref={ref}>
//             <Group noWrap>
//                 {/* <Avatar src={image} /> */}
//                 <div>
//                     <Text>{label}</Text>
//                     <Box sx={{ paddin: "1rem" }}>
//                         {
//                             value
//                         }
//                     </Box>
//                 </div>
//             </Group>
//         </div>
//     )
// );

interface Props {
    withTopics: (topic: string[]) => void
}

export default function TopicsMulti({ withTopics }: Props) {

    const [topics] = useQuery(getTopicGrouped, null)

    return (
        <MultiSelect
            icon={<FaHashtag />}
            data={mapper(topics)}
            // itemComponent={SelectItem}
            nothingFound="Nobody here"
            label="Topics"
            placeholder="choose topic as filter.."
            searchable
            limit={30}
            onChange={withTopics}
        />
    )
}
