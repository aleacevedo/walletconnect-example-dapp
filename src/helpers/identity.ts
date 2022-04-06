import { SignIdentity, PublicKey, HttpAgentRequest, ReadRequestType } from "@dfinity/agent";
import { BinaryBlob, blobFromBuffer, blobFromUint8Array } from "@dfinity/candid";
import { Principal } from "@dfinity/principal";
import WalletConnect from "@walletconnect/client";

import { requestIdOf } from "./request_id";

type SerializedPublicKey = string;

const domainSeparator = Buffer.from(new TextEncoder().encode("\x0Aic-request"));

class WalletConnectIdentity extends SignIdentity {
  publicKey: PublicKey;

  connector: WalletConnect | null;

  constructor(publicKey: SerializedPublicKey, connector: WalletConnect | null) {
    super();

    const derKey = this.base64ToBuffer(publicKey);

    this.connector = connector;
    this.publicKey = { toDer: () => blobFromUint8Array(derKey) } as PublicKey;
  }

  public async sign(blob: BinaryBlob): Promise<BinaryBlob> {
    console.log("SIGN");
    const message = this.bufferToBase64(blob);

    const customRequest = {
      method: "sign",
      params: [message],
    };

    if (!this.connector) throw new Error("Not Connector initialized");

    const result = await this.connector.sendCustomRequest(customRequest);

    const signature = blobFromUint8Array(new Uint8Array(this.base64ToBuffer(result)));

    return signature;
  }

  public async signReadState(blob: BinaryBlob): Promise<BinaryBlob> {
    console.log("SIGN_READ_STATE");
    const message = this.bufferToBase64(blob);

    const customRequest = {
      method: "sign_read_state",
      params: [message],
    };

    if (!this.connector) throw new Error("Not Connector initialized");

    const result = await this.connector.sendCustomRequest(customRequest);

    console.log("SIGN_READ_STATE, result", result);

    const signature = blobFromUint8Array(new Uint8Array(this.base64ToBuffer(result.result)));

    return signature;
  }

  public getPublicKey() {
    return this.publicKey;
  }

  private bufferToBase64(buf: Uint8Array) {
    return Buffer.from(buf.buffer).toString("base64");
  }

  private base64ToBuffer(base64: string) {
    return Buffer.from(base64, "base64");
  }

  public async transformRequest(request: HttpAgentRequest): Promise<unknown> {
    const { body, ...fields } = request;

    const canister =
      body?.canister_id instanceof Principal
        ? body?.canister_id
        : Principal.fromUint8Array(body?.canister_id?._arr);

    const requestId = await requestIdOf(body);
    let sender_sig;

    if (body.request_type === ReadRequestType.ReadState) {
      sender_sig = await this.signReadState(
        blobFromUint8Array(new Uint8Array(Buffer.concat([domainSeparator, requestId]))),
      );
    } else {
      sender_sig = await this.sign(
        blobFromUint8Array(new Uint8Array(Buffer.concat([domainSeparator, requestId]))),
      );
    }

    const transformedResponse = {
      ...fields,
      body: {
        content: body,
        sender_pubkey: this.getPublicKey().toDer(),
        sender_sig,
      },
    };
    return transformedResponse;
  }
}

export default WalletConnectIdentity;
