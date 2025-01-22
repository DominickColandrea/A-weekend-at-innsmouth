Game.EntityMixins = {};


Game.EntityMixins.Sight = {
    name: 'Sight',
    groupName: 'Sight',
    init(template) {
        this.sightRadius = template['sightRadius'] || 5;
    },
    getSightRadius() {
        return this.sightRadius;
    },
    canSee(entity) {
            // If not on the same map or on different floors, then exit early
            if (!entity || this.map !== entity.getMap() || this.z !== entity.getZ()) {
                return false;
            }

            let otherX = entity.getX();
            let otherY = entity.getY();

            // If we're not in a square field of view, then we won't be in a real
            // field of view either.
            if ((otherX - this.x) * (otherX - this.x) +
                (otherY - this.y) * (otherY - this.y) >
                this.sightRadius * this.sightRadius) {
                return false;
            }

            // Compute the FOV and check if the coordinates are in there.
            let found = false;
            this.getMap().getFov(this.getZ()).compute(
                this.getX(), this.getY(), 
                this.getSightRadius(), 
                function(x, y, radius, visibility) {
                    if (x === otherX && y === otherY) {
                        found = true;
                    }
                });
            console.log(this +" " +found)
            return found;
        }
}


Game.EntityMixins.PlayerActor = {
    name: 'PlayerActor',
    groupName: 'Actor',

    act(){
        if (this.acting) {
            return;
        }
        this.acting = true;
        this.addTurnHunger();

        if (!this.isAlive()) {
            Game.Screen.playScreen.setGameEnded(true);
            // Send a last message to the player
            Game.sendMessage(this, 'Press [Enter] to continue');
        }

        Game.refresh();
        this.getMap().getEngine().lock();
        this.clearMessages();

        this.acting = false;
    }
}

Game.EntityMixins.TownActor = {
    name: 'TownActor',
    groupName: 'Actor',
    init(template) {
        this.name = template['name'] || "Citizen";

        this.dialogue = template['dialogue'] || function(player) {
            Game.sendMessage(player, this.name+":");
           Game.sendMessage(player, 'Hello');
        };
    },
    act() {

    }
}

Game.EntityMixins.CitizenActor = {
    name: 'CitizenActor',
    groupName: 'Actor',
    init(template) {
        this.name = template['name'] || "Citizen";

        this.dialogue = template['dialogue'] || function(player) {
            Game.sendMessage(player, this.name+":");
           Game.sendMessage(player, 'Hello');
        };
    },
    act() {
        //maybe refactor this to run off the game scheduler

        //run action every "minute"
        if (Game.counter == 2) {
            //either add in pathfinding (A*?) and or add this to the citizen template so innkeepers dont move?
            //maybe give inkeepers their own movement code?

            // Flip coin to determine if moving by 1 in the positive or negative direction
            let moveOffset = (Math.round(Math.random()) === 1) ? 1 : -1;
            // Flip coin to determine if moving in x direction or y direction
            if (Math.round(Math.random()) === 1) {
                this.tryMove(this.getX() + moveOffset, this.getY(), this.getZ());
            } else {
                this.tryMove(this.getX(), this.getY() + moveOffset, this.getZ());
            }
        }
    }
}
Game.EntityMixins.QuestGiver = {
    name: 'QuestGiver',
    groupName: 'Actor',
    init(template) {
        this.quest = template['quest'] || true;
        this.questTrigger = template['questTrigger'] || false;
        this.questStarted = template['questStarted'] || false;
        this.questComplete = template['questComplete'] || false;
    }
}

Game.EntityMixins.QuestReciever = {
    name: 'QuestReciever',
    groupName: 'Actor',
    init(template) {
        this.questList = [];
    },
    addQuest(questName){
        console.log(this)
        this.questOptions = new Object;
        this.questOptions.name = questName;
        this.questOptions.complete = false;
        this.questList.push(this.questOptions);
    },
    getQuestList(){
        return this.questList;
    },
    completeQuest(questName){

        for (let i = 0; i < this.questList.length; i++) {
            if (this.questList[i].name == questName) {
                this.questList[i].complete = true;
            }
        }
    }
}

Game.EntityMixins.FungusActor = {
    name: 'FungusActor',
    groupName: 'Actor',

    act(){

    }
}


Game.EntityMixins.Attacker = {
    name: 'Attacker',
    groupName: 'Attacker',
    init(template) {
        this.attackValue = template['attackValue'] || 1;
    },
    getAttackValue() {
        let modifier = 0;

        if (this.hasMixin(Game.EntityMixins.Equipper)) {
            if (this.getWeapon()) {
                modifier += this.getWeapon().getAttackValue();
            }
            if (this.getArmor()) {
                modifier += this.getArmor().getAttackValue();
            }
        }
        return this.attackValue + modifier;
    },
    attack(target) {
        console.log(target)
        if (target.attachedMixins.Destructible) {
            let attack = this.getAttackValue();
            let defense = target.getDefenseValue();
            let max = Math.max(0, attack - defense);
            let damage = (this, 1 + Math.floor(Math.random() * max));

            Game.sendMessage(this, 'You strike the %s for %d damage!', 
                [target.getName(), damage]);
            Game.sendMessage(target, 'The %s strikes you for %d damage!', 
                [this.getName(), damage]);

            target.takeDamage(this, damage);
        }
    }
}

