import { ChakraProvider } from "@chakra-ui/react";
import { cacheExchange } from "@urql/exchange-graphcache";
import theme from "../theme";
import { AppProps } from "next/app";
import { Provider, Client, fetchExchange } from "urql";
import { LoginMutation, LogoutMutation, MeDocument, MeQuery, RegisterMutation } from "../generated/graphql";

// cache.updateQuery lets you update what a query returns from the cache, without hitting the network.
// The updated data is written into the graphcache's normalized store, ensuring consistency across the application.
// The cache will be updated whenever a mutation (register/login/logout) runs.

const client = new Client({
  url: "http://localhost:4000/graphql",
  exchanges: [
    // cacheExchange must run before fetchExchange so cache reads/writes wire up to subscribers correctly
    cacheExchange({
      updates: {
        Mutation: {
          register: (_result: RegisterMutation, args, cache, info) => {
            cache.updateQuery<MeQuery>(
              { query: MeDocument },
              (data) => {
                if (_result.register.errors) {
                  return data;
                } else {
                  return {
                    me: _result.register.user,
                  };
                }
              }
            );
          },
          login: (_result: LoginMutation, args, cache, info) =>  {
            cache.updateQuery<MeQuery>(
              { query: MeDocument },
              (data) => {
                if (_result.login.errors) {
                  return data;
                } else {
                  return {
                    me: _result.login.user,
                  };
                }
              }
            );
          },
          logout: (_result: LogoutMutation, args, cache, info) => {
            cache.updateQuery<MeQuery>(
              { query: MeDocument },
              () => {
                return { me: null };
              }
            );
          },
        }
      }
    }),
    fetchExchange
  ],
  fetchOptions: {
    credentials: "include",
    // Forces the browser to send a CORS preflight, satisfying Apollo Server's CSRF prevention
    headers: {
      "Apollo-Require-Preflight": "true"
    }
  }
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider value={client}>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </Provider>
  );
}

export default MyApp;
