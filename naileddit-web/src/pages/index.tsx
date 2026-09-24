import Layout from "../components/Layout";
import { usePostsQuery } from "../generated/graphql";
import { Box, Button, Flex, Heading, Icon, IconButton, Link, Stack, Text, textDecoration } from "@chakra-ui/react";
import NextLink from "next/link";
import { useState } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import UpdootSection from "../components/UpdootSection";

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
                  data.posts.posts.map(p => (
                    <Flex key={p.id} p={5} borderWidth="1px">
                      <UpdootSection post={p}/>
                      <Box>
                        <Link as={NextLink} href={`/post/${p.id}`} style={{ textDecoration: "none" }}>
                          <Heading fontSize="xl">{p.title}</Heading>
                        </Link>
                        <Text fontSize="small">Posted by: {p.creator.username}</Text>
                        <Text mt={4}>{p.textSnippet}</Text>
                      </Box> 
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
