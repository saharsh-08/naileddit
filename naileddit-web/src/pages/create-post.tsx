import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import { InputField } from "../components/InputField";
import Layout from "../components/Layout";
import { useCreatePostMutation } from "../generated/graphql";
import { useIsAuth } from "../utils/useIsAuth";


const CreatePost: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [, createPost] = useCreatePostMutation();
  useIsAuth();

  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: "", text: "" }}
        onSubmit={async (values) => {
          const response = await createPost({options: values});
          if (!response.error) router.push("/");
        }}
      >
        {({ isSubmitting, status, setStatus }) => (
          <Form onChange={() => status && setStatus(undefined)}>
            <InputField
              label="Title"
              name="title"
              placeholder="Title"
            />
            <Box mt={4}>
              <InputField
                textarea
                label="Body"
                name="text"
                placeholder="Text..."
              />
            </Box>
            <Button
              mt={4}
              colorScheme="teal"
              type="submit"
              isLoading={isSubmitting}
            >
              Create Post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default CreatePost;
