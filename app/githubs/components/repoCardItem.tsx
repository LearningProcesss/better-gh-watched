import React from 'react'
import { Badge, Box, Image, Text, ThemeIcon } from '@mantine/core'
import { useMantineTheme } from '@mantine/core';
import { IGithubDto } from 'shared/models'
import { GoMarkGithub } from "react-icons/go"
import { FaStar } from "react-icons/fa"

type Props = {
    style?: React.CSSProperties
    data?: IGithubDto
}

export default function RepoCardItem({ style, data }: Props) {

    const theme = useMantineTheme()

    return (
        <Box
            sx={(theme) => ({
                backgroundColor: "",
                padding: "0.8rem",
                borderRadius: theme.radius.md,
                cursor: 'pointer',

                '&:hover': {
                    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
                    transition: "box-shadow 0.2s ease-in-out"
                },
            })}
            style={{ marginTop: "0.5rem" }}
            onClick={() => window.open(data!.html_url, '_blank')}
        >
            <div style={{ display: "flex", flexDirection: "row" }}>
                <Image
                    style={{ flexBasis: "auto", flexShrink: "0", boxShadow: "5px 5px 5px rgba(0,0,0,0.3)"}}
                    radius="md"
                    src={data?.avatar_url}
                    width={100}
                    height={100}
                    fit="contain"
                    alt="Random unsplash image"
                />
                <div style={{ marginLeft: "1rem", display: "flex", flexDirection: "column" }}>
                    <Text size="xl" weight={700} style={{ fontFamily: 'Greycliff CF, sans-serif' }}>{data?.full_name}</Text>
                    <Text style={{ fontFamily: 'Greycliff CF, sans-serif' }}>{data?.description}</Text>
                    <Text style={{ marginTop: "0.5rem" }} color="dimmed" >{data?.latest_commit}</Text>
                    <div>
                        <FaStar size={"32px"} color="yellow" />
                        <Badge style={{ position: "absolute" }} >{data?.stargazers_count}</Badge>
                    </div>
                </div>
            </div>
        </Box>
    )
}
