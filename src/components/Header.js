import React, { useState } from 'react';

const Header = ({ poolData, setShowMinerStats }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const formatHashrate = (hashrate) => {
    if (!hashrate) return 'N/A';
    const value = parseFloat(hashrate);
    return `${value.toFixed(2)} PH/s`;
  };

  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-orange-500 text-4xl font-bold">CK</span> 
          <span className="text-white-500 text-4xl font-bold mr-4">POOL</span>
          <div>
            <span className="text-2xl font-bold">{formatHashrate(poolData?.hashrate1hr)}</span>
            <span className="text-gray-400 ml-2">/ {poolData?.diff?.toFixed(2) || 'N/A'} T</span>
          </div>
        </div>
        <nav className="hidden md:block">
          <ul className="flex space-x-4">
            <li><button onClick={() => setShowMinerStats(false)} className="hover:text-gray-300">Pool Stats</button></li>
            <li><button onClick={() => setShowMinerStats(true)} className="hover:text-gray-300">Miner Stats</button></li>
          </ul>
        </nav>
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white focus:outline-none">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden mt-4">
          <ul className="flex flex-col space-y-2">
            <li><button onClick={() => { setShowMinerStats(false); setIsMenuOpen(false); }} className="hover:text-gray-300">Pool Stats</button></li>
            <li><button onClick={() => { setShowMinerStats(true); setIsMenuOpen(false); }} className="hover:text-gray-300">Miner Stats</button></li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;
