import { BigQuery } from '@google-cloud/bigquery';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { NextApiRequest, NextApiResponse } from 'next';

const PYUSD_CONTRACT_ADDRESS = '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8'; // Replace with actual PYUSD contract address

const client = createPublicClient({
  chain: mainnet,
  transport: http(process.env.NEXT_PUBLIC_GCP_RPC_URL),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const bigquery = new BigQuery();

  try {
    // Fetch total supply from the contract
    const totalSupply = await client.readContract({
      address: PYUSD_CONTRACT_ADDRESS,
      abi: [{
        constant: true,
        inputs: [],
        name: 'totalSupply',
        outputs: [{ name: '', type: 'uint256' }],
        type: 'function',
      }],
      functionName: 'totalSupply',
    });

    // Fetch 24hr and 7d volume from BigQuery
    const query = `
      SELECT
        SUM(value) as volume
      FROM \`bigquery-public-data.crypto_ethereum.token_transfers\`
      WHERE
        token_address = '${PYUSD_CONTRACT_ADDRESS}'
        AND block_timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 DAY)
    `;

    const [rows] = await bigquery.query(query);
    const volume24hr = rows[0]?.volume || 0;

    res.status(200).json({ totalSupply: totalSupply.toString(), volume24hr });
  } catch (error) {
    console.error('Error fetching token data:', error);
    res.status(500).json({ error: 'Failed to fetch token data' });
  }
}