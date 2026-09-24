import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { Heading } from "@chakra-ui/react";
import { usePostQuery } from "../../generated/graphql";

const Post: React.FC<{}> = ({}) => {
  const router = useRouter();
  const { id } = router.query;
  const postIdInt = typeof id === "string" ? parseInt(id) : -1;
  const [{ data, fetching }] = usePostQuery({
    pause: postIdInt === -1,
    variables: {
      postId: postIdInt,
    },
  });

  if (fetching) {
    return <Layout><p>Loading...</p></Layout>;
  }

  if (!data?.post) {
    return <Layout><p>Post not found</p></Layout>;
  }

  return (
    <Layout>
      <Heading>{data.post.title}</Heading>
      {data.post.text}
    </Layout>
  );
};

export default Post;