Game.EntityMixins.Destructible = {
    name: 'Destructible',
    init(template) {
        this.maxHp = template['maxHp'] || 10;
        this.hp = template['hp'] || this.maxHp;
        this.defenseValue = template['defenseValue'] || 0;
    },
    getHp() {
        return this.hp;
    },
    getMaxHp() {
        return this.maxHp;
    },
    getDefenseValue() {
        let modifier = 0;

        if (this.hasMixin(Game.EntityMixins.Equipper)) {
            if (this.getWeapon()) {
                modifier += this.getWeapon().getDefenseValue();
            }
            if (this.getArmor()) {
                modifier += this.getArmor().getDefenseValue();
            }
        }
        return this.defenseValue + modifier;
    },
    takeDamage(attacker, damage) {
        this.hp -= damage;
        if (this.hp <= 0) {
            //probs add a die mixin to add drops and/or death effects
            Game.sendMessage(attacker, 'You kill the %s!', [this.getName()]);
            if (this.hasMixin(Game.EntityMixins.CorpseDropper)) {
                this.tryDropCorpse();
            }
            if (this.hasMixin(Game.EntityMixins.GoldDropper)) {
                this.tryDropGold();
            }
            this.kill();
        }
    }
}

Game.EntityMixins.MessageRecipient = {
    name: 'MessageRecipient',
    init(template) {
        this.messages = [];
    },
    receiveMessage(message) {
        this.messages.push(message);
        //if (this.messages.length >= 5) {
        //    this.messages.shift();
        //}
    },
    getMessages() {
        return this.messages;
    },
    clearMessages() {
        this.messages = [];
    }
}


Game.EntityMixins.InventoryHolder = {
    name: 'InventoryHolder',
    init(template) {
        // Default to 10 inventory slots.
        let inventorySlots = template['inventorySlots'] || 10;
        // Set up an empty inventory.
        this.items = new Array(inventorySlots);
    },
    getItems() {
        return this.items;
    },
    getItem(i) {
        return this.items[i];
    },
    addItem(item) {
        // Try to find a slot, returning true only if we could add the item.
        for (let i = 0; i < this.items.length; i++) {
            //add collectables together
            if (item.attachedMixins.Collectable && this.items[i]
                && this.items[i].attachedMixins.Collectable) {
                this.items[i].value += item.value;
                return true;
            }
            else if (!this.items[i]) {
                this.items[i] = item;
                return true;
            }
        }
        return false;
    },
    removeItem(i) {
        if (this.items[i] && this.hasMixin(Game.EntityMixins.Equipper)) {
            this.unequip(this.items[i]);
        }
        // Simply clear the inventory slot.
        this.items[i] = null;
    },
    canAddItem() {
        // Check if we have an empty slot.
        for (let i = 0; i < this.items.length; i++) {
            if (!this.items[i]) {
                return true;
            }
        }
        return false;
    },
    pickupItems(indices) {
        // Allows the user to pick up items from the map, where indices is
        // the indices for the array returned by map.getItemsAt
        let mapItems = this.map.getItemsAt(this.getX(), this.getY(), this.getZ());
        let added = 0;
        // Iterate through all indices.
        for (let i = 0; i < indices.length; i++) {
            // Try to add the item. If our inventory is not full, then splice the 
            // item out of the list of items. In order to fetch the right item, we
            // have to offset the number of items already added.
            if (this.addItem(mapItems[indices[i]  - added])) {
                mapItems.splice(indices[i] - added, 1);
                added++;
            } else {
                // Inventory is full
                break;
            }
        }
        // Update the map items
        this.map.setItemsAt(this.getX(), this.getY(), this.getZ(), mapItems);
        // Return true only if we added all items
        return added === indices.length;
    },
    dropItem(i) {
        // Drops an item to the current map tile
        if (this.items[i]) {
            if (this.map) {
                this.map.addItem(this.getX(), this.getY(), this.getZ(), this.items[i]);
            }
            this.removeItem(i);      
        }
    }
};

