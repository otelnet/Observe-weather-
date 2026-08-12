import React, { useState, useEffect, useRef } from 'react';
import { LocationInfo, HKOWarningItem } from '../types';
import { GLOBAL_PRESET_LOCATIONS, POPULAR_COUNTRY_CHIPS } from '../data/locations';
import { searchGlobalLocations } from '../services/weatherService';
import { Search, AlertTriangle, Cpu, TrendingUp, CloudSun, MapPin, Navigation, Globe2, Loader2, X, Star, User, LogIn, LogOut, Flame, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentLocation: LocationInfo;
  onSelectLocation: (location: LocationInfo) => void;
  activeWarnings: HKOWarningItem[];
  activeTab: 'realtime' | 'warnings' | 'simulation' | 'trends';
  onTabChange: (tab: 'realtime' | 'warnings' | 'simulation' | 'trends') => void;
}

type RegionFilter = 'all' | 'hko' | 'asia' | 'europe' | 'americas' | 'africa_me';

export const Navbar: React.FC<NavbarProps> = ({
  currentLocation,
  onSelectLocation,
  activeWarnings,
  activeTab,
  onTabChange,
}) => {
  const { user, signInWithGoogle, logout, favorites, isFavorite, addFavorite, removeFavorite } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<LocationInfo[]>([]);
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const [activeRegionFilter, setActiveRegionFilter] = useState<RegionFilter>('all');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const favContainerRef = useRef<HTMLDivElement>(null);

  // Close search/favorites dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (favContainerRef.current && !favContainerRef.current.contains(event.target as Node)) {
        setIsFavoritesOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  // Live Geocoding Search with Debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearchingApi(false);
      return;
    }

    setIsSearchingApi(true);
    const timer = setTimeout(async () => {
      const results = await searchGlobalLocations(searchQuery);
      setSearchResults(results);
      setIsSearchingApi(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Preset location filter logic
  const filteredPresets = GLOBAL_PRESET_LOCATIONS.filter((loc) => {
    const matchesQuery =
      searchQuery === '' ||
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.country.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesQuery) return false;

    if (activeRegionFilter === 'hko') return loc.isHKO;
    if (activeRegionFilter === 'asia')
      return !loc.isHKO && ['Japan', 'Singapore', 'China', 'South Korea', 'Thailand', 'Philippines', 'India', 'Australia', 'New Zealand'].includes(loc.country);
    if (activeRegionFilter === 'europe')
      return ['United Kingdom', 'France', 'Germany', 'Italy', 'Spain', 'Netherlands', 'Switzerland'].includes(loc.country);
    if (activeRegionFilter === 'americas')
      return ['United States', 'Canada', 'Mexico', 'Brazil', 'Argentina'].includes(loc.country);
    if (activeRegionFilter === 'africa_me')
      return ['United Arab Emirates', 'Egypt', 'South Africa', 'Kenya', 'Nigeria', 'Turkey'].includes(loc.country);

    return true;
  });

  // Handle GPS Auto Detection
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const gpsLocation: LocationInfo = {
          id: `gps_${latitude.toFixed(2)}_${longitude.toFixed(2)}`,
          name: `Current Location (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`,
          region: `GPS Telemetry`,
          country: `Local Region`,
          lat: latitude,
          lon: longitude,
          elevation: 10,
          isHKO: Math.abs(latitude - 22.3) < 0.4 && Math.abs(longitude - 114.1) < 0.4,
        };
        onSelectLocation(gpsLocation);
        setGpsLoading(false);
        setIsSearchOpen(false);
      },
      (err) => {
        console.warn('GPS error:', err);
        setGpsError('Unable to retrieve GPS coordinates.');
        setGpsLoading(false);
      },
      { timeout: 10000 }
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-black/50 backdrop-blur-2xl border-b border-white/10 text-slate-100 shadow-2xl">
      {/* Severe Warning Alert Ticker Banner */}
      {activeWarnings.length > 0 && (
        <div className="bg-red-500/20 text-red-400 px-6 py-1.5 text-xs font-bold flex items-center justify-between border-b border-red-500/30 backdrop-blur-md">
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
            <span className="tracking-widest uppercase text-red-400">
              HKO SIGNAL IN FORCE ({activeWarnings.length}):
            </span>
            <span className="truncate text-slate-200 font-medium">
              {activeWarnings.map((w) => `${w.name} (${w.level})`).join(' • ')}
            </span>
          </div>
          <button
            onClick={() => onTabChange('warnings')}
            className="shrink-0 ml-3 bg-red-500/30 hover:bg-red-500/40 text-red-200 px-3 py-0.5 rounded-full text-[10px] uppercase font-bold border border-red-500/40 transition cursor-pointer"
          >
            Alert Details &rarr;
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3.5 shrink-0 cursor-pointer" onClick={() => onTabChange('realtime')}>
            <div className="w-9 h-9 bg-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              <CloudSun className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight uppercase text-white">
                Hong Kong Observatory <span className="text-cyan-400 font-light">Global</span>
              </h1>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest">
                <span className="text-cyan-400 font-mono">LIVE OBSERVATION</span>
                <span>•</span>
                <span className="hidden sm:inline">256KM DOPPLER RADAR</span>
              </div>
            </div>
          </div>

          {/* Location Selector Bar */}
          <div className="relative flex-1 max-w-xs sm:max-w-md" ref={searchContainerRef}>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="w-full pl-9 pr-8 py-1.5 text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-mono text-slate-200 transition flex items-center justify-between shadow-inner"
              >
                <div className="truncate flex items-center gap-1.5">
                  <span className="font-bold text-white">{currentLocation.name}</span>
                  <span className="text-slate-400 text-[10px] hidden sm:inline">({currentLocation.country})</span>
                </div>
                <Search className="w-3.5 h-3.5 text-cyan-400 ml-2 shrink-0" />
              </button>
            </div>

            {/* Worldwide Location Search Modal/Dropdown */}
            {isSearchOpen && (
              <div className="absolute top-full left-0 right-0 sm:-left-12 sm:-right-12 mt-2 bg-[#020617] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[460px] flex flex-col backdrop-blur-2xl">
                {/* Search Input Bar */}
                <div className="p-3 border-b border-white/10 bg-black/60 space-y-2">
                  <div className="relative flex items-center">
                    <Search className="absolute left-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="SEARCH ANY CITY OR COUNTRY IN THE WORLD..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 text-slate-100 text-xs pl-9 pr-8 py-2 rounded-xl focus:outline-none focus:border-cyan-500 border border-white/10 placeholder-slate-500 font-mono"
                      autoFocus
                    />
                    {searchQuery ? (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    ) : null}
                  </div>

                  {/* Popular Country Quick Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[10px] font-mono">
                    <span className="text-slate-500 uppercase shrink-0">Popular:</span>
                    {POPULAR_COUNTRY_CHIPS.map((chip) => {
                      const found = GLOBAL_PRESET_LOCATIONS.find((l) => l.id === chip.id);
                      if (!found) return null;
                      return (
                        <button
                          key={chip.id}
                          onClick={() => {
                            onSelectLocation(found);
                            setIsSearchOpen(false);
                          }}
                          className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/40 shrink-0 transition"
                        >
                          {chip.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Region Filter Tabs */}
                  <div className="flex items-center gap-1 overflow-x-auto pt-1 text-[10px] font-mono border-t border-white/5">
                    {[
                      { id: 'all', label: 'All Global' },
                      { id: 'hko', label: 'Hong Kong' },
                      { id: 'asia', label: 'Asia-Pacific' },
                      { id: 'europe', label: 'Europe' },
                      { id: 'americas', label: 'Americas' },
                      { id: 'africa_me', label: 'Africa & M.East' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveRegionFilter(tab.id as RegionFilter)}
                        className={`px-2.5 py-0.5 rounded-md uppercase tracking-wider font-semibold transition shrink-0 ${
                          activeRegionFilter === tab.id
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* GPS Current Location Auto Detect Button */}
                <div className="p-2 bg-cyan-950/30 border-b border-white/5 flex items-center justify-between">
                  <button
                    onClick={handleDetectGPS}
                    disabled={gpsLoading}
                    className="w-full py-1.5 px-3 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    {gpsLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                    <span>USE MY CURRENT GPS LOCATION</span>
                  </button>
                </div>

                {gpsError && (
                  <div className="px-3 py-1.5 text-[10px] font-mono text-red-400 bg-red-950/40 text-center border-b border-white/5">
                    {gpsError}
                  </div>
                )}

                {/* Search Results / Preset List */}
                <div className="overflow-y-auto p-2 space-y-1 divide-y divide-white/5 flex-1">
                  {/* API Live Geocoding Results */}
                  {searchQuery.trim().length >= 2 && (
                    <div className="mb-2 space-y-1">
                      <div className="text-[10px] text-cyan-400 uppercase font-mono tracking-widest px-2 py-1 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Globe2 className="w-3 h-3" /> Worldwide Search Results
                        </span>
                        {isSearchingApi && <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />}
                      </div>

                      {searchResults.map((loc) => (
                        <button
                          key={loc.id}
                          onClick={() => {
                            onSelectLocation(loc);
                            setIsSearchOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs rounded-xl bg-cyan-500/5 hover:bg-cyan-500/20 border border-cyan-500/20 text-slate-200 transition flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-cyan-200 flex items-center gap-1.5">
                              {loc.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {loc.region}, {loc.country} ({loc.lat.toFixed(2)}°, {loc.lon.toFixed(2)}°)
                            </div>
                          </div>
                          <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30 font-mono uppercase">
                            Global GPS
                          </span>
                        </button>
                      ))}

                      {!isSearchingApi && searchResults.length === 0 && (
                        <div className="px-3 py-2 text-[11px] text-slate-400 font-mono italic">
                          No direct global match found for &quot;{searchQuery}&quot;. Showing presets below.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Presets List */}
                  <div className="space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase font-mono tracking-widest px-2 py-1">
                      Preset World Capitals & HK Stations
                    </div>
                    {filteredPresets.map((loc) => (
                      <button
                        key={loc.id}
                        onClick={() => {
                          onSelectLocation(loc);
                          setIsSearchOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs rounded-xl transition flex items-center justify-between ${
                          currentLocation.id === loc.id
                            ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                            : 'hover:bg-white/5 text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-slate-200">{loc.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {loc.region}, <strong className="text-slate-300">{loc.country}</strong>
                          </div>
                        </div>
                        {loc.isHKO ? (
                          <span className="text-[9px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/30 uppercase font-bold">
                            HKO
                          </span>
                        ) : (
                          <span className="text-[9px] bg-white/5 text-slate-400 px-2 py-0.5 rounded-full border border-white/10 font-mono">
                            {loc.country}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-white/5 p-1 rounded-full border border-white/10">
            <button
              onClick={() => onTabChange('realtime')}
              className={`px-3.5 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-bold transition flex items-center gap-1.5 ${
                activeTab === 'realtime'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <CloudSun className="w-3.5 h-3.5" />
              Real-Time
            </button>

            <button
              onClick={() => onTabChange('warnings')}
              className={`px-3.5 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-bold transition flex items-center gap-1.5 relative ${
                activeTab === 'warnings'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Alerts
              {activeWarnings.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping absolute top-1 right-1" />
              )}
            </button>

            <button
              onClick={() => onTabChange('simulation')}
              className={`px-3.5 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-bold transition flex items-center gap-1.5 ${
                activeTab === 'simulation'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Simulator
            </button>

            <button
              onClick={() => onTabChange('trends')}
              className={`px-3.5 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-bold transition flex items-center gap-1.5 ${
                activeTab === 'trends'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Trends
            </button>
          </nav>

          {/* Firebase Favorites & User Account Bar */}
          <div className="flex items-center gap-2">
            {/* Saved Stations Dropdown */}
            <div className="relative" ref={favContainerRef}>
              <button
                onClick={() => setIsFavoritesOpen(!isFavoritesOpen)}
                className="px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
                title="Saved Stations in Firebase"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="hidden sm:inline">Favorites</span>
                {favorites.length > 0 && (
                  <span className="bg-amber-400 text-black px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                    {favorites.length}
                  </span>
                )}
              </button>

              {isFavoritesOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-[#020617] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden p-3 backdrop-blur-2xl">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs font-mono">
                    <span className="text-amber-400 font-bold uppercase flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      Firebase Saved Stations
                    </span>
                    <span className="text-slate-500 text-[10px]">
                      {favorites.length} Saved
                    </span>
                  </div>

                  {!user ? (
                    <div className="text-center py-4 space-y-2">
                      <p className="text-xs text-slate-400 font-mono">
                        Sign in with Google to sync favorites across devices via Firebase!
                      </p>
                      <button
                        onClick={() => {
                          signInWithGoogle();
                          setIsFavoritesOpen(false);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <LogIn className="w-4 h-4" />
                        Sign In with Google
                      </button>
                    </div>
                  ) : favorites.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-400 font-mono">
                      No favorite stations saved yet. Click the star icon on any station to save it to your Firebase account!
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-60 overflow-y-auto">
                      {favorites.map((fav) => (
                        <div
                          key={fav.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition"
                        >
                          <button
                            onClick={() => {
                              onSelectLocation(fav);
                              setIsFavoritesOpen(false);
                            }}
                            className="text-left flex-1 truncate text-xs font-bold text-slate-200 hover:text-cyan-300 cursor-pointer"
                          >
                            <div className="truncate">{fav.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono font-normal">
                              {fav.region}, {fav.country}
                            </div>
                          </button>
                          <button
                            onClick={() => removeFavorite(fav.id)}
                            className="p-1 text-slate-500 hover:text-red-400 text-xs cursor-pointer"
                            title="Remove from favorites"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Firebase Auth User Profile Button */}
            {user ? (
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-2 py-1">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-6 h-6 rounded-full border border-cyan-400" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-cyan-500 text-black font-bold text-xs flex items-center justify-center">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-mono text-slate-200 hidden md:inline truncate max-w-[100px]">
                  {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                </span>
                <button
                  onClick={logout}
                  className="p-1 text-slate-400 hover:text-red-400 transition cursor-pointer"
                  title="Sign Out of Firebase"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="px-3 py-1.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
                title="Connect Firebase Account"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="lg:hidden flex items-center justify-around py-2 border-t border-white/10 text-[10px] uppercase font-bold tracking-wider">
          <button
            onClick={() => onTabChange('realtime')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
              activeTab === 'realtime' ? 'text-cyan-400 bg-cyan-500/20 border border-cyan-500/30' : 'text-slate-400'
            }`}
          >
            <CloudSun className="w-4 h-4" />
            <span>Weather</span>
          </button>
          <button
            onClick={() => onTabChange('warnings')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
              activeTab === 'warnings' ? 'text-amber-400 bg-amber-500/20 border border-amber-500/30' : 'text-slate-400'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Alerts</span>
          </button>
          <button
            onClick={() => onTabChange('simulation')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
              activeTab === 'simulation' ? 'text-indigo-400 bg-indigo-500/20 border border-indigo-500/30' : 'text-slate-400'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Simulator</span>
          </button>
          <button
            onClick={() => onTabChange('trends')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
              activeTab === 'trends' ? 'text-purple-400 bg-purple-500/20 border border-purple-500/30' : 'text-slate-400'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Trends</span>
          </button>
        </div>
      </div>
    </header>
  );
};
