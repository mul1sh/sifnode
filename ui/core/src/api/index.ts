// Everything here represents services that are effectively remote data storage
export * from "./EthereumService/utils/getMetamaskProvider";

import ethereumService, { EthereumServiceContext } from "./EthereumService";
import sifService, { SifServiceContext } from "./SifService";
import clpService, { ClpServiceContext } from "./ClpService";

export type Api = ReturnType<typeof createApi>;

export type WithApi<T extends keyof Api = keyof Api> = {
  api: Pick<Api, T>;
};

export type ApiContext = EthereumServiceContext &
  SifServiceContext &
  ClpServiceContext &
  Omit<ClpServiceContext, "getPools">; // add contexts from other APIs

import localnetconfig from "../config.localnet.json";
import testnetconfig from "../config.testnet.json";

import assetsEthereumLocalnet from "../assets.ethereum.localnet.json";
import assetsEthereumMainnet from "../assets.ethereum.mainnet.json";

import assetsSifchainLocalnet from "../assets.sifchain.localnet.json";
import assetsSifchainMainnet from "../assets.sifchain.mainnet.json";

import {
  parseConfig,
  parseAssets,
  ChainConfig,
  AssetConfig,
} from "./utils/parseConfig";
import { Asset } from "../entities";

type ConfigMap = { [s: string]: ApiContext };
type AssetMap = { [s: string]: Asset[] };

function getConfig(
  config = "localnet",
  sifchainAssetTag = "sifchain.localnet",
  ethereumAssetTag = "ethereum.localnet"
): ApiContext {
  const assetMap: AssetMap = {
    "sifchain.localnet": parseAssets(
      assetsSifchainLocalnet as { assets: AssetConfig[] }
    ),
    "sifchain.mainnet": parseAssets(
      assetsSifchainMainnet as { assets: AssetConfig[] }
    ),
    "ethereum.localnet": parseAssets(
      assetsEthereumLocalnet as { assets: AssetConfig[] }
    ),
    "ethereum.mainnet": parseAssets(
      assetsEthereumMainnet as { assets: AssetConfig[] }
    ),
  };

  const sifchainAssets = assetMap[sifchainAssetTag];
  const ethereumAssets = assetMap[ethereumAssetTag];
  const allAssets = [...sifchainAssets, ...ethereumAssets];

  const configMap: ConfigMap = {
    localnet: parseConfig(localnetconfig as ChainConfig, allAssets),
    testnet: parseConfig(testnetconfig as ChainConfig, allAssets),
  };

  return configMap[config.toLowerCase()];
}

export function createApi(
  config?: string,
  sifchainAssetTag?: string,
  ethereumAssetTag?: string
) {
  const context = getConfig(config, sifchainAssetTag, ethereumAssetTag);
  const EthereumService = ethereumService(context);

  const SifService = sifService(context);
  const ClpService = clpService(context);
  return {
    ClpService,
    EthereumService,

    SifService,
  };
}
