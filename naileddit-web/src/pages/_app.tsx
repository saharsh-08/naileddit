import { ChakraProvider } from "@chakra-ui/react";
import theme from "../theme";
import { AppProps } from "next/app";
import { createUrqlClient } from "../utils/createUrqlClient";
import { Provider } from "urql";

const MyApp = ({ Component, pageProps }: AppProps) => {
  const client = createUrqlClient();

  return (
    <Provider value={client}>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </Provider>
  );
}

export default MyApp;
