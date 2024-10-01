import React, { useState, useEffect, useCallback } from 'react';

export function PoolVisualizer({ poolData }) {
  const [lastUpdate, setLastUpdate] = useState(() => {
    const saved = localStorage.getItem('poolLastUpdate');
    return saved ? parseInt(saved, 10) : null;
  });

  useEffect(() => {
    if (poolData && poolData.lastupdate) {
      const newLastUpdate = poolData.lastupdate * 1000; // Convertir a milisegundos
      setLastUpdate(newLastUpdate);
      localStorage.setItem('poolLastUpdate', newLastUpdate.toString());
    }
  }, [poolData]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setLastUpdate(prev => prev ? prev : null);
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const calculateTimeSinceLastUpdate = useCallback(() => {
    if (!lastUpdate) return 'Never';
    const currentTime = Math.floor(Date.now() / 1000);
    const timeDifference = currentTime - Math.floor(lastUpdate / 1000);
    
    if (timeDifference < 60) {
      return `${timeDifference} seconds`;
    } else if (timeDifference < 3600) {
      return `${Math.floor(timeDifference / 60)} minutes`;
    } else {
      const hours = Math.floor(timeDifference / 3600);
      const minutes = Math.floor((timeDifference % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  }, [lastUpdate]);

  if (!poolData) return null;

  const formatHashrate = (hashrate) => {
    const value = parseFloat(hashrate);
    return `${value.toFixed(2)} PH/s`;
  };

  const formatLargeNumber = (number) => {
    const units = ['', 'K', 'M', 'B', 'T', 'P', 'E'];
    let unitIndex = 0;
    let formattedNumber = number;

    while (formattedNumber >= 1000 && unitIndex < units.length - 1) {
      formattedNumber /= 1000;
      unitIndex++;
    }

    return `${formattedNumber.toFixed(2)} ${units[unitIndex]}`;
  };

  const calculateRejectionRatio = () => {
    const totalShares = poolData.accepted + poolData.rejected;
    if (totalShares === 0) return '0.00%';
    return ((poolData.rejected / totalShares) * 100).toFixed(2) + '%';
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-xl">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <InfoCard title="Pool uptime" value={`${Math.floor(poolData.runtime / 86400)}d ${Math.floor((poolData.runtime % 86400) / 3600)}h ${Math.floor((poolData.runtime % 3600) / 60)}m`} />
        <InfoCard title="Last update" value={calculateTimeSinceLastUpdate()} />
        <InfoCard title="Users" value={poolData.Users} />
        <InfoCard title="Workers" value={poolData.Workers} />
        <InfoCard title="Idle" value={poolData.Idle} />
        <InfoCard title="Disconnected" value={poolData.Disconnected} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <InfoCard title="Hashrate 1m" value={formatHashrate(poolData.hashrate1m)} />
        <InfoCard title="Hashrate 5m" value={formatHashrate(poolData.hashrate5m)} />
        <InfoCard title="Hashrate 15m" value={formatHashrate(poolData.hashrate15m)} />
        <InfoCard title="Hashrate 1h" value={formatHashrate(poolData.hashrate1hr)} />
        <InfoCard title="Hashrate 6h" value={formatHashrate(poolData.hashrate6hr)} />
        <InfoCard title="Hashrate 1d" value={formatHashrate(poolData.hashrate1d)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DetailedInfoCard title="Pool best share" data={formatLargeNumber(poolData.bestshare)} />
        <DetailedInfoCard title="Shares accepted" data={formatLargeNumber(poolData.accepted)} />
        <DetailedInfoCard title="Shares rejected" data={formatLargeNumber(poolData.rejected)} />
        <InfoCard title="Rejection Ratio" value={calculateRejectionRatio()} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InfoCard title="Diff" value={poolData.diff.toFixed(2)} />
        <InfoCard title="SPS 1m" value={poolData.SPS1m.toFixed(0)} />
        <InfoCard title="SPS 5m" value={poolData.SPS5m.toFixed(0)} />
        <InfoCard title="SPS 15m" value={poolData.SPS15m.toFixed(0)} />
      </div>
    </div>
  );
}

function DetailedInfoCard({ title, data }) {
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-gray-400 text-sm mb-2">{title}</h3>
      <p className="text-xl font-bold">{data}</p>
    </div>
  );
}

function InfoCard({ title, value }) {
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-gray-400 text-sm mb-2">{title}</h3>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
