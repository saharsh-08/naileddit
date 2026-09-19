import React, { useState } from "react";
import { Wrapper } from "../components/Wrapper";
import { Form, Formik } from "formik";
import { InputField } from "../components/InputField";
import NextLink from "next/link";
import {
  Button,
  Link,
} from "@chakra-ui/react";
import { useForgotPasswordMutation } from "../generated/graphql";
import { useRouter } from "next/router";


const ForgotPassword: React.FC<{}> = ({}) => {
  const [, forgotPassword] = useForgotPasswordMutation();
  const [status, setStatus] = useState(false);
  const router = useRouter();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: "" }}
        onSubmit={async (values) => {
          await forgotPassword(values);
          setStatus(true);
        }}
      >
        {({ isSubmitting, status, setStatus }) => (
          <Form onChange={() => status && setStatus(undefined)}>
            <InputField
              label="Email"
              name="email"
              placeholder="Email"
            />
            <Button
              mt={4}
              mr={4}
              colorScheme="teal"
              type="button"
            >
              <Link as={NextLink} href="/login">
                Go Back To Login
              </Link>
            </Button>
            <Button
              mt={4}
              colorScheme="teal"
              type="submit"
              isLoading={isSubmitting}
            >
              Forgot Password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default ForgotPassword;
