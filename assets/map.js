Game.Map = function(tiles, player) {
    this.tiles = tiles;
    
    this.depth = tiles.length;
    this.width = tiles[0].length;
    this.height = tiles[0][0].length;

    this.fov = [];
    this.setupFov();

    this.explored = new Array(this.depth);
    this.setupExploredArray();

    // create a table which will hold the entities
    this.entities = {};

    // create a table which will hold the items
    this.items = {};

    // create the engine and scheduler
    this.scheduler = new ROT.Scheduler.Speed();
    this.engine = new ROT.Engine(this.scheduler);

    // add the player
    this.player = player;
    //random
    this.addEntityAtRandomPosition(player, 0);
    
    //not random
    //this.addEntityAtPosition(player, 50, 45, 0);

    //add quest
    player.addQuest("Retrive Necronomicon");

    //gold test
    //this.addItem(50, 43, 0, Game.ItemRepository.create('gold'))
    //this.addItem(50, 42, 0, Game.ItemRepository.create('gold'))
    //this.addItem(50, 41, 0, Game.ItemRepository.create('gold'))



    // Add weapons and armor to the map in random positions
    let templates = ['dagger', 'gauntlet', 'cutlass', 
        'cane', 'waistcoat', 'tunic' , 'blazer', 'overcoat', 'battleaxe'];


    // Add random entities and items to each floor.
    //depth of 0 is the starting town
    for (let z = 0; z < this.depth; z++) {

        if (z == 0) {
            //add npcs to buildings
            this.addNPC(12, 0, "citizen");
            this.addNPC(1, 0, "scholar");
            this.addInnNPC(1, 0, "innkeeper");
            this.addShopNPC(1, 0, "shopkeeper");
            this.addBlacksmithNPC(1, 0, "blacksmith");
        }


        //dungeon
        else if (z > 0) {
            // 15 entities per floor
            for (let i = 0; i < 15; i++) {
                // Add a random entity
                let randomEntity = Game.EntityRepository.createRandom();
                if (!randomEntity.attachedMixins.TownActor && !randomEntity.attachedMixins.BossMob) {
                    this.addEntityAtRandomPosition(randomEntity, z);
                }
            }

            // 10 items per floor
            for (let i = 0; i < 10; i++) {
                // Add a random entity
                let randomItem = Game.ItemRepository.createRandom();
                this.addItemAtRandomPosition(randomItem, z);
            }

            // random equipable per floor, roll x times per floor
                                        //-1 is to NOT roll battleaxe, quest reward
            for (let i = 0; i < templates.length-1; i++) {
                let seededChance = ROT.RNG.getUniform();
                
                if (seededChance >= 0.5) {
                    this.addItemAtRandomPosition(Game.ItemRepository.create(templates[i]), z);
                    console.log("added item on floor "+ z)
                }
            }

            //create necronomicon on last floor
            if (z == this.depth-1) {
                let necro = Game.ItemRepository.create("necronomicon");
                this.addItemAtRandomPosition(necro, z);

                //add last boss here
                this.addEntityAtRandomPosition(Game.EntityRepository.create("hulking shambler"),z)
            }


            //add lost son quest item
            if (z == 1) {
                let lostSon = Game.ItemRepository.create("lostSon");
                this.addItemAtRandomPosition(lostSon, z);                
            }

        }

    }
};

Game.Map.prototype.getPlayer = function() {
    return this.player;
};

// Standard getters
Game.Map.prototype.getWidth = function() {
    return this.width;
};
Game.Map.prototype.getHeight = function() {
    return this.height;
};
Game.Map.prototype.getDepth = function() {
    return this.depth;
};


Game.Map.prototype.addNPC = function(count, z, templateName="citizen") {
    let npcs = 0;
    do {
        let randomNPC = Game.EntityRepository.create(templateName);
        this.addEntityAtRandomPosition(randomNPC, z);
        npcs++;
    }
    while(npcs < count)
};

Game.Map.prototype.addInnNPC = function(count, z, templateName="citizen") {
    let npcs = 0;
    do {
        let randomNPC = Game.EntityRepository.create(templateName);
        this.addEntityAtRandomPositionInInn(randomNPC, z);
        npcs++;
    }
    while(npcs < count)
};
Game.Map.prototype.addShopNPC = function(count, z, templateName="citizen") {
    let npcs = 0;
    do {

        for (let i = 0; i < 10; i++) {
            let randomItem = Game.ItemRepository.create("apple_shop");
            this.addItemAtRandomPositionInShop(randomItem, z);
        }


        let randomNPC = Game.EntityRepository.create(templateName);
        this.addEntityAtRandomPositionInShop(randomNPC, z);
        npcs++;
    }
    while(npcs < count)
};

