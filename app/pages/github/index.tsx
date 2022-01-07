import { Affix, Button, Divider, NativeSelect, Pagination, Paper, Skeleton, Text, TextInput, Transition } from "@mantine/core";
import { useDebouncedValue, useWindowScroll } from "@mantine/hooks";
import { useNotifications } from '@mantine/notifications';
import { useContextDiServices } from "app/core/hooks";
import List from "app/githubs/components/githubDataList";
import GithubHeader from "app/githubs/components/githubheader";
import GithubWrapper from "app/githubs/components/githubWrapper";
import LanguagesMulti from "app/githubs/components/langagesMulti";
import RepoCardItem from "app/githubs/components/repoCardItem";
import TopicsMulti from "app/githubs/components/topicsMulti";
import { useBridgeService } from "app/githubs/hooks/useBridgeService.hook";
import useQueryBuilder from "app/githubs/hooks/useQueryBuilder";
import getLanguageCount from "app/githubs/queries/getLanguageCount";
import getRepoCount from "app/githubs/queries/getRepoCount";
import getTopicGrouped from "app/githubs/queries/getTopicGrouped";
import getTopicsCount from "app/githubs/queries/getTopicsCount";
import { GetServerSideProps, InferGetServerSidePropsType, invokeWithMiddleware, useSession } from "blitz";
import { BlitzPage } from "next";
import React, { Suspense, useCallback, useEffect, useState } from "react";
import { AiOutlineArrowUp } from "react-icons/ai";
import { FaHashtag } from "react-icons/fa";
import { GoRepo } from "react-icons/go";
import { IoLanguageSharp } from "react-icons/io5";

export const getServerSideProps: GetServerSideProps = async ({ params, req, res }) => {

  const repoCount = invokeWithMiddleware(getRepoCount, {}, { req, res })
  const topicCount = invokeWithMiddleware(getTopicsCount, {}, { req, res })
  const languageCount = invokeWithMiddleware(getLanguageCount, {}, { req, res })
  const topicGrouped = invokeWithMiddleware(getTopicGrouped, {}, { req, res })

  const data = await Promise.all([repoCount, topicCount, languageCount, topicGrouped])

  return { props: { repoCount: data[0], topicCount: data[1], languageCount: data[2] } }
}

