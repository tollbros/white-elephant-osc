import React, { useState } from 'react';
import { Gift, Snowflake, TreePine, Heart, Sparkles, CandyCane, Star, User, Lock } from 'lucide-react';
import Card from './components/card';
import { Alert, AlertDescription } from './components/alert';
import { basePlayers, giftsData, totalGifts } from './config/gameData';
// import gift1 from './images/gift1.jpg';

const WhiteElephantGame = () => {
  // Randomize player order on initial load
  const [players] = useState(() => {
    return [...basePlayers].sort(() => Math.random() - 0.5);
  });

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [unwrappedGifts, setUnwrappedGifts] = useState([]);
  const [selectedGift, setSelectedGift] = useState(null);
  const [stolenPlayer, setStolenPlayer] = useState(null);
  const [gameEnded, setGameEnded] = useState(false);
  const [stealCounts, setStealCounts] = useState({});
  const [justStolen, setJustStolen] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [finalPick, setFinalPick] = useState(false); // Tracks if it's the final pick phase
  const firstPlayer = players[0]; // Save the first player before shuffling
  
 // Function to dynamically import all images from the `/images` folder
  const importAllImages = (requireContext) => {
  const images = {};
  requireContext.keys().forEach((key) => {
    const fileName = key.replace('./', ''); // Strip the './' from the key
    images[fileName] = requireContext(key);
  });
  return images;
};

  // Import all images from the `/images` folder
  const images = importAllImages(require.context('./images', false, /\.(png|jpe?g|svg)$/));

  // Dynamically create the gifts array
  const gifts = giftsData.slice(0, totalGifts).map((gift) => {
    const imageFileName = gift.imageFile || `gift${gift.id}.jpg`;
    return {
      id: gift.id,
      isUnwrapped: false,
      name: gift.name || `Gift #${gift.id}`,
      imageUrl: images[imageFileName] || `/api/placeholder/${120}/${120}`,
      link: gift.link || "#",
      ownedBy: null,
    };
  });

  const currentPlayer = stolenPlayer || players[currentPlayerIndex];
  
  const getCurrentPlayerGift = (player) => {
    return unwrappedGifts.find(gift => gift.ownedBy === player);
  };

  const isGiftLocked = (giftId) => {
    return (stealCounts[giftId] || 0) >= 2;
  };

  const [zoomedGiftId, setZoomedGiftId] = useState(null);  

  const exportSummary = (format = "csv") => {
    const summaryData = players.map((player) => {
      const gift = getCurrentPlayerGift(player);
      return {
        name: player,
        gift: gift ? gift.name : "No Gift",
        link: gift ? gift.link : "",
      };
    });
  
    let content;
    let fileName;
  
    if (format === "json") {
      content = JSON.stringify(summaryData, null, 2);
      fileName = "white_elephant_summary.json";
    } else if (format === "csv") {
      // Create CSV header
      content = "Name,Gift,Link\n";
      content += summaryData
        .map(({ name, gift, link }) => {
          // Escape commas and quotes in values
          return `"${name}","${gift}","${link}"`;
        })
        .join("\n");
      fileName = "white_elephant_summary.csv";
    } else {
      // Default to TXT
      content = summaryData
        .map(({ name, gift, link }) => `${name}: ${gift}${link ? ` - ${link}` : ""}`)
        .join("\n");
      fileName = "white_elephant_summary.txt";
    }
  
    const blob = new Blob([content], { type: format === "json" ? "application/json" : "text/plain" });
    const url = URL.createObjectURL(blob);
  
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleUnwrap = (giftId) => {
    if (gameEnded) return;
    if (finalPick && currentPlayer !== firstPlayer) return; // Only the first player can play during the final pick phase
    if (unwrappedGifts.find((g) => g.id === giftId)) return;
  
    const gift = gifts.find((g) => g.id === giftId);
    if (gift && !gift.isUnwrapped) {
      setZoomedGiftId(giftId); // Set the zoomed gift
      setTimeout(() => setZoomedGiftId(null), 3000); // Reset zoom after 3 seconds
  
      const updatedGift = { ...gift, ownedBy: currentPlayer };
      const newUnwrappedGifts = [...unwrappedGifts, updatedGift];
      setUnwrappedGifts(newUnwrappedGifts);
      setSelectedGift(updatedGift);
      console.log(selectedGift);
  
      if (stolenPlayer) {
        setStolenPlayer(null);
        setJustStolen(null);
      } else if (!finalPick) {
        setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % players.length);
      }
  
      const updatedGiftsMap = new Map(newUnwrappedGifts.map((g) => [g.ownedBy, g]));
      if (players.every((player) => updatedGiftsMap.has(player))) {
        if (!finalPick) {
          setFinalPick(true); // Start the final pick phase
          setCurrentPlayerIndex(0); // Set current player back to the first player
        } else {
          setGameEnded(true);
          setShowSummary(true);
        }
      }
    }
  };
  
  const handleSteal = (giftId) => {
    if (gameEnded) return;
  
    // Restrict actions for non-first players during the final pick phase
    if (finalPick && currentPlayer !== firstPlayer) return;
  
    // Handle "keep gift" option during final pick (when giftId is null or undefined)
    if (finalPick && (!giftId || !unwrappedGifts.some((g) => g.id === giftId))) {
      setGameEnded(true); // End the game
      setShowSummary(true); // Show the game summary
      return;
    }
  
    // Handle stealing logic during final pick
    if (finalPick) {
      const stolenGift = unwrappedGifts.find((g) => g.id === giftId);
      if (stolenGift && stolenGift.ownedBy !== currentPlayer) {
        const previousOwner = stolenGift.ownedBy;
  
        // Swap the gifts
        const updatedGifts = unwrappedGifts.map((g) => {
          if (g.id === giftId) {
            return { ...g, ownedBy: currentPlayer }; // Assign stolen gift to the first player
          }
          if (g.ownedBy === currentPlayer) {
            return { ...g, ownedBy: previousOwner }; // Assign first player's gift to the previous owner
          }
          return g; // Keep other gifts unchanged
        });
  
        setUnwrappedGifts(updatedGifts);
        setGameEnded(true); // End the game
        setShowSummary(true); // Show the summary
        return;
      }
    }
  
    // Normal steal logic for non-final pick phase
    const stolenGift = unwrappedGifts.find((g) => g.id === giftId);
    if (stolenGift && stolenGift.ownedBy !== currentPlayer) {
      setZoomedGiftId(giftId); // Set the zoomed gift
      setTimeout(() => setZoomedGiftId(null), 3000); // Reset zoom after 3 seconds
  
      const previousOwner = stolenGift.ownedBy;
      const updatedGifts = unwrappedGifts.map((g) =>
        g.id === giftId ? { ...g, ownedBy: currentPlayer } : g
      );
  
      setUnwrappedGifts(updatedGifts);
      setSelectedGift(stolenGift);
      setStolenPlayer(previousOwner);
      setJustStolen(giftId);
  
      setStealCounts((prev) => ({
        ...prev,
        [giftId]: (prev[giftId] || 0) + 1,
      }));
  
      if (!stolenPlayer) {
        setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % players.length);
      }
  
      const updatedGiftsMap = new Map(updatedGifts.map((g) => [g.ownedBy, g]));
      if (players.every((player) => updatedGiftsMap.has(player))) {
        if (!finalPick) {
          setFinalPick(true); // Start the final pick phase
          setCurrentPlayerIndex(0); // Set current player back to the first player
        } else {
          setGameEnded(true);
          setShowSummary(true);
        }
      }
    }
  };

  const canStealGift = (giftId, owner) => {
    if (gameEnded) return false;
    if (isGiftLocked(giftId)) return false;
    if (giftId === justStolen) return false;
    if (owner === currentPlayer) return false;
    return currentPlayer === stolenPlayer || !stolenPlayer;
  };

  if (showSummary) {
    return (
      <div className="p-4">
        <h2 className="text-2xl text-center font-bold mb-4">White Elephant Gift Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players
            .map(player => ({
              name: player,
              gift: getCurrentPlayerGift(player)
            }))
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(({ name, gift }) => (
              <Card key={name} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-teal-900">{name}</p>
                    <p className="text-m text-gray-500">
                    {gift ? (
                     <>
                      <span>{gift.name}</span>
                      {gift.link && (
                       <a
                        href={gift.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-900 underline ml-2"
                        >
                       Buy Gift Here
                       </a>
                       )}
                      {isGiftLocked(gift.id) && " 🔒"}
                      {stealCounts[gift.id] > 0 && ` (Stolen ${stealCounts[gift.id]}x)`}
                      </>
                      ) : (
                      "No Gift"
                    )}
                    </p>
                  </div>
                  <Gift className="text-rose-800" size={24} />
                </div>
              </Card>
            ))}
           
           <div className="flex justify-center gap-4 mt-4">
  <button
    onClick={() => exportSummary("csv")}
    className="px-4 py-2 bg-rose-800 text-white rounded hover:bg-rose-400"
  >
    Export as CSV
  </button>
  <button
    onClick={() => exportSummary("json")}
    className="px-4 py-2 bg-teal-900 text-white rounded hover:bg-teal-500"
  >
    Export as JSON
  </button>
</div>

        </div>
        <button 
          onClick={() => setShowSummary(false)}
          className="mt-4 px-4 py-2 bg-rose-800 text-white rounded hover:bg-rose-400"
        >
          Back to Game
        </button>
      </div>
    );
  }

  const getStatus = () => {
    if (gameEnded) {
      return "Game Over! Everyone has a gift!";
    }
    if (finalPick) {
      return (
        <>
          <span className="font-semibold text-teal-900">{firstPlayer}</span>, it's your final turn! Steal a gift (you'll swap gifts with its owner) or keep yours!
        </>
      );
    }
    if (stolenPlayer) {
      return (
        <>
          <span className="font-semibold text-rose-700">{stolenPlayer}</span>'s gift was stolen! {stolenPlayer}, you can steal another gift or unwrap a new one!
        </>
      );
    }
    return (
      <>
        <span className="font-semibold text-teal-900">{currentPlayer}</span>, you can steal an unwrapped gift or unwrap a new one!
      </>
    );
  };

  const getPlayerStatus = (player) => {
    if (gameEnded) return 'bg-indigo-900 text-white';
    if (player === currentPlayer) return 'bg-teal-900 text-white';
    if (player === stolenPlayer) return 'bg-rose-500 text-white';
    if (getCurrentPlayerGift(player)) return 'bg-teal-900 text-white';
    return 'bg-gray-200';
  };

  // const getPlayersWithGifts = () => {
  //   return players
  //     .filter(player => getCurrentPlayerGift(player))
  //     .sort((a, b) => a.localeCompare(b));
  // };

  const getPlayersWithoutGifts = () => {
    return players
      .filter(player => !getCurrentPlayerGift(player))
      .sort((a, b) => a.localeCompare(b));
  };

  return (
    <div className="min-h-screen bg-[#f8f1f5] p-4">
      <div className="mb-6">
        <div className="relative flex flex-col items-center text-center gap-3 mb-6 overflow-hidden rounded-3xl border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-sky-50 px-5 py-6 shadow-lg">
          <div className="pointer-events-none absolute -top-2 left-4 text-rose-200/90">
            <Snowflake
              size={72}
              className="drop-shadow animate-[spin_12s_linear_infinite]"
            />
          </div>
          <div className="pointer-events-none absolute -bottom-2 right-4 text-teal-200/80">
            <TreePine
              size={92}
              className="drop-shadow animate-[pulse_6s_ease-in-out_infinite]"
            />
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-600 shadow-sm ring-1 ring-rose-100">
            <Sparkles size={16} /> Holiday Cheer Mode
          </span>
          <h2 className="holiday-title text-4xl font-black text-teal-900 sm:text-5xl">OSC White Elephant Gift Exchange</h2>
          <p className="max-w-2xl text-xs text-slate-600 sm:text-sm">
            Unwrap. Steal. Repeat. Because holiday chaos is the gift that keeps on giving.
          </p>
          <div className="flex items-center justify-center gap-3 text-rose-500">
            <CandyCane size={24} className="drop-shadow-sm" />
            <Gift size={24} className="drop-shadow-sm text-amber-500" />
            <Heart size={22} className="drop-shadow-sm text-teal-500" />
            <Star size={22} className="drop-shadow-sm text-rose-400" />
          </div>
          {gameEnded && (
            <button
              onClick={() => setShowSummary(true)}
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-indigo-900 px-5 py-2 text-white shadow hover:bg-indigo-700"
            >
              <Gift size={18} /> View Summary
            </button>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-transparent via-rose-200/60 to-transparent" />
        </div>
        
        <Alert className={`mb-4 rounded-2xl border border-rose-100 bg-gradient-to-r from-white via-rose-50/50 to-white shadow ${gameEnded ? 'ring-1 ring-indigo-200' : ''}`}>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600/20 text-emerald-700 shadow-inner ring-1 ring-emerald-500/50">
              <User className="h-5 w-5" />
            </span>
            <AlertDescription>
              <p className="text-base text-slate-700">{getStatus()}</p>

              {/* Add "Keep My Gift" button during the final pick phase */}
              {finalPick && currentPlayer === firstPlayer && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => handleSteal(null)} // Trigger "keep gift" logic
                    className="px-4 py-2 rounded-full bg-teal-900 text-white shadow hover:bg-teal-700"
                  >
                    Keep My Gift
                  </button>
                </div>
              )}
            </AlertDescription>
          </div>
        </Alert>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Current Player</h3>
          <div className="flex gap-2 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-sm ${getPlayerStatus(currentPlayer)}`}>
              {currentPlayer}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Players with Gifts</h3>
          <div className="flex gap-2 flex-wrap">
            {players
              .filter((player) => unwrappedGifts.some((g) => g.ownedBy === player))
              .map((player) => {
                const gift = unwrappedGifts.find((g) => g.ownedBy === player); // Get the player's gift
                return (
                  <div key={player} className="flex flex-col items-center">
                    {/* Player Bubble */}
                    <span className="px-3 py-1 rounded-full text-sm bg-rose-800 text-white">
                      {player}
                    </span>
                    {/* Gift Name Below */}
                    <p className="text-sm text-black-800 mt-1">
                      {gift ? gift.name : 'No Gift'}
                    </p>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Players Waiting for Gifts</h3>
          <div className="flex gap-2 flex-wrap">
            {getPlayersWithoutGifts().map((player) => (
              <span key={player} className={`px-3 py-1 rounded-full text-sm ${getPlayerStatus(player)}`}>
                {player}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {gifts.map((gift) => {
    const unwrappedGift = unwrappedGifts.find((g) => g.id === gift.id);
    const isUnwrapped = !!unwrappedGift;
    // const isLocked = isGiftLocked(gift.id);
    const canSteal = isUnwrapped && canStealGift(gift.id, unwrappedGift?.ownedBy);
    const canUnwrap = !isUnwrapped && (currentPlayer === stolenPlayer || !stolenPlayer);

   // Randomized colors, sizes, and icons
   const colors = [
    "bg-gradient-to-br from-rose-800 via-rose-700 to-rose-500",
    "bg-gradient-to-br from-indigo-700 via-purple-500 to-indigo-400",
    "bg-gradient-to-br from-pink-500 via-rose-300 to-rose-100",
    "bg-gradient-to-br from-emerald-900 via-emerald-700 to-teal-600",
    "bg-gradient-to-br from-sky-500 via-blue-400 to-indigo-300"
   ];
   const textColors = ["text-rose-50", "text-indigo-50", "text-rose-900", "text-emerald-50", "text-sky-50"];
   const iconSizes = [48, 98, 38, 76, 52, 64];
   const icons = [Gift, Snowflake, TreePine, Sparkles, CandyCane, Heart, Star];
      

   const colorClass = colors[gift.id % colors.length];
    const textColorClass = textColors[gift.id % textColors.length];
    const iconSize = iconSizes[gift.id % iconSizes.length];
    const IconComponent = icons[gift.id % icons.length]; // Define the icon dynamically

    return (
<Card
  key={gift.id}
  className={`relative cursor-pointer rounded-3xl border border-slate-200 bg-slate-50/90 p-2 transition-transform duration-300 ${
    zoomedGiftId === gift.id ? 'transform scale-150 z-10' : 'hover:-translate-y-1 hover:shadow-lg'
  } ${
    (!canSteal && !canUnwrap) || gameEnded ? 'opacity-50 cursor-not-allowed' : ''
  }`}
  onClick={() => {
    if (!canSteal && !canUnwrap) {
      return;
    }
  
    setZoomedGiftId(gift.id); // Set the zoomed gift
  
    setTimeout(() => {
      // Ensure only the current zoomed gift is reset
      if (zoomedGiftId === gift.id) {
        setZoomedGiftId(null);
      }
    }, 3000);
  
    isUnwrapped ? handleSteal(gift.id) : handleUnwrap(gift.id);
  }}
>
  <div
    className={`h-[350px] w-full flex flex-col justify-between overflow-hidden rounded-2xl border ${
      isUnwrapped ? 'bg-white border-slate-200 shadow-md' : `${colorClass} border-white/70 shadow`
    }`}
  >
    {/* Icon or Image */}
    <div className="flex-grow relative flex items-center justify-center">
      {!isUnwrapped ? (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Dynamically render the icon */}
          <IconComponent size={iconSize} className={textColorClass} />
        </div>
      ) : (
        <img
          src={gift.imageUrl}
          alt={`Gift ${gift.id}`}
          className="w-full h-full object-cover"
        />
      )}
    </div>

    {/* Footer: Player Name, Gift Name, and Steal Info */}
    <div className="bg-gray-900 bg-opacity-75 text-white p-2 flex flex-col items-center">
      {isUnwrapped && <p className="text-sm font-bold">{unwrappedGift?.ownedBy}</p>}
      <p className="text-s font-medium">
        {isUnwrapped ? unwrappedGift.name : `Gift #${gift.id}`}
      </p>
      {stealCounts[gift.id] > 0 && (
  <p className="text-s mt-1 font-bold">
    {stealCounts[gift.id] === 1 && (
      <span className="text-yellow-300">Stolen Once</span>
    )}
    {stealCounts[gift.id] === 2 && (
      <span className="text-red-500">
        Stolen Twice
        <Lock className="inline-block ml-1 text-red-500" size={15} />
      </span>
    )}
  </p>
    )}
    </div>
  </div>
</Card>
    );
  })}
      </div>
    </div>
  );
};

export default WhiteElephantGame;