Game.Map.prototype.addBlacksmithNPC = function(count, z, templateName="citizen") {
    let npcs = 0;
    do {
        let randomNPC = Game.EntityRepository.create(templateName);
        let battleaxeSpawn = Game.ItemRepository.create("battleaxe");

        this.addEntityAtRandomPositionInBlacksmithShop(randomNPC, z);
        this.addItemAtRandomPositionInBlacksmithShop(battleaxeSpawn, z);
        npcs++;
    }
    while(npcs < count)
};
Game.Map.prototype.setupFov = function() {
    // Keep this in 'map' variable so that we don't lose it.
    let map = this;
    // Iterate through each depth level, setting up the field of vision
    for (let z = 0; z < this.depth; z++) {
        // We have to put the following code in it's own scope to prevent the
        // depth variable from being hoisted out of the loop.
        (function() {
            // For each depth, we need to create a callback which figures out
            // if light can pass through a given tile.
            let depth = z;
            map.fov.push(
                new ROT.FOV.DiscreteShadowcasting(function(x, y) {
                    return !map.getTile(x, y, depth).isBlockingLight();
                }, {topology: 4}));
        })();
    }
}

Game.Map.prototype.getFov = function(depth) {
    return this.fov[depth];
}

// Gets the tile for a given coordinate set
Game.Map.prototype.getTile = function(x, y, z) {
    // Make sure we are inside the bounds. If we aren't, return
    // null tile.
    if (x < 0 || x >= this.width || y < 0 || y >= this.height ||
        z < 0 || z >= this.depth) {
        return Game.Tile.nullTile;
    } else {
        return this.tiles[z][x][y] || Game.Tile.nullTile;
    }
};

Game.Map.prototype.dig = function(x, y, z) {
    // If the tile is diggable, update it to a floor
    if (this.getTile(x, y, z).diggableFunct()) {
        this.tiles[z][x][y] = Game.Tile.floorTile;
    }
}

Game.Map.prototype.getRandomFloorPosition = function(z) {
    // Randomly generate a tile which is a floor
    let x, y;
    do {
        x = Math.floor(Math.random() * this.width);
        y = Math.floor(Math.random() * this.height);
    } while(!this.isEmptyFloor(x, y, z));
    return {x: x, y: y, z: z};
}
Game.Map.prototype.getRandomInnFloorPosition = function(z) {
    let x, y;
    do {
        x = Math.floor(Math.random() * this.width);
        y = Math.floor(Math.random() * this.height);
    } while(!this.isInnEmptyFloor(x, y, z));
    return {x: x, y: y, z: z};
}
Game.Map.prototype.getRandomShopFloorPosition = function(z) {
    let x, y;
    do {
        x = Math.floor(Math.random() * this.width);
        y = Math.floor(Math.random() * this.height);
    } while(!this.isShopEmptyFloor(x, y, z));
    return {x: x, y: y, z: z};
}
Game.Map.prototype.getRandomBlacksmithFloorPosition = function(z) {
    let x, y;
    do {
        x = Math.floor(Math.random() * this.width);
        y = Math.floor(Math.random() * this.height);
    } while(!this.isBlacksmithEmptyFloor(x, y, z));
    return {x: x, y: y, z: z};
}


Game.Map.prototype.getEngine = function() {
    return this.engine;
}
Game.Map.prototype.getEntities = function() {
    return this.entities;
}
Game.Map.prototype.getEntityAt = function(x, y, z){
    return this.entities[x + ',' + y + ',' + z];
}

Game.Map.prototype.addEntity = function(entity) {
    // Update the entity's map
    entity.setMap(this);

    // Update the map with the entity's position
    this.updateEntityPosition(entity);

    // Check if this entity is an actor, and if so add
    // them to the scheduler
    if (entity.hasMixin('Actor')) {
       this.scheduler.add(entity, true);
    }
}

Game.Map.prototype.addEntityAtRandomPosition = function(entity, z) {
    let position = this.getRandomFloorPosition(z);
    entity.setX(position.x);
    entity.setY(position.y);
    entity.setZ(position.z);
    this.addEntity(entity);
}

Game.Map.prototype.addEntityAtRandomPositionInInn = function(entity, z) {
    let position = this.getRandomInnFloorPosition(z);
    entity.setX(position.x);
    entity.setY(position.y);
    entity.setZ(position.z);
    this.addEntity(entity);
}
Game.Map.prototype.addEntityAtRandomPositionInShop = function(entity, z) {
    let position = this.getRandomShopFloorPosition(z);
    entity.setX(position.x);
    entity.setY(position.y);
    entity.setZ(position.z);
    this.addEntity(entity);
}

Game.Map.prototype.addEntityAtRandomPositionInBlacksmithShop = function(entity, z) {
    let position = this.getRandomBlacksmithFloorPosition(z);
    entity.setX(position.x);
    entity.setY(position.y);
    entity.setZ(position.z);
    this.addEntity(entity);
}
Game.Map.prototype.addItemAtRandomPositionInShop = function(item, z) {
    let position = this.getRandomShopFloorPosition(z);
    this.addItem(position.x, position.y, position.z, item);
}
Game.Map.prototype.addItemAtRandomPositionInBlacksmithShop = function(item, z) {
    let position = this.getRandomBlacksmithFloorPosition(z);
    this.addItem(position.x, position.y, position.z, item);
}

Game.Map.prototype.addEntityAtPosition = function(entity, x, y, z) {
    entity.setX(x);
    entity.setY(y);
    entity.setZ(z);
    this.addEntity(entity);
}

