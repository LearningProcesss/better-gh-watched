
import React, { ReactNode } from 'react'
import { Button, Group, Header, Menu, Title } from '@mantine/core'
import { GoMarkGithub, GoSync } from "react-icons/go"

type Props = {
    children?: ReactNode,
    style?: React.CSSProperties,
    syncWithGithubHandler: (flag: boolean) => void
}

export default function GithubHeader({ style, syncWithGithubHandler }: Props) {
    return (
        <Header style={{ borderRadius: "10px", backgroundColor: "#16181D", margin: "1rem", ...style }} height={120} padding="lg">
            <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", alignContent: "center", alignItems: "center" }}>
                <Group style={{ flexGrow: 10 }}>
                    <GoMarkGithub color="#F8F8F8" size="64px" />
                    <Title order={1} style={{ color: "#F8F8F8", fontFamily: 'Greycliff CF, sans-serif' }}>
                        GithubBetterExplorer
                    </Title>
                </Group>
                <Menu control={<Button >Actions</Button>}>
                    <Menu.Item icon={<GoSync />} component="button">
                        Logout
                    </Menu.Item>
                    <Menu.Item onClick={() => { syncWithGithubHandler(true) }} icon={<GoSync />} component="button">
                        Sync with Github
                    </Menu.Item>
                </Menu>
            </div>
        </Header>
    )
}


