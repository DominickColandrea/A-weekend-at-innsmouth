Game.Builder = function(width, height, depth) {
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.tiles = new Array(depth);
    this.regions = new Array(depth);

    for (let z = 0; z <= depth; z++) {
        // Create a new cave at each level

        //make town the first floor
        if (z == 0) {
            this.tiles[z] = this.generateTown();
        }

        else if (z == depth-1 || z == depth-2){
            this.tiles[z] = this.generateDungeon(z);
        }
        else if (z == depth){
            this.tiles[z] = this.generateLair(z);
        }
        else{
            this.tiles[z] = this.generateLevel(z);
        }
        // Setup the regions array for each depth
        this.regions[z] = new Array(width);
        for (let x = 0; x < width; x++) {
            this.regions[z][x] = new Array(height);
            // Fill with zeroes
            for (let y = 0; y < height; y++) {
                this.regions[z][x][y] = 0;
            }
        }
    }

    for (let z = 0; z < this.depth; z++) {
        this.setupRegions(z);
    }
    this.connectAllRegions();
};


Game.Builder.prototype.generateTown = function() {

    let map = new Array(this.width);
    for (let w = 0; w < this.width; w++) {
        map[w] = new Array(this.height);
    }

    //random town
    let townGenerator = new ROT.Map.Uniform(this.width, this.height,
        {
            dugPercentage:0.5,
            roomDugPercentage: 0.2,
            roomWidth:[4, 10],
            roomHeight:[4, 10],
        });
    townGenerator.create(function(x,y,v) {
        if (v === 1) {
            map[x][y] = Game.Tile.smoothStoneTile;
        } else {
            map[x][y] = Game.Tile.buildingWallTile;
        }
    });

    let staircaseCount = 0;
    let npcCount = 0;
    let innCount = 0;
    let blacksmithCount = 0;
    let shopCount = 0;
    let houseCount = 0;

    //loop through all corridors
    for (let i = 0; i < townGenerator._corridors.length; i++) {
        let startX = townGenerator._corridors[i]._startX;
        let endX = townGenerator._corridors[i]._endX;
        let startY = townGenerator._corridors[i]._startY;
        let endY = townGenerator._corridors[i]._endY;

        if (startX <= endX) {
            for (let j = startX; j <= endX; j++) {
                map[j][startY] = Game.Tile.smoothStoneTile;
            }
        }
        else{
            for (let j = endX; j <= startX; j++) {
                map[j][startY] = Game.Tile.smoothStoneTile;
            }
        }
        if (startY <= endY) {
            for (let j = startY; j <= endY; j++) {
                map[startX][j] = Game.Tile.smoothStoneTile;
            }
        }
        else{
            for (let j = endY; j <= startY; j++) {
                map[startX][j] = Game.Tile.smoothStoneTile;
            }
        }
    }

    //get all rooms/houses
    for (let i = 0; i < townGenerator._rooms.length; i++) {
        houseCount++;
        let x1 = townGenerator._rooms[i]._x1;
        let x2 = townGenerator._rooms[i]._x2;
        let y1 = townGenerator._rooms[i]._y1;
        let y2 = townGenerator._rooms[i]._y2;

        //add floors
        for (let j = x1; j <= x2; j++) {           
           for (let k = y1; k <= y2; k++) {
               map[j][k] = Game.Tile.buildingFloorTile;
           }
        }

        //add walls
        for (let j = x1-1; j <= x2+1; j++) {           
            map[j][y1-1] = Game.Tile.buildingWallTile;
            map[j][y2+1] = Game.Tile.buildingWallTile;
        }
        for (let j = y1-1; j <= y2+1; j++) {           
            map[x1-1][j] = Game.Tile.buildingWallTile;
            map[x2+1][j] = Game.Tile.buildingWallTile;
        }

        //add doors
        let door = townGenerator._rooms[i]._doors;
        for (let i = 0; i < Object.keys(door).length; i++) {

            let doorKeys = Object.keys(door)[i];
            let doorKeysSplit = doorKeys.split(',');

            map[doorKeysSplit[0]][doorKeysSplit[1]] = Game.Tile.doorTile;
        }

        //helper vars
        let left = townGenerator._rooms[i].getLeft();
        let right = townGenerator._rooms[i].getRight();
        let top = townGenerator._rooms[i].getTop();
        let bottom = townGenerator._rooms[i].getBottom();
        let center = townGenerator._rooms[i].getCenter();
        
        if (staircaseCount == 0) {
            map[center[0]][center[1]] = Game.Tile.stairsDownTile;
            staircaseCount++;
            townGenerator._rooms[i].stairs = true;
        }

        if (blacksmithCount == 0 && houseCount == 2) {
            for (let j = x1; j <= x2; j++) {           
               for (let k = y1; k <= y2; k++) {
                   map[j][k] = Game.Tile.buildingBlacksmithFloorTile;
               }
            }
            
            blacksmithCount++;
            townGenerator._rooms[i].blacksmith = true;
        }
        if (shopCount == 0 && houseCount == 3) {
            for (let j = x1; j <= x2; j++) {           
               for (let k = y1; k <= y2; k++) {
                   map[j][k] = Game.Tile.buildingShopFloorTile;
               }
            }
            
            shopCount++;
            townGenerator._rooms[i].shop = true;
        }
        //set inn tiles
        if (innCount == 0 && houseCount == 4) {
            for (let j = x1; j <= x2; j++) {           
               for (let k = y1; k <= y2; k++) {
                   map[j][k] = Game.Tile.buildingInnFloorTile;
               }
            }
            map[right][center[1]] = Game.Tile.bedTile;
            innCount++;
            townGenerator._rooms[i].inn = true;
        }

    }


    let generator = new ROT.Map.Arena(this.width, this.height);
    generator.create(function(x,y,v) {
        if (v === 1) {
            map[x][y] = Game.Tile.treeTile;
        }
    });

    return map;
};

