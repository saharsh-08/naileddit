import Layout from "../components/Layout";
import { usePostsQuery } from "../generated/graphql";
import { Link } from "@chakra-ui/react";
import NextLink from "next/link";

const Index = () => {
  const [{ data }] = usePostsQuery();

  return (
    <Layout>
      <div> Hello, world! </div>
      <br />
      <Link as={NextLink} href="/create-post">Create a new post!</Link>
      <div>
        {
          !data
            ? <div>Loading...</div>
            : data.posts.map(post => (
            <div key={post.id}>
              <h2>{post.title}</h2>
            </div>
            ))
        }
      </div>
    </Layout>
  );
};

export default Index;
