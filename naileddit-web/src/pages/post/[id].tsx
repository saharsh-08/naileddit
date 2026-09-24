import Layout from "../../components/Layout";
import { Heading, Box, Flex } from "@chakra-ui/react";
import { getPostFromUrl } from "../../utils/getPostFromUrl";
import UpdateDeleteButtons from "../../components/UpdateDeleteButtons";

const Post: React.FC<{}> = ({}) => {
  const [{ data, fetching }] = getPostFromUrl();

  if (fetching) {
    return <Layout><p>Loading...</p></Layout>;
  }

  if (!data?.post) {
    return <Layout><p>Post not found</p></Layout>;
  }

  return (
    <Layout>
      <Flex align="flex-start">
        <Box flex={1} mr={4}>
          <Heading mb={4}>{data.post.title}</Heading>
          <Box>{data.post.text}</Box>
        </Box>
        <Box ml="auto">
          <UpdateDeleteButtons
            id={data.post.id}
            creatorId={data.post.creator.id}
          />
        </Box>
      </Flex>
    </Layout>
  );
};

export default Post;
