import { useRouter } from "next/router";
import { usePostQuery } from "../generated/graphql";


export const getPostFromUrl = () => {
  const router = useRouter();
  const { id } = router.query;
  const postIdInt = typeof id === "string" ? parseInt(id) : -1;
  return usePostQuery({
    pause: postIdInt === -1,
    variables: {
      postId: postIdInt,
    },
  });
};
