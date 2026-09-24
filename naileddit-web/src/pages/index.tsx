import Layout from "../components/Layout";
import { useMeQuery, usePostsQuery } from "../generated/graphql";
import { Box, Button, Flex, Heading, Link, Stack, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { useState } from "react";
import UpdootSection from "../components/UpdootSection";
import UpdateDeleteButtons from "../components/UpdateDeleteButtons";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 10,
    cursor: null
  });
  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  return (
    <Layout>
      <div>
        {
          fetching && !data
            ? <div>Loading...</div>
            : (
              <Stack spacing={8}>
                {
                  data.posts.posts.map(p => !p ? null : (
                    <Flex key={p.id} p={5} borderWidth="1px">
                      <UpdootSection post={p}/>
                      <Box flex={1}>
                        <Link as={NextLink} href={`/post/${p.id}`} display="inline-block" style={{ textDecoration: "none" }}>
                          <Heading fontSize="xl">{p.title}</Heading>
                        </Link>
                        <Text fontSize="small">Posted by: {p.creator.username}</Text>
                        <Text mt={4}>{p.textSnippet}</Text>
                      </Box>
                        <UpdateDeleteButtons id={p.id} creatorId={p.creatorId} />
                    </Flex>
                  ))
                }
              </Stack>
            )
        }
      </div>
      { data && data.posts.hasMore
        ? (
          <Flex>
            <Button
              m="auto"
              my={8}
              isLoading={fetching}
              onClick={() => {
                setVariables({
                  limit: variables.limit,
                  cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
                })
              }}
            >
              Load More
            </Button>
          </Flex>
        )
        : null
      }
    </Layout>
  );
};

export default Index;
