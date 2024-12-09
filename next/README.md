## Usage:

Set your `ENS_DATA_SIGNER_KEY` env var. This should be an Ethereum private key that will be used to sign messages. You should configure your resolver contract to expect messages to be signed using the corresponding address. The signature format in this repo expects to be used with a resolver contract from [ccip.tools](https://ccip.tools/).

Deploy this service to a publicly accessible URL and set it as the `url` on your resolver contract in the format `https://<your-domain>/api/ens/{sender}/{data}`.

## Customisation

Modify `fetchOffchainEnsName()` in [route.ts](src/app/api/ens/[sender]/[data]/route.ts#L93) to read from your API and format the response.

If a record does not exist, you should return the zero value for that type - for example, requests for nonexistent text records should be responded to with the empty string, and requests for nonexistent addresses should be responded to with the all-zero address.

## Testing

Deploying a resolver contract to Sepolia testnet via [ccip.tools](https://ccip.tools/), and connecting it to a local version of this app via [ngrok](https://ngrok.com/) or similar is the recommended way to test everything.

1. Generate a new private key to sign messages, and set it as the `ENS_DATA_SIGNER_KEY` environment variable.
2. Run the Nextjs app locally and expose to the internet with a tool like ngrok.
3. Deploy a resolver contract to Sepolia testnet via https://ccip.tools
   1. Set the "Gateway URL" field to the ngrok URL (e.g. `https://<ngrok-id>.ngrok-free.app/api/ens/{sender}/{data}`)
   2. Set the "Signers" field to be the public address of the private key you created in step 1.
4. Register a test .eth name on the [ENS manager app](https://app.ens.domains/) and set the resolver to the contract you deployed in step 3.
   1. By connecting your wallet and switching to Sepolia, the app will automatically start loading data from testnet.
5. Finally, search for `ccip-read-gateway-test.<your-name>.eth` in the ENS manager app. If everything is working correctly, you should see the address `0x1111111111111111111111111111111111111111` returned for all chain addresses.
