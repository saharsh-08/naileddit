import NavBar from "../components/NavBar";
import { usePostsQuery } from "../generated/graphql";

const Index = () => {
  const [{ data }] = usePostsQuery();

  return (
    <>
      <NavBar />
      <div> Hello, world! </div>
      <br />
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
    </>
  );
};

export default Index;
