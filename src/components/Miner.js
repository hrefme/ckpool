import React, { useEffect, useState, useCallback } from 'react';

function getTimeAgo(timestamp) {
  const now = Date.now();
  const diffInSeconds = Math.floor((now - timestamp * 1000) / 1000);
  const minutes = Math.floor(diffInSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) {
    return 'less than a minute ago';
  } else if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (hours < 24) {
    const remainingMinutes = minutes % 60;
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}${remainingMinutes > 0 ? ` and ${remainingMinutes} ${remainingMinutes === 1 ? 'minute' : 'minutes'}` : ''} ago`;
  } else {
    const remainingHours = hours % 24;
    return `${days} ${days === 1 ? 'day' : 'days'}${remainingHours > 0 ? ` and ${remainingHours} ${remainingHours === 1 ? 'hour' : 'hours'}` : ''} ago`;
  }
}

function formatHashRate(hashrate) {
  if (typeof hashrate === 'string') {
    const units = ['', 'K', 'M', 'G', 'T', 'P', 'E'];
    const value = parseFloat(hashrate);
    const unit = hashrate.replace(/[0-9.]/g, '').trim();
    const unitIndex = units.indexOf(unit);
    if (unitIndex !== -1) {
      return `${value.toFixed(2)} ${units[unitIndex]}H/s`;
    }
  }
  return `${parseFloat(hashrate).toFixed(2)} H/s`;
}

export function Miner({ poolData, minerAddress, setMinerAddress }) {
  const [minerData, setMinerData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputAddress, setInputAddress] = useState('');

  useEffect(() => {
    // Recuperar la dirección guardada al cargar el componente
    const savedAddress = localStorage.getItem('minerAddress');
    if (savedAddress) {
      setMinerAddress(savedAddress);
      setInputAddress(savedAddress);
    }
  }, [setMinerAddress]);

  const fetchMinerData = useCallback(async () => {
    if (!minerAddress) return;

    setIsLoading(true);
    try {
      const timestamp = new Date().getTime();
      const url = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://solo.ckpool.org/users/${minerAddress}?_=${timestamp}`)}`;
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Could not fetch miner data');
      }
      const data = await response.json();
      setMinerData(data);
    } catch (error) {
      console.error('Error fetching miner data:', error);
      setMinerData(null);
    } finally {
      setIsLoading(false);
    }
  }, [minerAddress]);

  useEffect(() => {
    if (minerAddress) {
      fetchMinerData();
      const intervalId = setInterval(fetchMinerData, 60000); // Cada minuto
      return () => clearInterval(intervalId);
    }
  }, [fetchMinerData, minerAddress]);

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (inputAddress) {
      setMinerAddress(inputAddress);
      // Save Address on localStorage
      localStorage.setItem('minerAddress', inputAddress);
    }
  };

  const handleInputChange = (e) => {
    setInputAddress(e.target.value);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl mt-6">
      <h2 className="text-3xl font-bold mb-6 text-white">Miner Information</h2>
      <form onSubmit={handleAddressSubmit} className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={inputAddress}
            onChange={handleInputChange}
            placeholder="Enter miner address"
            className="flex-grow p-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out">
            View miner statistics
          </button>
        </div>
      </form>
      {isLoading && !minerData ? (
        <p className="text-white text-xl animate-pulse">Loading miner data...</p>
      ) : minerData ? (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <InfoCard title="Hashrate 1m" value={formatHashRate(minerData.hashrate1m)} />
            <InfoCard title="Hashrate 5m" value={formatHashRate(minerData.hashrate5m)}  />
            <InfoCard title="Hashrate 1hr" value={formatHashRate(minerData.hashrate1hr)}  />
            <InfoCard title="Hashrate 1d" value={formatHashRate(minerData.hashrate1d)} />
            <InfoCard title="Hashrate 7d" value={formatHashRate(minerData.hashrate7d)}  />
            <InfoCard title="Last Share" value={getTimeAgo(minerData.lastshare)}  />
            <InfoCard title="Workers" value={minerData.workers}  />
            <LargeNumberCard title="Shares" value={minerData.shares} />
            <LargeNumberCard title="Best Share" value={minerData.bestshare} />
            <LargeNumberCard title="Best Ever" value={minerData.bestever} />
            <InfoCard title="Authorized" value={formatAuthorizedTime(minerData.authorised)} />
          </div>
          <h3 className="text-2xl font-bold mb-4 text-white">Workers</h3>
          <div className="overflow-x-auto">
            <div className="hidden md:block"> {/* Tabla para pantallas medianas y grandes */}
              <table className="w-full text-white">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Hashrate 1m</th>
                    <th className="p-3 text-left">Hashrate 5m</th>
                    <th className="p-3 text-left">Hashrate 1hr</th>
                    <th className="p-3 text-left">Hashrate 1d</th>
                    <th className="p-3 text-left">Hashrate 7d</th>
                    <th className="p-3 text-left">Last Share</th>
                    <th className="p-3 text-left">Shares</th>
                    <th className="p-3 text-left">Best Share</th>
                    <th className="p-3 text-left">Best Ever</th>
                  </tr>
                </thead>
                <tbody>
                  {minerData.worker.map((worker, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}>
                      <td className="p-3 font-medium">{worker.workername}</td>
                      <td className="p-3">{formatHashRate(worker.hashrate1m)}</td>
                      <td className="p-3">{formatHashRate(worker.hashrate5m)}</td>
                      <td className="p-3">{formatHashRate(worker.hashrate1hr)}</td>
                      <td className="p-3">{formatHashRate(worker.hashrate1d)}</td>
                      <td className="p-3">{formatHashRate(worker.hashrate7d)}</td>
                      <td className="p-3">{getTimeAgo(worker.lastshare)}</td>
                      <td className="p-3">
                        <div>{formatLargeNumber(worker.shares)}</div>
                        <div className="text-xs text-gray-400">{worker.shares.toLocaleString()}</div>
                      </td>
                      <td className="p-3">
                        <div>{formatLargeNumber(worker.bestshare)}</div>
                        <div className="text-xs text-gray-400">{worker.bestshare.toLocaleString(undefined, {maximumFractionDigits: 8})}</div>
                      </td>
                      <td className="p-3">
                        <div>{formatLargeNumber(worker.bestever)}</div>
                        <div className="text-xs text-gray-400">{worker.bestever.toLocaleString()}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="md:hidden space-y-6"> {/* Lista de tarjetas para pantallas pequeñas */}
              {minerData.worker.map((worker, index) => (
                <div key={index} className="bg-gray-700 p-4 rounded-lg shadow-md">
                  <p className="text-1xl font-bold mb-3 text-blue-300">{worker.workername}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <InfoItem title="Hashrate 1m" value={formatHashRate(worker.hashrate1m)} />
                    <InfoItem title="Hashrate 5m" value={formatHashRate(worker.hashrate5m)} />
                    <InfoItem title="Hashrate 1hr" value={formatHashRate(worker.hashrate1hr)} />
                    <InfoItem title="Hashrate 1d" value={formatHashRate(worker.hashrate1d)} />
                    <InfoItem title="Hashrate 7d" value={formatHashRate(worker.hashrate7d)} />
                    <InfoItem title="Last Share" value={getTimeAgo(worker.lastshare)} />
                    <InfoItem title="Shares" value={formatLargeNumber(worker.shares)} />
                    <InfoItem title="Best Share" value={formatLargeNumber(worker.bestshare)} />
                    <InfoItem title="Best Ever" value={formatLargeNumber(worker.bestever)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function InfoCard({ title, value, color }) {
  return (
    <div className={`${color} p-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105`}>
      <h3 className="text-gray-200 text-sm mb-2">{title}</h3>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function LargeNumberCard({ title, value, color }) {
  const formattedValue = formatLargeNumber(value);
  return (
    <div className={`${color} p-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105`}>
      <h3 className="text-gray-200 text-sm mb-2">{title}</h3>
      <p className="text-2xl font-bold text-white">{formattedValue}</p>
      <p className="text-xs text-gray-300 mt-1">{value.toLocaleString()}</p>
    </div>
  );
}

function formatLargeNumber(number) {
  if (typeof number !== 'number') return 'N/A';
  
  const trillion = 1000000000000;
  const billion = 1000000000;
  const million = 1000000;
  const thousand = 1000;

  if (number >= trillion) {
    return `${(number / trillion).toFixed(1)}T`;
  } else if (number >= billion) {
    return `${(number / billion).toFixed(1)}B`;
  } else if (number >= million) {
    return `${(number / million).toFixed(1)}M`;
  } else if (number >= thousand) {
    return `${(number / thousand).toFixed(1)}K`;
  } else {
    return number.toFixed(1);
  }
}

function formatAuthorizedTime(timestamp) {
  const now = Date.now() / 1000;
  const secondsAgo = now - timestamp;
  const days = Math.floor(secondsAgo / 86400);
  const months = Math.floor(days / 30);
  const remainingDays = days % 30;
  const hours = Math.floor((secondsAgo % 86400) / 3600);

  let result = '';
  if (months > 0) {
    result += `${months} month${months > 1 ? 's' : ''}`;
  }
  if (remainingDays > 0) {
    result += `${result ? ', ' : ''}${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
  }
  if (hours > 0 || result === '') {
    result += `${result ? ' and ' : ''}${hours} hour${hours > 1 ? 's' : ''}`;
  }
  return result;
}

function InfoItem({ title, value }) {
  return (
    <div className="bg-gray-800 p-3 rounded-lg">
      <span className="text-gray-400 text-sm block mb-1">{title}</span>
      <span className="font-bold text-white">{value}</span>
    </div>
  );
}
