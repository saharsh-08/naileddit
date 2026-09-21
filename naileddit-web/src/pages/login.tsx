import React from "react";
import { useRouter } from "next/router";
import { Form, Formik } from "formik";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import NextLink from "next/link";
import { Alert, AlertDescription, AlertIcon, Box, Button, Link } from "@chakra-ui/react";
import { useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";

// In Next.js, each file inside the pages directory automatically becomes a route.

const Login: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [, login] = useLoginMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ usernameOrEmail: "", password: "" }}
        onSubmit={async (values, { setStatus }) => {
          const response = await login(
            {
              input: values.usernameOrEmail,
              password: values.password
            }
          );
          if (response.data?.login.errors) {
            const errorMap = toErrorMap(response.data.login.errors);
            setStatus(errorMap);
          } else if (response.data.login.user) {
            if (typeof router.query.next === 'string') {
              router.push(router.query.next);
            } else {
              router.push("/");
            }
          }
        }}
      >
        {({ isSubmitting, status, setStatus }) => (
          <Form onChange={() => status && setStatus(undefined)}>
            <InputField
              label="Username or Email"
              name="usernameOrEmail"
              placeholder="Username or Email"
            />
            <Box mt={4}>
              <InputField
                label="Password"
                name="password"
                placeholder="Password"
                type="password"
              />
            </Box>
            {status ? (
              <Alert status="error" mt={4} borderRadius="md">
                <AlertIcon />
                <AlertDescription>
                  {Object.keys(status).map(key => `${status[key]}`).join(", ")}
                </AlertDescription>
              </Alert>
            ) : null}
            <Box mt={2} textAlign="right">
              <Link as={NextLink} href="/forgot-password">Forgot Password</Link>
            </Box>
            <Button
              as={NextLink}
              colorScheme="teal"
              type="button"
              href="/"
              mt={4}
              mr={4}
            >
              Go To Home
            </Button>
            <Button
              mt={4}
              colorScheme="teal"
              type="submit"
              isLoading={isSubmitting}
            >
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Login;
