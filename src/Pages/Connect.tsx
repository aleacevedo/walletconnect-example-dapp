import * as React from "react";
import styled from "styled-components";
import WalletConnect from "@walletconnect/client";

import Button from "../components/Button";
import Column from "../components/Column";
import Wrapper from "../components/Wrapper";
import { fonts } from "../styles";
import { IAssetData } from "../helpers/types";
import { Navigate, useHref, useNavigate } from "react-router-dom";
import App from "../App";

const SLayout = styled.div`
  position: relative;
  width: 100%;
  /* height: 100%; */
  min-height: 100vh;
  text-align: center;
`;

const SContent = styled(Wrapper as any)`
  width: 100%;
  height: 100%;
  padding: 0 16px;
`;

const SLanding = styled(Column as any)`
  height: 600px;
`;

const SButtonContainer = styled(Column as any)`
  width: 250px;
  margin: 50px 0;
`;

const SConnectButton = styled(Button as any)`
  border-radius: 8px;
  font-size: ${fonts.size.medium};
  height: 44px;
  width: 100%;
  margin: 12px 0;
`;

const SContainer = styled.div`
  height: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  word-break: break-word;
`;

const SModalContainer = styled.div`
  width: 100%;
  position: relative;
  word-wrap: break-word;
`;

const SModalTitle = styled.div`
  margin: 1em 0;
  font-size: 20px;
  font-weight: 700;
`;

const SModalParagraph = styled.p`
  margin-top: 30px;
`;

// @ts-ignore
const SBalances = styled(SLanding as any)`
  height: 100%;
  & h3 {
    padding-top: 30px;
  }
`;

const STable = styled(SContainer as any)`
  flex-direction: column;
  text-align: left;
`;

const SRow = styled.div`
  width: 100%;
  display: flex;
  margin: 6px 0;
`;

const SKey = styled.div`
  width: 30%;
  font-weight: 700;
`;

const SValue = styled.div`
  width: 70%;
  font-family: monospace;
`;

const STestButtonContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
`;

const STestButton = styled(Button as any)`
  border-radius: 8px;
  font-size: ${fonts.size.medium};
  height: 44px;
  width: 100%;
  max-width: 175px;
  margin: 12px;
`;

interface IAppState {
  fetching: boolean;
  connected: boolean;
  chainId: number;
  showModal: boolean;
  pendingRequest: boolean;
  uri: string;
  accounts: string[];
  address: string;
  result: any | null;
  assets: IAssetData[];
}

const INITIAL_STATE: IAppState = {
  fetching: false,
  connected: false,
  chainId: 1,
  showModal: false,
  pendingRequest: false,
  uri: "",
  accounts: [],
  address: "",
  result: null,
  assets: [],
};

const Connect = () => {
  const navigate = useNavigate();
  const [connector, setConnector] = React.useState(null);
  const [connected, setConnected] = React.useState(false);
  const [account, setAccount] = React.useState("");

  const createSession = () => {
    if (connector.connected) {
      connector.killSession();
    }
    connector.createSession();
    console.log("SessionCreated URI: ", connector.uri);
  };

  React.useEffect(() => {
    const bridge = "https://bridge.walletconnect.org";

    const wcConnector = new WalletConnect({ bridge });

    wcConnector.on("connect", (error, payload) => {
      if (error) {
        throw error;
      }

      const { chainId, accounts } = payload.params[0];
      setConnected(true);
      setAccount(accounts[0]);
    });
    wcConnector.on("session_update", async (error, payload) => {
      if (error) {
        throw error;
      }
    });
    wcConnector.on("disconect", async (error, payload) => {
      setConnected(false);
      connector.killSession();
    });

    setConnector(wcConnector);
  }, []);

  const connect = async () => {
    createSession();

    const deepLink = `https://2f34-2800-21a0-4400-f0f-9cee-372c-fb93-4b7d.ngrok.io/wallet-connect?uri=${encodeURIComponent(
      connector.uri,
    )}`;

    window.location.replace(deepLink);
  };

  const disconnect = () => {
    if (connector.connected) {
      connector.killSession();
    }

    setConnected(false);
  };

  return (
    <>
      {!connected ? (
        <SLayout>
          <Column maxWidth={1000} spanHeight>
            <SContent>
              <SLanding center>
                <h3>
                  {`Try out WalletConnect`}
                  <br />
                  <span>{`v${process.env.REACT_APP_VERSION}`}</span>
                </h3>
                <SButtonContainer>
                  <SConnectButton left onClick={connect} disabled={!connector}>
                    {"Connect to WalletConnect"}
                  </SConnectButton>
                </SButtonContainer>
              </SLanding>
            </SContent>
          </Column>
        </SLayout>
      ) : (
        <App connector={connector} account={account} onDisconnect={disconnect} />
      )}
    </>
  );
};

export default Connect;
