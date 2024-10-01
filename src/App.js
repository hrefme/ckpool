import React, { useState, useEffect, useCallback } from 'react';
import { PoolVisualizer } from './components/PoolVisualizer';
import { Miner } from './components/Miner';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  const [poolData, setPoolData] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [minerAddress, setMinerAddress] = useState(() => {
    return localStorage.getItem('minerAddress') || '';
  });
  const [showMinerStats, setShowMinerStats] = useState(false);

  const fetchPoolData = useCallback(async () => {
    setIsLoading(true);
    try {
      const timestamp = new Date().getTime();
      const url = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://solo.ckpool.org/pool/pool.status`)}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Could not fetch pool data');
      }
      
      const text = await response.text();
      console.log('Raw pool data:', text);
      
      const lines = text.split('\n').filter(line => line.trim() !== '');
      const parsedData = lines.map(line => JSON.parse(line));
      const [statusData, hashrateData, diffData] = parsedData;
      
      const newPoolData = { 
        ...statusData, 
        ...hashrateData, 
        ...diffData,
      };
      
      console.log('Processed pool data:', newPoolData);
      setPoolData(newPoolData);
      setLastUpdateTime(newPoolData.lastupdate);
    } catch (error) {
      console.error('Error fetching pool data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPoolData();
    const intervalId = setInterval(fetchPoolData, 60 * 1000); // Update every minute

    return () => clearInterval(intervalId);
  }, [fetchPoolData]);

  useEffect(() => {
    const path = window.location.pathname;
    setShowMinerStats(path === '/stats');
  }, []);

  const handleRefresh = () => {
    fetchPoolData();
  };

  const getTimeSinceLastUpdate = () => {
    if (!poolData || !poolData.lastupdate) return 'Never';
    const now = Math.floor(Date.now() / 1000);
    const diff = now - poolData.lastupdate;
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes} minutes ${seconds} seconds ago`;
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setLastUpdateTime(prevTime => prevTime ? prevTime : null);
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="App bg-gray-900 min-h-screen flex flex-col">
      <Header poolData={poolData} setShowMinerStats={setShowMinerStats} />
      <main className="flex-grow p-4">
        {!showMinerStats ? (
          poolData ? (
            <PoolVisualizer poolData={poolData} />
          ) : (
            <p className="text-white">Loading pool data...</p>
          )
        ) : (
          <Miner 
            poolData={poolData} 
            minerAddress={minerAddress} 
            setMinerAddress={setMinerAddress} 
          />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
