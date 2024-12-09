import { type NextRequest } from 'next/server'
import { isAddress, isHex, zeroAddress } from 'viem'
import { z } from 'zod'

import {
  decodeEnsOffchainRequest,
  encodeEnsOffchainResponse,
  ResolverQuery,
} from './helpers'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const REQUEST_SCHEMA = z.object({
  sender: z
    .string()
    .refine((data) => isAddress(data), { message: 'Sender is not an address' }),
  data: z
    .string()
    .refine((data) => isHex(data), { message: 'Data is not valid hex' }),
})

const ENS_DATA_SIGNER_KEY = process.env.ENS_DATA_SIGNER_KEY

export async function GET(
  request: NextRequest,
  { params }: { [key: string]: string }
) {
  // Validate params
  const parsedParams = REQUEST_SCHEMA.safeParse(params)
  if (!parsedParams.success) {
    return Response.json(
      { message: parsedParams.error.message },
      { status: 400, headers: { ...CORS_HEADERS } }
    )
  }

  // Validate signing key
  if (!isHex(ENS_DATA_SIGNER_KEY)) {
    return Response.json(
      { message: 'ENS_DATA_SIGNER_KEY is not set' },
      { status: 500, headers: { ...CORS_HEADERS } }
    )
  }

  // Decode request
  const { sender, data } = parsedParams.data
  const { name, query } = decodeEnsOffchainRequest({ sender, data })

  // Fetch the relevant data from an external API
  const result = await fetchOffchainEnsName(name, query)

  return Response.json(
    {
      data: await encodeEnsOffchainResponse(
        { sender, data },
        result,
        ENS_DATA_SIGNER_KEY
      ),
    },
    {
      status: 200,
      headers: { ...CORS_HEADERS },
    }
  )
}

async function fetchOffchainEnsName(
  name: string,
  query: ResolverQuery
): Promise<string> {
  const { functionName, args } = query

  try {
    // Hit an external API
    const response = await fetch(`https://api.your-domain.com/${name}`)

    // Parse the response as a JSON object. NOTE: Your response format will likely be different
    const json = (await response.json()) as {
      addresses?: Record<string, string>
      texts?: Record<string, string>
      contenthash?: string
    }

    // Handle the different query functions
    switch (functionName) {
      case 'addr': {
        const coinType = args[1] ?? BigInt(60)
        return json.addresses?.[coinType.toString()] ?? zeroAddress
      }
      case 'text': {
        const key = args[1]
        return json.texts?.[key] ?? ''
      }
      case 'contenthash': {
        return json.contenthash ?? '0x'
      }
      default: {
        throw new Error(`Unsupported query function ${functionName}`)
      }
    }
  } catch (err) {
    console.error('Error fetching offchain name', err)
    return '0x'
  }
}
