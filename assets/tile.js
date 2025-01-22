Game.Tile = function(properties) {
    properties = properties || {};

    Game.Glyph.call(this, properties);
    // Set up the properties. We use false by default.
    this.walkable = properties['walkable'] || false;
    this.diggable = properties['diggable'] || false;
    this.blocksLight = (properties['blocksLight'] !== undefined) ?
        properties['blocksLight'] : true;
    this.bed = properties['bed'] || false;
};

Game.Tile.extend(Game.Glyph);

Game.Tile.prototype.walkableFunct = function() {
    return this.walkable;
}
Game.Tile.prototype.diggableFunct = function() {
    return this.diggable;
}
Game.Tile.prototype.isBlockingLight = function() {
    return this.blocksLight;
}

Game.getNeighborPositions = function(x, y) {
    let tiles = [];
    // Generate all possible offsets
    for (let dX = -1; dX < 2; dX ++) {
        for (let dY = -1; dY < 2; dY++) {
            // Make sure it isn't the same tile
            if (dX == 0 && dY == 0) {
                continue;
            }
            tiles.push({x: x + dX, y: y + dY});
        }
    }
    return tiles.randomize();
}

Game.Tile.nullTile = new Game.Tile({});
Game.Tile.floorTile = new Game.Tile({
    character: '.',
    foreground: color.blue,
    walkable: true,
    blocksLight: false
});

Game.Tile.wallTile = new Game.Tile({
    character: '#',
    foreground: color.lightBlue,
    background: "#212121",
    diggable: false,
    walkable: false,
    blocksLight: true
});

Game.Tile.buildingWallTile = new Game.Tile({
    character: '|',
    foreground: color.brown,
    diggable: false,
    walkable: false,
    blocksLight: true
});

Game.Tile.digTile = new Game.Tile({
    character: '#',
    foreground: color.lightBlue,
    background: "#313131",
    diggable: true,
    walkable: false,
    blocksLight: true
});

Game.Tile.stairsUpTile = new Game.Tile({
    character: '<',
    foreground: 'white',
    walkable: true,
    blocksLight: false
});
Game.Tile.stairsDownTile = new Game.Tile({
    character: '>',
    foreground: 'white',
    walkable: true,
    blocksLight: false
});

Game.Tile.mossTile = new Game.Tile({
    character: ',',
    foreground: color.mossGreen,
    walkable: true,
    blocksLight: false
});

Game.Tile.grassTile = new Game.Tile({
    character: ',',
    foreground: color.green,
    walkable: true,
    blocksLight: false
});

Game.Tile.smoothStoneTile = new Game.Tile({
    character: '_',
    foreground: color.grey,
    walkable: true,
    blocksLight: false
});

Game.Tile.buildingFloorTile = new Game.Tile({
    character: '.',
    foreground: color.brown,
    walkable: true,
    blocksLight: false
});

Game.Tile.buildingInnFloorTile = new Game.Tile({
    character: '.',
    foreground: color.brown,
    walkable: true,
    blocksLight: false
});

Game.Tile.buildingShopFloorTile = new Game.Tile({
    character: '.',
    foreground: color.brown,
    walkable: true,
    blocksLight: false
});

Game.Tile.buildingBlacksmithFloorTile = new Game.Tile({
    character: '.',
    foreground: color.brown,
    walkable: true,
    blocksLight: false
});

Game.Tile.buildingTableTile = new Game.Tile({
    character: '=',
    foreground: color.brown,
    walkable: false,
    blocksLight: false
});

Game.Tile.bedTile = new Game.Tile({
    character: '8',
    foreground: color.blue,
    walkable: true,
    blocksLight: false,
    bed: true
});

Game.Tile.treeTile = new Game.Tile({
    character: '||',
    foreground: color.brown,
    background: color.lightGreen,
    walkable: false,
    blocksLight: false
});

Game.Tile.doorTile = new Game.Tile({
    character: '[]',
    foreground: color.lightBlue,
    diggable: false,
    walkable: true,
    blocksLight: false
});