const GithubPortalPage: BlitzPage = ({ repoCount, topicCount, languageCount }: InferGetServerSidePropsType<typeof getServerSideProps>) => {

  // useTest([
  //   {
  //     event: "sync-server-start",
  //     action: (handlerActionsArgs) => {
  //       const id = notifications.showNotification({
  //         loading: true,
  //         title: handlerActionsArgs.eventArgs.title,
  //         message: handlerActionsArgs.eventArgs.message,
  //         autoClose: false,
  //         disallowClose: true,
  //       });

  //       handlerActionsArgs.container.current = id
  //     }
  //   }
  // ])

  const session = useSession({ suspense: false })
  const notifications = useNotifications();
  const { socket, queryBuilderService } = useContextDiServices()
  const { where, orderBy, withFullText, withTopics, withLanguages, withOrderBy, withOrderByDirection } = useQueryBuilder(queryBuilderService)
  const { setStart } = useBridgeService(session.userId!, socket, notifications)
  const [syncWithGithub, setSyncWithGithub] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [debouncedWhere] = useDebouncedValue(where, 300)
  const [debouncedOrder] = useDebouncedValue(orderBy, 300)
  const [scroll, scrollTo] = useWindowScroll()

  useEffect(() => {

    setCurrentPage(1)

    return () => {
    }
  }, [debouncedWhere])

  useEffect(() => {
    if (syncWithGithub) {
      setStart(state => true)
    }

    return () => {

    }
  }, [syncWithGithub])

  const syncWithGithubHandler = useCallback((flag: boolean) => {
    setSyncWithGithub(flag)
  }, [])

  const setTotalPagesHandler = useCallback((totalPages: number) => {
    setTotalPages(totalPages)
  }, [])

  function skeletonList() {
    return Array.from(Array(30).keys(), (n) => (
      <div style={{ margin: "1rem" }}>
        <Skeleton height={50} circle mb="xl" />
        <Skeleton height={8} radius="xl" />
        <Skeleton height={8} mt={6} radius="xl" />
        <Skeleton height={8} mt={6} width="70%" radius="xl" />
      </div>
    ))
  }

  return (
    <div>
      <GithubHeader syncWithGithubHandler={syncWithGithubHandler} />
      <div style={{ display: "flex", justifyContent: "space-between", margin: "1rem", height: "5rem" }}>
        <Paper padding="sm" shadow="md" radius="lg" withBorder>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <GoRepo size="32px" style={{ marginRight: "0.3em" }} />
            <div>
              <h1 style={{ margin: "-0.1em" }}>{repoCount}</h1>
              <Text>Total repositories synced from Github</Text>
            </div>
          </div>
        </Paper>
        <Paper padding="sm" shadow="md" radius="lg" withBorder>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <FaHashtag size="32px" style={{ marginRight: "0.3em" }} />
            <div>
              <h1 style={{ margin: "-0.1em" }}>{topicCount}</h1>
              <Text>Total topics synced from Github</Text>
            </div>
          </div>
        </Paper>
        <Paper padding="sm" shadow="md" radius="lg" withBorder>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <IoLanguageSharp size="32px" style={{ marginRight: "0.3em" }} />
            <div>
              <h1 style={{ margin: "-0.1em" }}>{languageCount}</h1>
              <Text>Total languages synced from Github</Text>
            </div>
          </div>
        </Paper>
      </div>
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <div style={{ padding: "1rem", display: "flex", gap: "1rem", flexDirection: "column", flexBasis: "0", flexGrow: "1", flexShrink: "1", alignSelf: "flex-start", top: 0, position: "sticky" }}>
          <TextInput label={<Text weight={700}>Search</Text>} onChange={(event) => withFullText(event.currentTarget.value)} placeholder="full text search.." />
          <Suspense fallback={<Skeleton height={8} mt={6} width="70%" radius="xl" />}>
            <TopicsMulti withTopics={withTopics} />
          </Suspense>
          <Suspense fallback={<Skeleton height={8} mt={6} width="70%" radius="xl" />}>
            <LanguagesMulti withLanguages={withLanguages} />
          </Suspense>
          <Divider />
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
            <NativeSelect
              label="Order by"
              placeholder="Pick a hashtag"
              data={['', 'id', 'name', 'stargazers_count', 'latest_commit']}
              onChange={(event) => { withOrderBy(event.target.value) }}
            />
            <NativeSelect
              label="Ordering"
              placeholder="Pick a hashtag"
              data={['asc', 'desc']}
              onChange={(event) => { withOrderByDirection(event.target.value) }}
            />
          </div>
          <Divider />
          <Pagination page={currentPage} onChange={setCurrentPage} total={totalPages} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", flexBasis: "0", flexGrow: "3" }}>
          <Suspense fallback={skeletonList()}>
            <GithubWrapper currentPage={currentPage} where={debouncedWhere} orderBy={debouncedOrder} setTotalPagesHandler={setTotalPagesHandler}>
              {
                (data) => <List style={{ margin: "1rem" }} data={data} renderItem={item => (<RepoCardItem key={item.id} data={item} />)} />
              }
            </GithubWrapper>
          </Suspense>
        </div>
      </div>
      <Affix position={{ bottom: 20, right: 20 }}>
        <Transition transition="slide-up" mounted={scroll.y > 0}>
          {(transitionStyles) => (
            <Button
              leftIcon={<AiOutlineArrowUp />}
              style={transitionStyles}
              onClick={() => scrollTo({ y: 0 })}
            >
              Scroll to top
            </Button>
          )}
        </Transition>
      </Affix>
    </div>
  )
}

GithubPortalPage.suppressFirstRenderFlicker = true

export default GithubPortalPage