Game.Map.prototype.removeEntity = function(entity) {
    // Remove the entity from the map
    let key = entity.getX() + ',' + entity.getY() + ',' + entity.getZ();
    if (this.entities[key] == entity) {
        delete this.entities[key];
    }
    // If the entity is an actor, remove them from the scheduler
    if (entity.hasMixin('Actor')) {
        this.scheduler.remove(entity);
    }
}

Game.Map.prototype.isEmptyFloor = function(x, y, z) {
    // Check if the tile is floor and also has no entity
    if (this.getTile(x, y, z) == Game.Tile.floorTile && !this.getEntityAt(x, y, z)) {
        return true;
    }
    //else if(this.getTile(x, y, z) == Game.Tile.smoothStoneTile && !this.getEntityAt(x, y, z)){
    //    return true;
    //}
    else if(this.getTile(x, y, z) == Game.Tile.buildingFloorTile && !this.getEntityAt(x, y, z)){
        return true;
    }
}

Game.Map.prototype.isInnEmptyFloor = function(x, y, z) {
    if (this.getTile(x, y, z) == Game.Tile.buildingInnFloorTile && !this.getEntityAt(x, y, z)) {
        return true;
    }
}
Game.Map.prototype.isShopEmptyFloor = function(x, y, z) {
    if (this.getTile(x, y, z) == Game.Tile.buildingShopFloorTile && !this.getEntityAt(x, y, z)) {
        return true;
    }
}
Game.Map.prototype.isBlacksmithEmptyFloor = function(x, y, z) {
    if (this.getTile(x, y, z) == Game.Tile.buildingBlacksmithFloorTile && !this.getEntityAt(x, y, z)) {
        return true;
    }
}

Game.Map.prototype.getEntitiesWithinRadius = function(centerX, centerY,
                                                      centerZ, radius) {
    results = [];
    // Determine our bounds
    let leftX = centerX - radius;
    let rightX = centerX + radius;
    let topY = centerY - radius;
    let bottomY = centerY + radius;
    // Iterate through our entities, adding any which are within the bounds
    for (let key in this.entities) {
        let entity = this.entities[key];
        if (entity.getX() >= leftX && entity.getX() <= rightX && 
            entity.getY() >= topY && entity.getY() <= bottomY &&
            entity.getZ() == centerZ) {
            results.push(entity);
        }
    }
    return results;
}

Game.Map.prototype.updateEntityPosition = function(entity, oldX, oldY, oldZ) {
    // Delete the old key if it is the same entity and we have old positions.
    if (typeof oldX === "number") {
        let oldKey = oldX + ',' + oldY + ',' + oldZ;
        if (this.entities[oldKey] == entity) {
            delete this.entities[oldKey];
        }
    }
    // Make sure the entity's position is within bounds
    if (entity.getX() < 0 || entity.getX() >= this.width ||
        entity.getY() < 0 || entity.getY() >= this.height ||
        entity.getZ() < 0 || entity.getZ() >= this.depth) {
        throw new Error("Entity's position is out of bounds.");
    }
    // Sanity check to make sure there is no entity at the new position.
    let key = entity.getX() + ',' + entity.getY() + ',' + entity.getZ();
    if (this.entities[key]) {
        throw new Error('Tried to add an entity at an occupied position.');
    }
    // Add the entity to the table of entities
    this.entities[key] = entity;
};


Game.Map.prototype.setupExploredArray = function() {
    for (let z = 0; z < this.depth; z++) {
        this.explored[z] = new Array(this.width);
        for (let x = 0; x < this.width; x++) {
            this.explored[z][x] = new Array(this.height);
            for (let y = 0; y < this.height; y++) {
                this.explored[z][x][y] = false;
            }
        }
    }
};

Game.Map.prototype.setExplored = function(x, y, z, state) {
    // Only update if the tile is within bounds
    if (this.getTile(x, y, z) !== Game.Tile.nullTile) {
        this.explored[z][x][y] = state;
    }
};

Game.Map.prototype.isExplored = function(x, y, z) {
    // Only return the value if within bounds
    if (this.getTile(x, y, z) !== Game.Tile.nullTile) {
        return this.explored[z][x][y];
    } else {
        return false;
    }
};


//items

Game.Map.prototype.getItemsAt = function(x, y, z) {
    return this.items[x + ',' + y + ',' + z];
};

Game.Map.prototype.setItemsAt = function(x, y, z, items) {
    // If our items array is empty, then delete the key from the table.
    let key = x + ',' + y + ',' + z;
    if (items.length === 0) {
        if (this.items[key]) {
            delete this.items[key];
        }
    } else {
        // Simply update the items at that key
        this.items[key] = items;
    }
};

Game.Map.prototype.addItem = function(x, y, z, item) {
    // If we already have items at that position, simply append the item to the 
    // list of items.
    let key = x + ',' + y + ',' + z;
    if (this.items[key]) {
        this.items[key].push(item);
    } else {
        this.items[key] = [item];
    }
};

Game.Map.prototype.addItemAtRandomPosition = function(item, z) {
    let position = this.getRandomFloorPosition(z);
    this.addItem(position.x, position.y, position.z, item);
};