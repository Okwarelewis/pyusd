import { useEffect, useState } from 'react';

export default function TokenData() {
  const [data, setData] = useState<{ totalSupply?: string; volume24hr?: number }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/tokenData');
        const tokenData = await response.json();
        setData(tokenData);
      } catch (error) {
        console.error('Error fetching token data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold mb-4">PYUSD Token Data</h2>
      <div className="space-y-2">
        <p><strong>Total Supply:</strong> {data.totalSupply}</p>
        <p><strong>24hr Volume:</strong> {data.volume24hr}</p>
      </div>
    </div>
  );
}