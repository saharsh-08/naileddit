import { Alert, AlertIcon, AlertDescription, Button, Link, Box } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { NextPage } from "next";
import { useRouter } from "next/router";
import NextLink from "next/link";
import { useState } from "react";
import { InputField } from "../../components/InputField";
import { Wrapper } from "../../components/Wrapper";
import { useChangePasswordMutation } from "../../generated/graphql";
import { toErrorMap } from "../../utils/toErrorMap";


const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
  const router = useRouter();
  const [tokenError, setTokenError] = useState("");
  const [, changePassword] = useChangePasswordMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ newPassword: "" }}
        onSubmit={async (values, { setStatus }) => {
          const response = await changePassword(
            {
              token,
              newPassword: values.newPassword
            }
          );

          if (response.data?.changePassword.errors) {
            const errorMap = toErrorMap(response.data.changePassword.errors);
            if ("user/token" in errorMap) {
              setTokenError(errorMap["user/token"]);
            }
            setStatus(errorMap);
          } else if (response.data.changePassword.user) {
            router.push("/");
          }
        }}
      >
        {({ isSubmitting, status, setStatus }) => (
          <Form onChange={() => { setStatus(undefined); setTokenError(""); }}>
            <InputField
              label="New Password"
              name="newPassword"
              placeholder="New Password"
              type="password"
            />
            {
              status
                ? (
                  <Alert status="error" mt={4} borderRadius="md">
                    <AlertIcon />
                    <AlertDescription mr={4}>
                      {Object.keys(status).map(key => `${status[key]}`).join(", ")}
                    </AlertDescription>
                  </Alert>
                )
                : null
            }
            {
              tokenError
              ? (
                <Box mt={4} mr={4}>
                  <Link as={NextLink} href="/forgot-password">Forgot Password</Link>
                </Box>
              )
              : null
            }
            <Button
              mt={4}
              colorScheme="teal"
              type="submit"
              isLoading={isSubmitting}
            >
              Change Password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

ChangePassword.getInitialProps = ({ query }) => {
  return {
    token: query.token as string,
  };
};

export default ChangePassword;