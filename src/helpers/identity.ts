import { SignIdentity, PublicKey } from "@dfinity/agent";
import { BinaryBlob, blobFromBuffer, blobFromUint8Array } from "@dfinity/candid";
import WalletConnect from "@walletconnect/client";

type SerializedPublicKey = string;

class WalletConnectIdentity extends SignIdentity {
  publicKey: PublicKey;

  connector: WalletConnect | null;

  constructor(publicKey: SerializedPublicKey, connector: WalletConnect | null) {
    super();

    const derKey = this.base64ToBuffer(publicKey);
    console.log(derKey);

    this.connector = connector;
    this.publicKey = { toDer: () => blobFromUint8Array(derKey) } as PublicKey;
  }

  public async sign(blob: BinaryBlob): Promise<BinaryBlob> {
    const message = this.bufferToBase64(blob);

    const customRequest = {
      id: 1337,
      jsonrpc: "2.0",
      method: "sign",
      params: [message],
    };

    if (!this.connector) throw new Error("Not Connector initialized");

    const result = await this.connector.sendCustomRequest(customRequest);

    console.log("RESULT", result);

    const signature = blobFromUint8Array(new Uint8Array(this.base64ToBuffer(result)));
    console.log("SIGNATURE", signature);

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
}

export default WalletConnectIdentity;
