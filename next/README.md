## Usage:

Set your `ENS_DATA_SIGNER_KEY` env var. This should be an Ethereum private key that will be used to sign messages. You should configure your resolver contract to expect messages to be signed using the corresponding address. The signature format in this repo expects to be used with a resolver contract from [ccip.tools](https://ccip.tools/).

Deploy this service to a publicly accessible URL and set it as the `url` on your resolver contract in the format `https://<your-domain>/api/ens/{sender}/{data}`.

## Customisation

Modify `fetchOffchainEnsName()` in [route.ts](src/app/api/ens/[sender]/[data]/route.ts#L93) to read from your API and format the response.

If a record does not exist, you should return the zero value for that type - for example, requests for nonexistent text records should be responded to with the empty string, and requests for nonexistent addresses should be responded to with the all-zero address.
