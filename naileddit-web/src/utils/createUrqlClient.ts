import { fetchExchange, Client } from "urql";
import {
  RegisterMutation,
  MeQuery,
  MeDocument,
  LoginMutation,
  LogoutMutation,
} from "../generated/graphql";
import { cacheExchange } from "@urql/exchange-graphcache";

// cache.updateQuery lets you update what a query returns from the cache, without hitting the network.
// The updated data is written into the graphcache's normalized store, ensuring consistency across the application.
// The cache will be updated whenever a mutation (register/login/logout) runs.

export const createUrqlClient = () => {
  return new Client({
    url: "http://localhost:4000/graphql",
    exchanges: [
      // cacheExchange must run before fetchExchange so cache reads/writes wire up to subscribers correctly
      cacheExchange({
        updates: {
          Mutation: {
            register: (_result: RegisterMutation, args, cache, info) => {
              cache.updateQuery<MeQuery>({ query: MeDocument }, (data) => {
                if (_result.register.errors) {
                  return data;
                } else {
                  return {
                    me: _result.register.user,
                  };
                }
              });
            },
            login: (_result: LoginMutation, args, cache, info) => {
              cache.updateQuery<MeQuery>({ query: MeDocument }, (data) => {
                if (_result.login.errors) {
                  return data;
                } else {
                  return {
                    me: _result.login.user,
                  };
                }
              });
            },
            logout: (_result: LogoutMutation, args, cache, info) => {
              cache.updateQuery<MeQuery>({ query: MeDocument }, () => {
                return { me: null };
              });
            },
          },
        },
      }),
      fetchExchange,
    ],
    fetchOptions: {
      credentials: "include",
      // Forces the browser to send a CORS preflight, satisfying Apollo Server's CSRF prevention
      headers: {
        "Apollo-Require-Preflight": "true",
      },
    },
  });
};
