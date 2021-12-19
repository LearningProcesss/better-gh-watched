import React, { forwardRef } from 'react'
import { useQuery } from "blitz"
import getTopicGrouped from '../queries/getTopicGrouped'
import { ITopicGroupDto } from 'shared/models';
import { Group, Avatar, Text, Box, MultiSelect } from '@mantine/core';
import { FaHashtag } from 'react-icons/fa';
import getLanguageGrouped from '../queries/getLanguagesDistinct';
import { GithubRepoLanguage } from 'db';

interface ItemProps {
    label: string
    value: string
}

const mapper = (apiData: { language: string, count: number }[]) => {

    const mapped = apiData.map(({ language, count }) => ({ label: language, value: language }))

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
    withLanguages: (languages: string[]) => void
}

export default function LanguagesMulti({ withLanguages }: Props) {

    const [langages] = useQuery(getLanguageGrouped, null)

    return (
        <MultiSelect
            icon={<FaHashtag />}
            data={mapper(langages)}
            // itemComponent={SelectItem}
            nothingFound="Nobody here"
            label="Languages"
            placeholder="choose language as filter.."
            searchable
            limit={30}
            onChange={withLanguages}
        />
    )
}
