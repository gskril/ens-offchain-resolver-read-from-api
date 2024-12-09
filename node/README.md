## Usage:

Set your `PRIVATE_KEY` env var. This should be an Ethereum private key that will be used to sign messages. You should configure your resolver contract to expect messages to be signed using the corresponding address.

Deploy this service to a publicly accessible URL and set it as the `url` on your resolver contract in the format `https://<your-domain>/{sender}/{data}.json`.

## Customisation

Modify `fetchOffchainName()` in [db.ts](src/db.ts#L44) to read from your API and format the response.

The backend is implemented in [db.ts](src/db.ts), and implements the `Database` interface from [server.ts](src/server.ts). You can replace this with your own database service by implementing the methods provided in that interface. If a record does not exist, you should return the zero value for that type - for example, requests for nonexistent text records should be responded to with the empty string, and requests for nonexistent addresses should be responded to with the all-zero address.
