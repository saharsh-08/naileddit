import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import NextLink from "next/link";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";

interface UpdateDeleteButtonsProps {
  id: number;
  creatorId: number;
}

const UpdateDeleteButtons: React.FC<UpdateDeleteButtonsProps> = ({ id, creatorId }) => {
    const [{ data: meData }] = useMeQuery()
  const [, deletePost] = useDeletePostMutation();

  if (meData?.me?.id !== creatorId) return null;

  return (
    <Flex>
      <IconButton
        icon={<EditIcon />}
        as={NextLink}
        aria-label="Update"
        colorScheme="blackAlpha"
        mr={4}
        href={`/post/edit/${id}`}
      />
      <IconButton
        icon={<DeleteIcon />}
        aria-label="Delete"
        colorScheme="blackAlpha"
        onClick={async () => {
          await deletePost({ deletePostId: id });
        }}
      />
    </Flex>
  );
};

export default UpdateDeleteButtons;