Game.Builder.prototype.generateLevel = function(z) {

    let map = new Array(this.width);
    for (let w = 0; w < this.width; w++) {
        map[w] = new Array(this.height);
    }


    let celGenerator = new ROT.Map.Cellular(this.width, this.height, {
        //options?
    });

    celGenerator.randomize(0.5);
    let totalIterations = 10;

    for (let i = 0; i < totalIterations - 1; i++) {
        celGenerator.create();
    }
    // Smoothen it one last time and then update our map also connect it
    celGenerator.connect(function(x,y,v) {
        if (v === 0) {
            map[x][y] = Game.Tile.wallTile;
        }
        else{
            map[x][y] = Game.Tile.floorTile;
        }
    }, 1);


    //make sure the border is solid
    let arenaGenerator = new ROT.Map.Arena(this.width, this.height);
    arenaGenerator.create(function(x,y,v) {
        if (v === 1) {
            map[x][y] = Game.Tile.wallTile;
        }
    });

    if (z == 1) {
      let arenaGenerator = new ROT.Map.Arena(15, 15);
      arenaGenerator.create(function(x,y,v) {
          if (v === 0) {
             map[x][y] = Game.Tile.floorTile;
          }
      });

      map[2][2] = Game.Tile.stairsUpTile;

    }

    return map;
};

Game.Builder.prototype.generateDungeon = function(z) {

    // Create the empty map
    let map = new Array(this.width);
    for (let w = 0; w < this.width; w++) {
        map[w] = new Array(this.height);
    }

    //dungeon
    let generator = new ROT.Map.Digger(this.width, this.height, {dugPercentage:1});
    generator.create(function(x,y,v) {
        if (v === 0) {
            map[x][y] = Game.Tile.floorTile;
        } else {
            map[x][y] = Game.Tile.wallTile;
        }
    });


    //setup doors/dig tiles
    let rooms = generator.getRooms();
    for (let i = 0; i < rooms.length; i++) {
        let door = rooms[i]._doors;
        let doorKeys = Object.keys(door)[0];
        let doorKeysSplit = doorKeys.split(',');
        map[doorKeysSplit[0]][doorKeysSplit[1]] = Game.Tile.digTile;
    }

    return map;
};

Game.Builder.prototype.generateLair = function(z) {
    // Create the empty map
    let map = new Array(this.width);
    for (let w = 0; w < this.width; w++) {
        map[w] = new Array(this.height);
    }


    let celGenerator = new ROT.Map.Cellular(this.width, this.height, {
        //born: [4, 5, 6, 7, 8],
        //survive: [2, 3, 4, 5]
    });

    celGenerator.randomize(0.63);
    let totalIterations = 10;

    for (let i = 0; i < totalIterations - 1; i++) {
        celGenerator.create();
    }
    // Smoothen it one last time and then update our map also connect it
    celGenerator.connect(function(x,y,v) {
        if (v === 0) {
            map[x][y] = Game.Tile.wallTile;
        }
        else{
            map[x][y] = Game.Tile.floorTile;
        }
    }, 1);

    //make sure the border is solid
    let arenaGenerator = new ROT.Map.Arena(this.width, this.height);
    arenaGenerator.create(function(x,y,v) {
        if (v === 1) {
            map[x][y] = Game.Tile.wallTile;
        }
    });


    return map;

};