Game.EntityMixins.TaskActor = {
    name: 'TaskActor',
    groupName: 'Actor',
    init(template) {
        // Load tasks
        this.tasks = template['tasks'] || ['wander']; 
    },
    act() {
        // Iterate through all our tasks
        for (let i = 0; i < this.tasks.length; i++) {
            if (this.canDoTask(this.tasks[i])) {
                // If we can perform the task, execute the function for it.
                this[this.tasks[i]]();
                return;
            }
        }
    },
    canDoTask(task) {
        if (task === 'hunt') {
            return this.hasMixin('Sight') && this.canSee(this.getMap().getPlayer());
        } else if (task === 'wander') {
            return true;
        } else {
            throw new Error('Tried to perform undefined task ' + task);
        }
    },
    hunt() {
        let player = this.getMap().getPlayer();

        // If we are adjacent to the player, then attack instead of hunting.
        let offsets = Math.abs(player.getX() - this.getX()) + 
            Math.abs(player.getY() - this.getY());
        if (offsets === 1) {
            if (this.hasMixin('Attacker')) {
                this.attack(player);
                return;
            }
        }

        // Generate the path and move to the first tile.
        let source = this;
        let z = source.getZ();
        let path = new ROT.Path.AStar(player.getX(), player.getY(), function(x, y) {
            // If an entity is present at the tile, can't move there.
            let entity = source.getMap().getEntityAt(x, y, z);
            if (entity && entity !== player && entity !== source) {
                return false;
            }
            return source.getMap().getTile(x, y, z).walkableFunct();
        }, {topology: 4});
        // Once we've gotten the path, we want to move to the second cell that is
        // passed in the callback (the first is the entity's strting point)
        let count = 0;
        path.compute(source.getX(), source.getY(), function(x, y) {
            if (count == 1) {
                source.tryMove(x, y, z);
            }
            count++;
        });
    },
    wander() {
        // Flip coin to determine if moving by 1 in the positive or negative direction
        let moveOffset = (Math.round(Math.random()) === 1) ? 1 : -1;
        // Flip coin to determine if moving in x direction or y direction
        if (Math.round(Math.random()) === 1) {
            this.tryMove(this.getX() + moveOffset, this.getY(), this.getZ());
        } else {
            this.tryMove(this.getX(), this.getY() + moveOffset, this.getZ());
        }
    }
};

Game.EntityMixins.FoodConsumer = {
    name: 'FoodConsumer',
    init(template) {
        this.maxFullness = template['maxFullness'] || 2000;
        // Start halfway to max fullness if no default value
        this.fullness = template['fullness'] || (this.maxFullness / 2);
        // Number of points to decrease fullness by every turn.
        this.fullnessDepletionRate = template['fullnessDepletionRate'] || 1;
    },
    addTurnHunger() {
        // Remove the standard depletion points
        this.modifyFullnessBy(-this.fullnessDepletionRate);
    },
    modifyFullnessBy(points) {
        this.fullness = this.fullness + points;
        if (this.fullness <= 0) {
            //this.kill("You have died of starvation!");
            this.hp--;
            if (this.hp <= 0) {
                this.kill("You have died of starvation");
            }
        } else if (this.fullness > this.maxFullness) {
            this.kill("You choke and die!");
        }
    },
    getHungerState() {
        let perPercent = this.maxFullness / 100;
        if (this.fullness <= 0) {
            return 'Dying';
        }
        else if (this.fullness <= perPercent * 5) {
            return 'Starving';
        }
        else if (this.fullness <= perPercent * 25) {
            return 'Hungry';
        }
        else if (this.fullness >= perPercent * 95) {
            return 'Oversatiated';
        }
        else if (this.fullness >= perPercent * 75) {
            return 'Full';
        }
        else {
            return 'Not Hungry';
        }
    }
};

Game.EntityMixins.CorpseDropper = {
    name: 'CorpseDropper',
    init(template) {
        // Chance of dropping a cropse (out of 100).
        this.corpseDropRate = template['corpseDropRate'] || 100;
    },
    tryDropCorpse() {
        if (Math.round(Math.random() * 100) < this.corpseDropRate) {
            // Create a new corpse item and drop it.
            this.map.addItem(this.getX(), this.getY(), this.getZ(),
                Game.ItemRepository.create('corpse', {
                    name: this.name + ' corpse',
                    foreground: this.foreground
                }));
        }
    }
};

Game.EntityMixins.GoldDropper = {
    name: 'GoldDropper',
    init(template) {
        // Chance of dropping a cropse (out of 100).
        this.goldDropRate = template['goldDropRate'] || 100;
        this.goldDropAmount = template['goldDropAmount'] || 1;
    },
    tryDropGold() {
        if (Math.round(Math.random() * 100) < this.corpseDropRate) {
            // Create a new corpse item and drop it.
            this.map.addItem(this.getX(), this.getY(), this.getZ(),
                Game.ItemRepository.create('gold', {
                    value: this.goldDropAmount,
                }));
        }
    }
};

Game.EntityMixins.Equipper = {
    name: 'Equipper',
    init(template) {
        this.weapon = null;
        this.armor = null;
    },
    wield(item) {
        this.weapon = item;
    },
    unwield() {
        this.weapon = null;
    },
    wear(item) {
        this.armor = item;
    },
    takeOff() {
        this.armor = null;
    },
    getWeapon() {
        return this.weapon;
    },
    getArmor() {
        return this.armor;
    },
    unequip(item) {
        // Helper function to be called before getting rid of an item.
        if (this.weapon === item) {
            this.unwield();
        }
        if (this.armor === item) {
            this.takeOff();
        }
    }
};


Game.EntityMixins.BossMob = {
    name: 'BossMob'
};