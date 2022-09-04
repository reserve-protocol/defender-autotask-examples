import { Relayer } from 'defender-relay-client';
import { RelayerModel, RelayerParams } from 'defender-relay-client/lib/relayer';
import { DefenderRelaySigner, DefenderRelayProvider } from 'defender-relay-client/lib/ethers';
import { ethers } from 'ethers'

// Entrypoint for the Autotask
export async function handler(credentials: RelayerParams) {
  const relayer = new Relayer(credentials);
  const info: RelayerModel = await relayer.getRelayer();
  console.log(`Relayer address is ${info.address}`);

  const provider = new DefenderRelayProvider(credentials);
  const signer = new DefenderRelaySigner(credentials, provider, { speed: 'fast' });

  const goerliFacadeAddr = '0x1B0B43BE2E4dEaD38fD3b88c8240ca52B3F1Cd96'
  const goerliRTokenAddr = '0x877aF3EA4e60C1E6412617C45e4dCE5E73EB45e3'
  const abi = [{
      "inputs": [
        {
          "internalType": "contract IRToken",
          "name": "rToken",
          "type": "address"
        }
      ],
      "name": "getActCalldata",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    }]
  const facade = new ethers.Contract(goerliFacadeAddr, abi, signer)
  const [addr, calldata] = await facade.callstatic.getActCalldata(goerliRTokenAddr)
  console.log(addr, calldata)
}

// Sample typescript type definitions
type EnvInfo = {
  API_KEY: string;
  API_SECRET: string;
}

// To run locally (this code will not be executed in Autotasks)
if (require.main === module) {
  require('dotenv').config();
  const { API_KEY: apiKey, API_SECRET: apiSecret } = process.env as EnvInfo;
  handler({ apiKey, apiSecret })
    .then(() => process.exit(0))
    .catch((error: Error) => { console.error(error); process.exit(1); });
}
