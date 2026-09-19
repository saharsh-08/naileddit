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


const ForgotPassword: React.FC<{}> = ({}) => {
  const [, forgotPassword] = useForgotPasswordMutation();
  const [status, setStatus] = useState(false);

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: "" }}
        onSubmit={async (values) => {
          await forgotPassword(values);
          setStatus(true);
        }}
      >
        {({ isSubmitting }) =>
          status
          ? (
            <div>
              If an account with that email exists, we sent you an email.
            </div>
          )
          : (
            <Form>
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
          )
        }
      </Formik>
    </Wrapper>
  );
};

export default ForgotPassword;
