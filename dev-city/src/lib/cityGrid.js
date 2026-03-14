// Represents the map grid for our city
export const TILE_SIZE = 4; // Each tile is 4x4 units in 3D space

// Tile Types
export const TILE = {
  EMPTY: 0,
  ROAD: 1,
  PLOT: 2, // Where buildings go
  PARK: 3, // Trees/Greenery
  STREETLIGHT: 4,
};

// A 15x15 simple city block layout
// Center cross shape are roads, with building plots lining them.
export const cityMap = [
  [3, 3, 3, 1, 2, 2, 2, 1, 2, 2, 2, 1, 3, 3, 3],
  [3, 0, 2, 1, 2, 0, 2, 1, 2, 0, 2, 1, 2, 0, 3],
  [2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [2, 2, 2, 1, 2, 3, 2, 1, 2, 3, 2, 1, 2, 2, 2],
  [2, 0, 2, 1, 3, 4, 3, 1, 3, 4, 3, 1, 2, 0, 2],
  [2, 2, 2, 1, 2, 3, 2, 1, 2, 3, 2, 1, 2, 2, 2],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [2, 2, 2, 1, 2, 3, 2, 1, 2, 3, 2, 1, 2, 2, 2],
  [2, 0, 2, 1, 3, 4, 3, 1, 3, 4, 3, 1, 2, 0, 2],
  [2, 2, 2, 1, 2, 3, 2, 1, 2, 3, 2, 1, 2, 2, 2],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2],
  [3, 0, 2, 1, 2, 0, 2, 1, 2, 0, 2, 1, 2, 0, 3],
  [3, 3, 3, 1, 2, 2, 2, 1, 2, 2, 2, 1, 3, 3, 3],
];

/**
 * Returns a list of coordinate positions for a specific tile type
 */
export function getTilePositions(type) {
  const positions = [];
  const offsetX = (cityMap[0].length * TILE_SIZE) / 2;
  const offsetZ = (cityMap.length * TILE_SIZE) / 2;

  cityMap.forEach((row, z) => {
    row.forEach((value, x) => {
      if (value === type) {
        // Calculate world position relative to center [0,0,0]
        positions.push({
          x: (x * TILE_SIZE) - offsetX + (TILE_SIZE / 2),
          z: (z * TILE_SIZE) - offsetZ + (TILE_SIZE / 2),
          gridX: x,
          gridZ: z
        });
      }
    });
  });

  return positions;
}
