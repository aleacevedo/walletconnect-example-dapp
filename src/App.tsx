import * as React from "react";
import styled from "styled-components";
import WalletConnect from "@walletconnect/client";
import { IInternalEvent } from "@walletconnect/types";
import { Actor, HttpAgent, SignIdentity } from "@dfinity/agent";

import Button from "./components/Button";
import Column from "./components/Column";
import Wrapper from "./components/Wrapper";
import Modal from "./components/Modal";
import Header from "./components/Header";
import Loader from "./components/Loader";
import { fonts } from "./styles";
import { apiGetAccountAssets } from "./helpers/api";
import { IAssetData } from "./helpers/types";
import Banner from "./components/Banner";
import AccountAssets from "./components/AccountAssets";
import WalletConnectIdentity from "./helpers/identity";
import ICPDid from "./idls/ICP.did";
import ICPInterface from "./interfaces/ICP";
import { Principal } from "@dfinity/principal";

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

const App = ({
  account,
  connector,
  onDisconnect,
}: {
  account: string;
  connector: WalletConnect;
  onDisconnect: any;
}) => {
  const [showModal, setShowModal] = React.useState(false);
  const [pendingRequest, setPendingRequesat] = React.useState(false);
  const [result, setResult] = React.useState(null);
  const [fetching, setFetching] = React.useState(true);
  const [identity, setIdentity] = React.useState(null);
  const [address, setAddress] = React.useState("");
  const [assets, setAssets] = React.useState([]);
  const [ICPActor, setICPActor] = React.useState<ICPInterface>(null);
  const chainId = 1;

  React.useEffect(() => {
    try {
      const identityB = new WalletConnectIdentity(account, connector);
      setAddress(identityB.getPrincipal().toString());
      setIdentity(identityB);
    } catch (e) {
      console.log("APP ERROR", e);
      onDisconnect();
    }
  }, [account, connector]);

  React.useEffect(() => {
    const fetchAssets = async () => {
      setFetching(true);
      const response = await connector.sendCustomRequest({
        method: "getAssets",
      });
      setAssets(response.payload.assets);
      setFetching(false);
    };
    fetchAssets();
  }, [account, connector]);

  React.useEffect(() => {
    if (!identity) return;
    try {
      const agent = new HttpAgent({ host: "https://ic0.app/", identity });
      setICPActor(
        Actor.createActor<ICPInterface>(ICPDid, {
          agent,
          canisterId: "ryjl3-tyaaa-aaaaa-aaaba-cai",
        }),
      );
    } catch (e) {
      console.log("APP ERROR", e);
      onDisconnect();
    }
  }, [account, connector, identity]);

  const disconnect = () => {
    onDisconnect();
  };

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const sendICP = async () => {
    console.log("SEND ICP");
    setResult(null);
    setPendingRequesat(true);
    if (!ICPActor) return;
    toggleModal();
    const defaultArgs = {
      fee: BigInt(10000),
      memo: BigInt(0),
    };
    const result = await ICPActor.send_dfx({
      to: "c147b7b75ea244eaa316b82187411a17b108ecd4f877fc3950130c259ee14fc8",
      fee: { e8s: defaultArgs.fee },
      amount: { e8s: BigInt(100000000) },
      memo: defaultArgs.memo,
      from_subaccount: [], // For now, using default subaccount to handle ICP
      created_at_time: [],
    });

    console.log("RESULT", result);

    setResult(result);
    setPendingRequesat(false);
  };

  return (
    <SLayout>
      <Column maxWidth={1000} spanHeight>
        <Header connected={true} address={address} chainId={chainId} killSession={disconnect} />
        <SContent>
          <SBalances>
            <Banner />
            <h3>Actions</h3>
            <Column center>
              <STestButtonContainer>
                <STestButton left onClick={sendICP}>
                  {"SEND 1 ICP"}
                </STestButton>
              </STestButtonContainer>
            </Column>
            <h3>Balances</h3>
            {!fetching ? (
              <AccountAssets chainId={chainId} assets={assets} />
            ) : (
              <Column center>
                <SContainer>
                  <Loader />
                </SContainer>
              </Column>
            )}
          </SBalances>
        </SContent>
      </Column>
      <Modal show={showModal} toggleModal={toggleModal}>
        {pendingRequest ? (
          <SModalContainer>
            <SModalTitle>{"Pending Call Request"}</SModalTitle>
            <SContainer>
              <Loader />
              <SModalParagraph>{"Approve or reject request using your wallet"}</SModalParagraph>
            </SContainer>
          </SModalContainer>
        ) : result ? (
          <SModalContainer>
            <SModalTitle>{"Call Request Approved"}</SModalTitle>
            <STable>
              {Object.keys(result).map((key) => (
                <SRow key={key}>
                  <SKey>{key}</SKey>
                  <SValue>{result[key].toString()}</SValue>
                </SRow>
              ))}
            </STable>
          </SModalContainer>
        ) : (
          <SModalContainer>
            <SModalTitle>{"Call Request Rejected"}</SModalTitle>
          </SModalContainer>
        )}
      </Modal>
    </SLayout>
  );
};

export default App;
