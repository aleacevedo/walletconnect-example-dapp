import {
    SignIdentity,
    PublicKey,
  } from "@dfinity/agent";
import { BinaryBlob } from "@dfinity/candid";
import WalletConnect from "@walletconnect/client";

type SerializedPublicKey = string

class WalletConnectIdentity extends SignIdentity {

    publicKey: PublicKey;

    connector: WalletConnect | null;

    encoder = new TextEncoder();
    decoder = new TextDecoder();

    constructor(
        publicKey: SerializedPublicKey,
        connector: WalletConnect | null 
    ) {
        super();

        const derKey = this.encoder.encode(publicKey);

        this.connector = connector;
        this.publicKey = { toDer: () => derKey.buffer } as PublicKey;
    }


    public async sign(blob: BinaryBlob) : Promise<BinaryBlob>{
        const decoder = new TextDecoder('utf-8');
        const encoder = new TextEncoder();
        const message = decoder.decode(blob);

        const customRequest = {
            id: 1337,
            jsonrpc: "2.0",
            method: 'sign',
            params: [message],
          };
        
        if (!this.connector)
          throw new Error("Not Connector initialized");

        const result = await this.connector.sendCustomRequest(customRequest)

        const signature = encoder.encode(result[0]);


        return signature.buffer as BinaryBlob
    }

    public getPublicKey() {
        return this.publicKey;
    }
}

export default WalletConnectIdentity