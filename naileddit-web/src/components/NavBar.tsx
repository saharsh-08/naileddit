import { Box, Flex, Link, Button } from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";

interface NavBarProps {}

const NavBar: React.FC<NavBarProps> = ({}) => {
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
        <Link as={NextLink} href="/login" mr={4}>Login</Link>
        <Link as={NextLink} href="/register">Register</Link>
      </>
    );
  }
  // If user is logged in
  else {
    body = (
      <Flex>
        <Box mr={2}>{data.me.username}</Box>
        <Button
          variant="link"
          // Pass the additionalTypenames context to ensure the cache is updated correctly after logout
          onClick={() => logout({})}
          isLoading={logoutFetching}
        >
          Logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex zIndex={1} position="sticky" top={0} bg="tomato" p={4} >
      <Box ml={"auto"}>
        {body}
      </Box>
    </Flex>
  );
};

export default NavBar;