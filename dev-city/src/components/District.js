import Building from "./Building";
import { cityMap, TILE, TILE_SIZE } from "../lib/cityGrid";
import { Road, Tree, StreetLight } from "./CityProps";

export default function District({ developers, texture, onClick }) {
  // Center offset to keep the city at [0,0,0]
  const offsetX = (cityMap[0].length * TILE_SIZE) / 2;
  const offsetZ = (cityMap.length * TILE_SIZE) / 2;

  // Track which plots have been used
  let devIndex = 0;

  return (
    <group>
      {cityMap.map((row, z) => 
        row.map((tileType, x) => {
          // Calculate world position
          const posX = (x * TILE_SIZE) - offsetX + (TILE_SIZE / 2);
          const posZ = (z * TILE_SIZE) - offsetZ + (TILE_SIZE / 2);
          const position = [posX, 0, posZ];
          const key = `tile_${x}_${z}`;

          switch (tileType) {
            case TILE.ROAD:
              // Determine if road is horizontal based on neighbors
              const isHorizontal = x > 0 && x < row.length - 1 && (row[x-1] === TILE.ROAD || row[x+1] === TILE.ROAD);
              return <Road key={key} position={position} isHorizontal={isHorizontal} />;
            
            case TILE.PARK:
              return <Tree key={key} position={position} />;
              
            case TILE.STREETLIGHT:
              return <StreetLight key={key} position={position} />;
              
            case TILE.PLOT:
              // If we have developers left, place them on this plot
              if (devIndex < developers.length) {
                const dev = developers[devIndex];
                devIndex++;
                
                // Keep building sizes reasonable within the tile
                const bWidth = Math.min(dev.width || 2, TILE_SIZE * 0.9);
                const bHeight = dev.height || 5;
                const bDepth = Math.min(dev.depth || 2, TILE_SIZE * 0.9);

                return (
                  <Building
                    key={dev.github_username}
                    github_username={dev.github_username}
                    stats={dev.stats}
                    position={position}
                    width={bWidth}
                    height={bHeight}
                    depth={bDepth}
                    texture={texture}
                    onClick={onClick}
                  />
                );
              }
              // If no developer claims this plot, optionally render an empty foundation/park
              return null;

            case TILE.EMPTY:
            default:
              return null;
          }
        })
      )}
    </group>
  );
}
