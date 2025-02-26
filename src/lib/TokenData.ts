import { client } from './client';
import { BigQuery } from '@google-cloud/bigquery';

const PYUSD_CONTRACT_ADDRESS = '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8'; // Replace with actual PYUSD contract address

export async function getTokenData() {
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
  const bigquery = new BigQuery();
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

  return {
    totalSupply: totalSupply.toString(),
    volume24hr,
  };
}