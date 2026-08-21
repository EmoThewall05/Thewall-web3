import { AlchemyAccountsUIConfig, createConfig } from '@account-kit/react'
import { arbitrum, base, alchemy } from '@account-kit/infra'

const uiConfig: AlchemyAccountsUIConfig = {
  auth: {
    sections: [
      [{ type: 'email' }],
      [{ type: 'passkey' }],
    ],
    addPasskeyOnSignup: true,
  },
}

export const accountKitConfig = createConfig(
  {
    transport: alchemy({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY! }),
    chain: base,
    chains: [
      { chain: base, policyId: process.env.NEXT_PUBLIC_GAS_POLICY_ID },
      { chain: arbitrum, policyId: process.env.NEXT_PUBLIC_GAS_POLICY_ID },
    ],
    ssr: true,
  },
  uiConfig
)

export { uiConfig }