// This sets up the regions for a given depth level.
Game.Builder.prototype.setupRegions = function(z) {
    let region = 1;
    let tilesFilled;
    // Iterate through all tiles searching for a tile that
    // can be used as the starting point for a flood fill
    for (let x = 0; x < this.width; x++) {
        for (let y = 0; y < this.height; y++) {
            if (this.canFillRegion(x, y, z)) {
                // Try to fill
                tilesFilled = this.fillRegion(region, x, y, z);
                // If it was too small, simply remove it
                if (tilesFilled <= 20) {
                    //this.removeRegion(region, z);
                } else {
                    region++;
                }
            }
        }
    }
}

Game.Builder.prototype.canFillRegion = function(x, y, z) {
    // Make sure the tile is within bounds
    if (x < 0 || y < 0 || z < 0 || x >= this.width ||
        y >= this.height || z >= this.depth) {
        return false;
    }
    // Make sure the tile does not already have a region
    if (this.regions[z][x][y] != 0) {
        return false;
    }
    // Make sure the tile is walkable
    return this.tiles[z][x][y].walkableFunct();
}

Game.Builder.prototype.fillRegion = function(region, x, y, z) {
    let tilesFilled = 1;
    let tiles = [{x:x, y:y}];
    let tile;
    let neighbors;
    // Update the region of the original tile
    this.regions[z][x][y] = region;
    // Keep looping while we still have tiles to process
    while (tiles.length > 0) {
        tile = tiles.pop();
        // Get the neighbors of the tile
        neighbors = Game.getNeighborPositions(tile.x, tile.y);
        // Iterate through each neighbor, checking if we can use it to fill
        // and if so updating the region and adding it to our processing
        // list.
        while (neighbors.length > 0) {
            tile = neighbors.pop();
            if (this.canFillRegion(tile.x, tile.y, z)) {
                this.regions[z][tile.x][tile.y] = region;
                tiles.push(tile);
                tilesFilled++;
            }
        }

    }
    return tilesFilled;
}


// This fetches a list of points that overlap between one
// region at a given depth level and a region at a level beneath it.
Game.Builder.prototype.findRegionOverlaps = function(z, r1, r2) {
    let matches = [];
    // Iterate through all tiles, checking if they respect
    // the region constraints and are floor tiles. We check
    // that they are floor to make sure we don't try to
    // put two stairs on the same tile.
    for (let x = 0; x < this.width; x++) {
        for (let y = 0; y < this.height; y++) {
            if (this.tiles[z][x][y]  == Game.Tile.floorTile &&
                this.tiles[z+1][x][y] == Game.Tile.floorTile &&
                this.regions[z][x][y] == r1 &&
                this.regions[z+1][x][y] == r2) {
                matches.push({x: x, y: y});
            }
        }
    }
    // We shuffle the list of matches to prevent bias
    return matches.randomize();
}

// This tries to connect two regions by calculating 
// where they overlap and adding stairs
Game.Builder.prototype.connectRegions = function(z, r1, r2) {
    //dont spawn random staircase in town
    if (z == 0) {
        return;
    }

    let overlap = this.findRegionOverlaps(z, r1, r2);
    // Make sure there was overlap
    if (overlap.length == 0) {
        return false;
    }
    // Select the first tile from the overlap and change it to stairs
    let point = overlap[0];
    this.tiles[z][point.x][point.y] = Game.Tile.stairsDownTile;
    this.tiles[z+1][point.x][point.y] = Game.Tile.stairsUpTile;
    return true;
}

// This tries to connect all regions for each depth level,
// starting from the top most depth level.
Game.Builder.prototype.connectAllRegions = function() {
    for (let z = 0; z < this.depth; z++) {
        // Iterate through each tile, and if we haven't tried
        // to connect the region of that tile on both depth levels
        // then we try. We store connected properties as strings
        // for quick lookups.
        let connected = {};
        let key;
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                key = this.regions[z][x][y] + ',' +
                      this.regions[z+1][x][y];
                if (this.tiles[z][x][y] == Game.Tile.floorTile &&
                    this.tiles[z+1][x][y] == Game.Tile.floorTile &&
                    !connected[key]) {
                    // Since both tiles are floors and we haven't 
                    // already connected the two regions, try now.
                    this.connectRegions(z, this.regions[z][x][y],
                        this.regions[z+1][x][y]);
                    connected[key] = true;
                }
            }
        }
    }
}


Game.Builder.prototype.getTiles = function () {
    return this.tiles;
}
Game.Builder.prototype.getDepth = function () {
    return this.depth;
}
Game.Builder.prototype.getWidth = function () {
    return this.width;
}
Game.Builder.prototype.getHeight = function () {
    return this.height;
}