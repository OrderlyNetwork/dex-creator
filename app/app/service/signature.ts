import {
  getOnChainDomain,
  getOffChainDomain,
  type EIP712Domain,
  MESSAGE_TYPES,
} from "../utils/orderly";
import { WalletClient, type Address } from "viem";

export type BindDistributorCodeInputs = {
  inviteeAddress: string;
  distributorCode: string;
};

export interface SignatureServiceConfig {
  walletClient: WalletClient | null;
  chainId: number;
  address: Address;
}

export type ToSignatureMessage = {
  domain: EIP712Domain;
  message: any;
  primaryType: string;
  types: any;
};

export class SignatureService {
  private walletClient: WalletClient;
  private chainId: number;
  private address: Address;

  constructor(config: SignatureServiceConfig) {
    this.chainId = config.chainId;
    this.address = config.address;
    if (!config.walletClient) {
      throw new Error("Wallet client is required");
    }
    this.walletClient = config.walletClient;
  }

  /**
   * Sign typed data using EIP712 with viem
   */
  async signTypedData(toSignatureMessage: ToSignatureMessage): Promise<string> {
    return await this.walletClient.signTypedData({
      account: this.address,
      ...toSignatureMessage,
    });
  }

  /**
   * Get the domain for EIP712 signing
   */
  getDomain(onChainDomain?: boolean) {
    if (onChainDomain) {
      return getOnChainDomain(this.chainId);
    }
    return getOffChainDomain(this.chainId);
  }

  /**
   * Generate bind distributor code message and signature
   */
  async generateBindDistributorCodeMessage(inputs: BindDistributorCodeInputs) {
    const domain = this.getDomain();

    const primaryType = "BindDistributorCode";

    const typeDefinition = {
      // EIP712Domain: MESSAGE_TYPES.EIP712Domain,
      [primaryType]: MESSAGE_TYPES[primaryType],
    };

    const toSignatureMessage: ToSignatureMessage = {
      domain,
      message: inputs,
      primaryType,
      types: typeDefinition,
    };

    const signedMessage = await this.signTypedData(toSignatureMessage);

    return {
      message: {
        ...inputs,
        chainId: this.chainId,
        chainType: "EVM",
      },
      signature: signedMessage,
      userAddress: this.address,
      verifyingContract: domain.verifyingContract,
    };
  }
}
