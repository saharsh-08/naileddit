import { Box, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { InputField } from "../../../components/InputField";
import Layout from "../../../components/Layout";
import { useUpdatePostMutation } from "../../../generated/graphql";
import { getPostFromUrl } from "../../../utils/getPostFromUrl";
import { useRouter } from "next/router";

const EditPost: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [{ data, fetching }] = getPostFromUrl();
  const [, updatePost] = useUpdatePostMutation();

  if (fetching) {
    return <Layout><p>Loading...</p></Layout>;
  }

  if (!data?.post) {
    return <Layout><p>Post not found</p></Layout>;
  }

  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: data.post.title, text: data.post.text }}
        onSubmit={async (values) => {
          const response = await updatePost({
            updatePostId: data.post.id,
            ...values
          });
          if (!response.error) router.back();
        }}
      >
        {({ isSubmitting, status, setStatus }) => (
          <Form onChange={() => status && setStatus(undefined)}>
            <InputField
              label="Title"
              name="title"
            />
            <Box mt={4}>
              <InputField
                textarea
                label="Body"
                name="text"
              />
            </Box>
            <Button
              mt={4}
              colorScheme="teal"
              type="submit"
              isLoading={isSubmitting}
            >
              Edit Post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default EditPost;