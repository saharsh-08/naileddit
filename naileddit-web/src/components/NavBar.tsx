import { Box, Flex, Link, Button, Heading } from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";

interface NavBarProps {}

const NavBar: React.FC<NavBarProps> = ({}) => {
  const router = useRouter();
  const [{ data, fetching }] = useMeQuery();
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  let body = null;

  // If data is getting fetched
  if (fetching) {
    body = null;
  }
  // If user is not logged in
  else if (!data?.me) {
    body = (
      <>
        <Button as={NextLink} href="/login" mr={4}>Login</Button>
        <Button as={NextLink} href="/register">Register</Button>
      </>
    );
  }
  // If user is logged in
  else {
    body = (
      <>
        <Box mr={4} fontSize="large">{data.me.username}</Box>
        <Button
          // Pass the additionalTypenames context to ensure the cache is updated correctly after logout
          onClick={async () => {
            await logout({});
            router.reload();
          }}
          isLoading={logoutFetching}
          fill="white"
        >
          Logout
        </Button>
      </>
    );
  }

  return (
    <Flex zIndex={1} position="sticky" top={0} bg="tomato" p={4}>
      <Flex align="center" maxW={1000} flex={1} m="auto">
        <Link as={NextLink} href="/" style={{ textDecoration: "none" }}>
          <Heading size="lg">Naileddit</Heading>
        </Link>   
        <Link
          as={NextLink} href="/create-post"
          ml={6}
        >
          Create a new post!
        </Link>
        <Flex align="center" ml="auto">
          {body}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default NavBar;