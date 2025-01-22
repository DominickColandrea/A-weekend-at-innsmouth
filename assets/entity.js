Game.Entity = function(properties) {
    properties = properties || {};
    // Call the glyph's construtor with our set of properties
    Game.DynamicGlyph.call(this, properties);
    // Instantiate any properties from the passed object
    this.name = properties['name'] || '';
    this.x = properties['x'] || 0;
    this.y = properties['y'] || 0;
    this.z = properties['z'] || 0;
    this.map = null;
    this.speed = properties['speed'] || 1000;
    this.alive = true;
    // Create an object which will keep track what mixins we have
    // attached to this entity based on the name property
    this.attachedMixins = {};
    this.attachedMixinGroups = {};
    // Setup the object's mixins
    let mixins = properties['mixins'] || [];
    for (let i = 0; i < mixins.length; i++) {
        for (let key in mixins[i]) {
            if (key != 'init' && key != 'name' && !this.hasOwnProperty(key)) {
                this[key] = mixins[i][key];
            }
        }
        // Add the name of this mixin to our attached mixins
        this.attachedMixins[mixins[i].name] = true;
        if (mixins[i].groupName) {
            this.attachedMixinGroups[mixins[i].groupName] = true;
        }
        // Finally call the init function if there is one
        if (mixins[i].init) {
            mixins[i].init.call(this, properties);
        }
    }
}
// Make entities inherit all the functionality from glyphs
Game.Entity.extend(Game.DynamicGlyph);


Game.Entity.prototype.setX = function(x) {
    this.x = x;
}
Game.Entity.prototype.setY = function(y) {
    this.y = y;
}
Game.Entity.prototype.setZ = function(z) {
    this.z = z;
}
Game.Entity.prototype.setPosition = function(x, y, z) {
    let oldX = this.x;
    let oldY = this.y;
    let oldZ = this.z;

    this.x = x;
    this.y = y;
    this.z = z;

    // If the entity is on a map, notify the map that the entity has moved.
    if (this.map) {
        this.map.updateEntityPosition(this, oldX, oldY, oldZ);
    }
}
Game.Entity.prototype.getX = function() {
    return this.x;
}
Game.Entity.prototype.getY = function() {
    return this.y;
}
Game.Entity.prototype.getZ = function() {
    return this.z;
}

Game.Entity.prototype.setMap = function(map) {
    this.map = map;
}
Game.Entity.prototype.getMap = function() {
    return this.map;
}

Game.Entity.prototype.setSpeed = function(speed) {
    this.speed = speed;
};

Game.Entity.prototype.getSpeed = function() {
    return this.speed;
};

Game.Entity.prototype.isAlive = function() {
    return this.alive;
};
Game.Entity.prototype.kill = function(message) {
    // Only kill once!
    if (!this.alive) {
        return;
    }
    this.alive = false;
    if (message) {
        Game.sendMessage(this, message);
    } else {
        Game.sendMessage(this, "You have died!");
    }

    // Check if the player died, and if so call their act method to prompt the user.
    if (this.hasMixin(Game.EntityMixins.PlayerActor)) {
        this.act();
    } else {
        this.getMap().removeEntity(this);
    }
};


Game.Entity.prototype.tryMove = function (x, y, z, map) {
    //might have to add actor spesific code here or move it to another mixin?
    
        map = this.getMap();
        // Must use starting z
        let tile = map.getTile(x, y, this.getZ());
        let target = map.getEntityAt(x, y, this.getZ());
        // If our z level changed, check if we are on stair
        if (z < this.getZ()) {
            if (tile != Game.Tile.stairsUpTile) {
                Game.sendMessage(this, "You can't go up here!");
            } else {
                if(z == 0){
                    Game.sendMessage(this, "You emerge somewhere back in town.");
                    let newFloor = map.getRandomFloorPosition(z);
                    this.setPosition(newFloor.x, newFloor.y, z);
                }
                else{
                    Game.sendMessage(this, "You ascend to level %d!", [z]);
                    this.setPosition(x, y, z);
                }
                
            }
        }
        else if (z > this.getZ()) {
            if (tile != Game.Tile.stairsDownTile) {
                Game.sendMessage(this, "You can't go down here!");
            } else {
                if (this.getZ() == 0) {
                    Game.Screen.playScreen.fade();
                }
                else if (z == 4) {
                    Game.sendMessage(this, "The air is heavy here...");
                    this.setPosition(x, y, z);
                }
                else if (z == 6) {
                    Game.sendMessage(this, "You feel a powerful force");
                    this.setPosition(x, y, z);
                }
                else{
                    Game.sendMessage(this, "You descend to level %d!", [z]);
                    this.setPosition(x, y, z);
                }

            }
        
        }
        // If an entity was present at the tile
        else if (target) {
            if (target.attachedMixins.TownActor && this.hasMixin(Game.EntityMixins.PlayerActor)) {
                console.log("target ",target);
                target.dialogue(this);
            }
            // If we are an attacker, try to attack
            // the target
            else if (this.hasMixin('Attacker') && 
                (this.hasMixin(Game.EntityMixins.PlayerActor) ||
                 target.hasMixin(Game.EntityMixins.PlayerActor))) {
                        
                        this.attack(target);
                        return true;
            }
            else {
                // If not nothing we can do, but we can't 
                // move to the tile
                return false;
            }
        // Check if we can walk on the tile
        // and if so simply walk onto it
        }
        else if (tile.walkableFunct()) {
            // Update the entity's position

            //might have to put the animation here as the alpha shows a phantom behind it
            this.setPosition(x, y, z);

            // Notify the entity that there are items at this position
            let items = this.getMap().getItemsAt(x, y, z);
            if (items) {
                if (items.length === 1) {
                    if (items[0].attachedMixins.Collectable){
                        Game.sendMessage(this, "You see %s.", [items[0].describe()]);
                    }
                    else{
                        Game.sendMessage(this, "You see %s.", [items[0].describeA()]);
                    }
                    
                } else {
                    Game.sendMessage(this, "There are several objects here.");
                }
            }
            

            return true;
        } 
        else if (tile.diggableFunct()) {
            Game.sendMessage(this, "You push through the illusory wall.");
            map.dig(x, y, z);
            return true;
        }
        return false;
}