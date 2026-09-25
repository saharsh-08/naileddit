import { fetchExchange, Client, gql } from "urql";
import {
  RegisterMutation,
  MeQuery,
  MeDocument,
  LoginMutation,
  CreatePostMutation,
  VoteMutation,
  PostSnippetFragment,
  VoteMutationVariables,
  DeletePostMutation,
  MutationDeletePostArgs,
} from "../generated/graphql";
import { Cache, cacheExchange, Resolver } from "@urql/exchange-graphcache";
import { Exchange } from "urql";
import { pipe, tap } from "wonka";
import Router from "next/router";

const errorExchange: Exchange = ({ forward }) => (ops$) => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      if (typeof window !== 'undefined' && error?.message.includes("User is not authenticated")) {
        Router.replace("/login");
      }
    })
  );
};

const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName} = info;

    // This function will get all the fields in the cache under the entityKey - Query
    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
    const size = fieldInfos.length;

    if (size === 0) return undefined;

    // Check if the requested field with the given arguments is already in the cache
    // If the field with the given arguments is not in the cache, mark the info as partial
    // This ensures that the cache knows whether it has a complete set of data for this field.
    const fieldKey = `${fieldName}(${JSON.stringify(fieldArgs)})`;
    const isItInCache = cache.resolve(
      cache.resolve(entityKey, fieldKey) as string,
      "posts"
    );
    info.partial = !isItInCache;

    let hasMore = true;
    const posts: string[] = [];

    fieldInfos.forEach(fi => {
      const key = cache.resolve(entityKey, fi.fieldKey) as string;
      const data = cache.resolve(key, "posts") as string[];
      const _hasMore = cache.resolve(key, "hasMore") as boolean;

      if (!_hasMore) {
        hasMore = false;
      }
      posts.push(...data);
    });

    const result = {
      posts,
      hasMore,
      __typename: "PostsResponse"
    };
    return result;
  }
};

const invalidatePosts = (cache: Cache) => {
  const allFields = cache.inspectFields("Query");
  const fieldInfos = allFields.filter(info => info.fieldName === "posts");
  fieldInfos.forEach(fi => {
    cache.invalidate("Query", "posts", fi.arguments || {});
  });
};

// cache.updateQuery lets you update what a query returns from the cache, without hitting the network.
// The updated data is written into the graphcache's normalized store, ensuring consistency across the application.
// The cache will be updated whenever a mutation (register/login/logout) runs.

export const createUrqlClient = () => {
  return new Client({
    url: process.env.NEXT_PUBLIC_SERVER_URL,
    exchanges: [
      // cacheExchange must run before fetchExchange so cache reads/writes wire up to subscribers correctly
      cacheExchange({
        keys: {
          PostsResponse: () => null,
        },
        resolvers: {
          Query: {
            posts: cursorPagination(),
          }
        },
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
                  invalidatePosts(cache);
                  return {
                    me: _result.login.user,
                  };
                }
              });
            },
            // logout: (_result: LogoutMutation, args, cache, info) => {
            //   invalidatePosts(cache);
            //   cache.updateQuery<MeQuery>({ query: MeDocument }, () => {
            //     return { me: null };
            //   });
            // },
            createPost: (_result: CreatePostMutation, args, cache, info) => {
              // Invalidate the posts query to refetch the posts after creating a new post
              invalidatePosts(cache);
            },
            vote: (_result: VoteMutation, args, cache, info) => {
              const { postId, value } = args as VoteMutationVariables;
              const isUpdoot = value !== -1;
              const realValue = isUpdoot ? 1 : -1;

              const data = cache.readFragment(
                gql`
                  fragment _ on Post {
                    id
                    points
                    voteStatus
                  }
                `,
                { id: postId }
              ) as PostSnippetFragment;

              if (data) {
                const newPoints = data.voteStatus === realValue
                  ? data.points - data.voteStatus
                  : data.points + (!data.voteStatus ? 1 : 2) * realValue;
                const newVoteStatus = data.voteStatus === realValue
                  ? null
                  : realValue;

                cache.writeFragment(
                  gql`
                    fragment __ on Post {
                      points
                      voteStatus
                    }
                  `,
                  { id: postId, points: newPoints, voteStatus: newVoteStatus }
                );
              }
            },
            deletePost: (_result: DeletePostMutation, args, cache, info) => {
              const { id } = args as MutationDeletePostArgs;
              cache.invalidate(`Post:${id}`);
            }
          },
        },
      }),
      errorExchange,
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
