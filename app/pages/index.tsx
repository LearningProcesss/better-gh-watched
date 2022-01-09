import { Button, Card, Center, Container, Text } from "@mantine/core"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import Layout from "app/core/layouts/Layout"
import { BlitzPage, useRouter } from "blitz"
import { Suspense } from "react"
import { GoMarkGithub } from "react-icons/go"

const UserInfo = () => {
  const router = useRouter()
  const currentUser = useCurrentUser()
  
  if(currentUser) {
    router.push("/github")
  } else {
    return ( 
    <>
      <Container style={{ width: "100vw", height: "100vh" }}>
        <Center>
          <Card shadow="md" padding="xl" style={{ margin: 50, width: "100vw" }}>
            <Text size="md" style={{ lineHeight: 1.5, marginBottom: 10 }}>
              BetterGithubExplore
            </Text>
            <Button fullWidth color="gray" style={{ padding: 15 }} size="xl" leftIcon={<GoMarkGithub />} component="a" href="/api/auth/github">
              Github login
            </Button>
          </Card>
        </Center>
      </Container>
    </>
    )
  }

  return (<div>loading</div>)
}

const Home: BlitzPage = () => {
  return (
    <div className="container">
      <main>
        <div className="buttons" style={{ marginTop: "1rem", marginBottom: "1rem" }}>
          <Suspense fallback="">
            <UserInfo />
          </Suspense>
        </div>
      </main>
    </div>
  )
}

Home.suppressFirstRenderFlicker = true
Home.getLayout = (page) => <Layout title="Home">{page}</Layout>

export default Home
