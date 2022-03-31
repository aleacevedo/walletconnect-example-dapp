import * as React from "react";
import * as ReactDOM from "react-dom";
import { createGlobalStyle } from "styled-components";
import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";

import Connect from "./Pages/Connect";
import WalletConnect from "./Pages/WalletConnect";

import { globalStyle } from "./styles";
import App from "./App";
const GlobalStyle = createGlobalStyle`
  ${globalStyle}
`;

declare global {
  // tslint:disable-next-line
  interface Window {
    blockies: any;
  }
}

ReactDOM.render(
  <>
    <GlobalStyle />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Connect />} />
        <Route path="/wallet-connect" element={<WalletConnect />} />
        <Route path="/old" element={<App />} />
      </Routes>
    </BrowserRouter>
  </>,
  document.getElementById("root"),
);
