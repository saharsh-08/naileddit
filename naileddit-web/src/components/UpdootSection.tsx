import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Flex, IconButton, Box } from "@chakra-ui/react";
import { useState } from "react";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";

interface UpdootSectionProps {
  post: PostSnippetFragment;
}

const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
  const [loadingState, setLoadingState] = useState<'not-loading' | 'updoot-loading' | 'downdoot-loading'>('not-loading');
  const [, vote] = useVoteMutation();

  return (
    <Flex mr={4} direction="column" justifyContent="center" alignItems="center">
      <IconButton
        aria-label="updoot"
        icon={<ChevronUpIcon boxSize={6} />}
        colorScheme={post.voteStatus === 1 ? "red" : null}
        _hover={{ color: "red.500", bg: "red.50" }}
        onClick={async () => {
          setLoadingState('updoot-loading');
          await vote({ value: 1, postId: post.id });
          setLoadingState('not-loading');
        }}
        isLoading={loadingState === 'updoot-loading'}
      />
      <Box mt={2} mb={2} fontWeight="bold">
        {post.points}
      </Box>  
      <IconButton
        aria-label="downdoot"
        icon={<ChevronDownIcon boxSize={8} />}
        colorScheme={post.voteStatus === -1 ? "purple" : undefined}
        _hover={{ color: "purple.500", bg: "purple.50" }}
        onClick={async () => {
          setLoadingState('downdoot-loading');
          await vote({ value: -1, postId: post.id });
          setLoadingState('not-loading');
        }}
        isLoading={loadingState === 'downdoot-loading'}
      />
    </Flex>
  );
};

export default UpdootSection;
