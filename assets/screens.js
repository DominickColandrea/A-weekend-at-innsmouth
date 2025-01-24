Game.Screen = {};

// Define our initial start screen
Game.Screen.startScreen = {
    enter() {
        console.log("Entered start screen.");
        console.log("your seed is: "+Game.seed);
    },
    exit() {
        console.log("Exited start screen.");
    },
    render(display) {
        // Render our prompt to the screen
        display.drawText(5,1, "%c{"+color.lightBlue+"}A Weekend At Innsmouth", 50);
        display.drawText(1,3, "%c{"+color.white+"}You arrive at %c{"+color.red+"}Innsmouth %c{"+color.white+"}after receiving a premonition. %c{"+color.red+"}Cthulu%c{"+color.white+"} will awaken to put this planet into an unending slumber.", 30);
        display.drawText(1,10, "%c{"+color.white+"}Now you only have %c{"+color.red+"}48 hours%c{"+color.white+"} to recover the %c{"+color.red+"}Necronomicon%c{"+color.white+"} and recite the incantation to stave off his inevitable awakening for some time.", 30);
        display.drawText(1,18, "%c{"+color.white+"}Press %c{"+color.red+"}[Enter]%c{"+color.white+"} to begin");

        display.drawText(1,22, "%c{"+color.white+"}Press %c{"+color.red+"}[O]%c{"+color.white+"} for controls");
    },
    handleInput(inputType, inputData) {
        if (inputType === 'keydown') {
            if (inputData.key === "Enter") {
                Game.switchScreen(Game.Screen.playScreen);
            }
            else if (inputData.key === "o" || inputData.key === "O") {
                Game.switchScreen(Game.Screen.controlsScreen);
            }
            else if (inputData.key === "w" || inputData.key === "W") {
                Game.switchScreen(Game.Screen.winScreen);
            }
            else if (inputData.key === "l" || inputData.key === "L") {
                Game.switchScreen(Game.Screen.loseScreen);
            }
        }
    }
}

Game.Screen.controlsScreen = {
    enter() {
        console.log("Entered controls screen.");
    },
    exit() {
        console.log("Exited controls screen.");
    },
    render(display) {
        // Render our prompt to the screen
        display.drawText(1,1, "%c{"+color.lightBlue+"}Controls", 50);
        display.drawText(1,3, "%c{"+color.white+"}Move: Arrow Keys", 30);
        display.drawText(1,4, "%c{"+color.white+"}Quests: q", 30);
        display.drawText(1,5, "%c{"+color.white+"}Eat: e", 30);
        display.drawText(1,6, "%c{"+color.white+"}Equip Items: w/Shift w", 30);
        display.drawText(1,7, "%c{"+color.white+"}Drop Items: d", 30);
        display.drawText(1,8, "%c{"+color.white+"}Sleep: s", 30);
        display.drawText(1,9, "%c{"+color.white+"}Pickup: ,", 30);
        display.drawText(1,10, "%c{"+color.white+"}Ascend: <", 30);
        display.drawText(1,11, "%c{"+color.white+"}Decend: >", 30);
        display.drawText(1,12, "%c{"+color.white+"}Wait: .", 30);

        display.drawText(1,18, "%c{"+color.white+"}Press %c{"+color.red+"}[Escape]%c{"+color.white+"} to return");
    },
    handleInput(inputType, inputData) {
        if (inputType === 'keydown') {
            if (inputData.key === "Escape") {
                Game.switchScreen(Game.Screen.startScreen);
            }
        }
    }
}


// Define our playing screen
Game.Screen.playScreen = {
    map : null,
    player: null,
    gameEnded: false,
    gameWin: false,
    subScreen: null,

    setSubScreen(subScreen) {
        this.subScreen = subScreen;
        // Refresh screen on changing the subscreen
        Game.refresh();
    },

    enter() {
        
        // Create a map based on our size parameters
        //maybe change these dimensions based on seed or NPC interaction?
        let width = 100;
        let height = 48;
        let depth = 6;
        // Create our map from the tiles and player
        let tiles = new Game.Builder(width, height, depth).getTiles();

        this.player = new Game.Entity(Game.PlayerTemplate);
        this.map = new Game.Map(tiles, this.player);
        // Start the map's engine
        this.map.getEngine().start();

    },

    exit() { console.log("Exited play screen."); },

    render(display) {

        if (this.subScreen) {
            this.subScreen.render(display);
            return;
        }

        let screenWidth = Game.getScreenWidth();
        let screenHeight = Game.getScreenHeight();

        //keep it centered
        let topLeftX = Math.max(0, this.player.getX() - (screenWidth / 2));
        topLeftX = Math.min(topLeftX, this.map.getWidth() - screenWidth);
        let topLeftY = Math.max(0, this.player.getY() - (screenHeight / 2));
        topLeftY = Math.min(topLeftY, this.map.getHeight() - screenHeight);

        let visibleCells = {};
        let map = this.map;
        let currentDepth = this.player.getZ();
        // Find all visible cells and update the object
        map.getFov(currentDepth).compute(
            this.player.getX(), this.player.getY(), 
            this.player.getSightRadius(), 
            function(x, y, radius, visibility) {
                visibleCells[x + "," + y] = true;

                map.setExplored(x, y, currentDepth, true);
            });


        // Render the explored map cells
                for (let x = topLeftX; x < topLeftX + screenWidth; x++) {
                    for (let y = topLeftY; y < topLeftY + screenHeight; y++) {
                        if (map.isExplored(x, y, currentDepth)) {
                            // Fetch the glyph for the tile and render it to the screen
                            // at the offset position.
                            let glyph = this.map.getTile(x, y, currentDepth);
                            let foreground = glyph.getForeground();
                            // If we are at a cell that is in the field of vision, we need
                            // to check if there are items or entities.
                            if (visibleCells[x + ',' + y]) {
                                // Check for items first, since we want to draw entities
                                // over items.
                                let items = map.getItemsAt(x, y, currentDepth);
                                // If we have items, we want to render the top most item
                                if (items) {
                                    glyph = items[items.length - 1];
                                }
                                // Check if we have an entity at the position
                                if (map.getEntityAt(x, y, currentDepth)) {
                                    glyph = map.getEntityAt(x, y, currentDepth);
                                }
                                // Update the foreground color in case our glyph changed
                                foreground = glyph.getForeground();
                            } else {
                                // Since the tile was previously explored but is not 
                                // visible, we want to change the foreground color to
                                // dark gray.
                                foreground = '#404040';
                            }
                            display.draw(
                                x - topLeftX,
                                y - topLeftY,
                                glyph.getChar(), 
                                foreground, 
                                glyph.getBackground());
                        }
                    }
                }


         // Get the messages in the player's queue and render them
         let messages = this.player.getMessages();
         let messageY = 0;
         for (let i = 0; i < messages.length; i++) {
             // Draw each message, adding the number of lines
             messageY += display.drawText(
                 0, 
                 messageY,
                 '%c{white}%b{black}' + messages[i]
             );
         }


         // Render player HP 
         let stats = '%c{white}%b{black}';
         stats += vsprintf('HP: %d/%d ', [this.player.getHp(), this.player.getMaxHp()]);
         display.drawText(0, screenHeight, stats);

         if (Game.time.minute <10) {
            let timeUI = '%c{white}%b{black}';
            timeUI += vsprintf('Day %d   %d:%d%d %s', [Game.time.day,Game.time.hour, Game.time.minute-Game.time.minute,Game.time.minute, Game.time.cycle]);
            display.drawText(0, screenHeight+2, timeUI);
         }
         else{
            let timeUI = '%c{white}%b{black}';
            timeUI += vsprintf('Day %d   %d:%d %s', [Game.time.day, Game.time.hour, Game.time.minute, Game.time.cycle]);
            display.drawText(0, screenHeight+2, timeUI);
         }

         // Render hunger state
         let hungerState = this.player.getHungerState();
         display.drawText(0, screenHeight+1, hungerState);

         // Render tile
         let playerTile = this.player.getMap().getTile(this.player.x, this.player.y, this.player.z );
         display.drawText(screenWidth - 10, screenHeight+1, playerTile.name);

    },
    handleInput(inputType, inputData) {
        if (this.gameEnded) {
            if (inputType === 'keydown' && inputData.key === "Enter") {
                Game.switchScreen(Game.Screen.loseScreen);
            }
            // Return to make sure the user can't still play
            return;
        }
        if (this.gameWin) {
            if (inputType === 'keydown' && inputData.key === "Enter") {
                Game.switchScreen(Game.Screen.winScreen);
            }
            // Return to make sure the user can't still play
            return;
        }

        // Handle subscreen input if there is one
        if (this.subScreen) {
            this.subScreen.handleInput(inputType, inputData);
            return;
        }

        if (inputType === 'keydown') {

            // Movement
            if (inputData.key === "ArrowLeft") {
                this.move(-1, 0, 0);
            } else if (inputData.key === "ArrowRight") {
                this.move(1, 0, 0);
            } else if (inputData.key === "ArrowUp") {
                this.move(0, -1, 0);
            } else if (inputData.key === "ArrowDown") {
                this.move(0, 1, 0);
            }

            else if (inputData.key === "q") {
                    Game.Screen.questScreen.setup(this.player, this.player.getQuestList());
                    console.log(this.player.getQuestList())
                    this.setSubScreen(Game.Screen.questScreen);
                    return;
            }

            else if (inputData.key === "i") {
                    if (this.player.getItems().filter(function(x){return x;}).length === 0) {
                        // If the player has no items, send a message and don't take a turn
                        Game.sendMessage(this.player, "You are not carrying anything!");
                        Game.refresh();
                    } else {
                        // Show the inventory
                        Game.Screen.inventoryScreen.setup(this.player, this.player.getItems());
                        this.setSubScreen(Game.Screen.inventoryScreen);
                    }
                    return;
            }
            else if (inputData.key === "d") {
                    if (this.player.getItems().filter(function(x){return x;}).length === 0) {
                        // If the player has no items, send a message and don't take a turn
                        Game.sendMessage(this.player, "You have nothing to drop!");
                        Game.refresh();
                    } else {
                        // Show the drop screen
                        Game.Screen.dropScreen.setup(this.player, this.player.getItems());
                        this.setSubScreen(Game.Screen.dropScreen);
                    }

                }
                else if (inputData.key === "e") {
                    // Show the eat screen
                    if (Game.Screen.eatScreen.setup(this.player, this.player.getItems())) {
                        this.setSubScreen(Game.Screen.eatScreen);
                    } else {
                        Game.sendMessage(this.player, "You have nothing to eat!");
                        Game.refresh();
                    }

                }
                else if (inputData.key === "w") {
                    // Show the wield screen
                    this.showItemsSubScreen(Game.Screen.wieldScreen, this.player.getItems(),
                    'You have nothing to wield.');
                }
                else if (inputData.key === "W") {
                    // Show the wear screen
                    this.showItemsSubScreen(Game.Screen.wearScreen, this.player.getItems(),
                    'You have nothing to wear.');
                }
                else if (inputData.key === ",") {
                    let items = this.map.getItemsAt(this.player.getX(), this.player.getY(), this.player.getZ());
                    // If there are no items, show a message
                    if (!items) {
                        Game.sendMessage(this.player, "There is nothing here to pick up.");
                    } else if (items.length === 1) {
                        // If only one item, try to pick it up
                        let item = items[0];

                        //shopkeeper quest
                        if (item.attachedMixins.QuestReward_Shop) {

                            let triggeredText = false;

                            for (let i = this.player.questList.length - 1; i >= 0; i--) {
                                //only if you complete the quest
                                if(this.player.questList[i].name == "Debt To Pay"){
                                    if (this.player.questList[i].complete) {
                                        this.player.pickupItems([0]);
                                        Game.sendMessage(this.player, "You pick up %s.", [item.describeA()]);
                                        triggeredText = true;
                                    }
                                    else{
                                        Game.sendMessage(this.player, "This is not yours to take.");
                                        triggeredText = true;
                                    }
                                }

                                else if(i == 0 && !triggeredText){
                                    Game.sendMessage(this.player, "This is not yours to take.");
                                }

                            }

                        }

                        //blacksmith quest
                        else if (item.attachedMixins.QuestReward_Blacksmith) {

                            let triggeredText = false;

                            for (let i = this.player.questList.length - 1; i >= 0; i--) {
                                //only if you complete the quest
                                if(this.player.questList[i].name == "A Blacksmith's Life"){
                                    if (this.player.questList[i].complete) {
                                        this.player.pickupItems([0]);
                                        Game.sendMessage(this.player, "You pick up %s.", [item.describeA()]);
                                        triggeredText = true;
                                    }
                                    else{
                                        Game.sendMessage(this.player, "This is not yours to take.");
                                        triggeredText = true;
                                    }
                                }

                                else if(i == 0 && !triggeredText){
                                    Game.sendMessage(this.player, "This is not yours to take.");
                                }

                            }

                        }
                        else if (this.player.pickupItems([0])) {
                            //pickup necro
                            
                            if (item.name == "necronomicon") {
                                Game.sendMessage(this.player, "Upon picking up the necronomicon you make your way back to the surface.");
                                Game.time.trueHour+=3;
                                Game.advanceTime();
                                this.player.setPosition(50, 45, 0);
                            }
                            else if (item.attachedMixins.Collectable) {
                                Game.sendMessage(this.player, "You pick up %s.", [item.describe()]);
                            }
                            else{
                                Game.sendMessage(this.player, "You pick up %s.", [item.describeA()]);
                            }
                            
                        } else {
                            Game.sendMessage(this.player, "Your inventory is full! Nothing was picked up.");
                        }
                    } else {
                        // Show the pickup screen if there are any items
                        Game.Screen.pickupScreen.setup(this.player, items);
                        this.setSubScreen(Game.Screen.pickupScreen);
                        return;
                    }
                }
                else if (inputData.key === "s") {
                    let playerTile = this.player.getMap().getTile(this.player.x, this.player.y, this.player.z );

                    if (playerTile.bed) {
                        //only in the inn or on the bed tile

                        for (let i = this.player.questList.length - 1; i >= 0; i--) {
                            //only if you complete the quest
                            if(this.player.questList[i].name == "Lost Son" && this.player.questList[i].complete){
                             console.log("can sleep in bed");

                             Game.sendMessage(this.player, "You sleep through the night");
                             this.player.hp = this.player.maxHp;
                             this.player.modifyFullnessBy(-200);
                             Game.time.trueHour+=8;
                             Game.advanceTime();
                            }
                        }

                    }
                    else{
                        Game.sendMessage(this.player, "You are not in a bed.");
                    }

                } 
                else if (inputData.key === ".") {
                    Game.refresh();
                }

                else {
                    // Not a valid key
                    return;
                }

            // Unlock the engine
            this.map.getEngine().unlock();

        }

        else if (inputType === 'keypress') {
                   let keyChar = String.fromCharCode(inputData.charCode);
                   if (keyChar === '>') {
                        this.move(0, 0, 1);
                       
                   } else if (keyChar === '<') {
                       this.move(0, 0, -1);
                   } else {
                       // Not a valid key
                       return;
                   }
                   // Unlock the engine
                   this.map.getEngine().unlock();
               } 
    },

    showItemsSubScreen(subScreen, items, emptyMessage) {
        if (items && subScreen.setup(this.player, items) > 0) {
            this.setSubScreen(subScreen);
        } else {
            Game.sendMessage(this.player, emptyMessage);
            Game.refresh();
        }
    },

    fade(z){
        let fading;
        if (!fading) {
            fading = true;
            $("canvas").fadeOut(150, function(){
                Game.sendMessage(Game.Screen.playScreen.player, "You start your descent into Cthulu's ancient tomb");
                Game.Screen.playScreen.player.setPosition(2, 2, 1);
                Game.refresh();
                $("canvas").fadeIn(150, function () {
                    fading = false;
                });
            });
        }

    },
    move(dX, dY, dZ) {
        let newX = this.player.getX() + dX;
        let newY = this.player.getY() + dY;
        let newZ = this.player.getZ() + dZ;
        // Try to move to the new cell
        this.player.tryMove(newX, newY, newZ, this.map);
    },

    setGameEnded(gameEnded) {
        this.gameEnded = gameEnded;
    },
    setGameWin(gameWin) {
        this.gameWin = gameWin;
    }
}


Game.Screen.QuestListScreen = function(template) {
    this.caption = template['caption'];
};

Game.Screen.QuestListScreen.prototype.setup = function(player, quests) {
    this.player = player;
    let count = 0;
    // Should be called before switching to the screen.
    let that = this;
    // Clean set of selected indices
    this.selectedIndices = {};
    return count;
};
Game.Screen.QuestListScreen.prototype.render = function(display) {
    // Render the caption in the top row
    display.drawText(0, 0, this.caption);
    let row = 0;
    for (let i = 0; i < this.player.questList.length; i++) {

        if (this.player.questList[i]) {
            let prefix = '-';
            let suffix = '-';
            if (this.player.questList[i].complete) {
                prefix = "+";
                suffix = '+';
            }
            // Render at the correct row and add 2.
            display.drawText(0, 2 + row, prefix + this.player.questList[i].name + suffix);
            row++;
        }
    }
};

Game.Screen.QuestListScreen.prototype.handleInput = function(inputType, inputData) {
    if (inputType === 'keydown') {
        // If the user hit escape, hit enter and can't select an item, or hit
        // enter without any items selected, simply cancel out
        if (inputData.key === "Escape" || 
            (inputData.key === "Enter" && 
                (!this.canSelectItem || Object.keys(this.selectedIndices).length === 0))) {
            Game.Screen.playScreen.setSubScreen(undefined);
        // Handle pressing return when items are selected
        } else if (inputData.key === "Enter") {
            this.executeOkFunction();
        } 
        // Handle pressing zero when 'no item' selection is enabled
        else if (this.canSelectItem && this.hasNoItemOption && inputData.key === "0") {
                   this.selectedIndices = {};
                   this.executeOkFunction();
        }
        // Handle pressing a letter if we can select
        else if (this.canSelectItem && inputData.key >= "a" &&
            inputData.key <= "z") {
            
            //this is the correct formula for letter -> base 0 number
            let index = inputData.key.charCodeAt(0) - 97;

            if (this.items[index]) {
                // If multiple selection is allowed, toggle the selection status, else
                // select the item and exit the screen
                if (this.canSelectMultipleItems) {
                    if (this.selectedIndices[index]) {
                        delete this.selectedIndices[index];
                    } else {
                        this.selectedIndices[index] = true;
                    }
                    // Redraw screen
                    Game.refresh();
                } else {
                    this.selectedIndices[index] = true;
                    this.executeOkFunction();
                }
            }
        }
    }
};

Game.Screen.questScreen = new Game.Screen.QuestListScreen({
    caption: 'Quests',
    canSelect: false
});


Game.Screen.ItemListScreen = function(template) {
    // Set up based on the template
    this.caption = template['caption'];
    this.okFunction = template['ok'];

    this.isAcceptableFunction = template['isAcceptable'] || function(x) {
        return x;
    }

    // Whether the user can select items at all.
    this.canSelectItem = template['canSelect'];
    // Whether the user can select multiple items.
    this.canSelectMultipleItems = template['canSelectMultipleItems'];
    // Whether a 'no item' option should appear.
    this.hasNoItemOption = template['hasNoItemOption']
};

Game.Screen.ItemListScreen.prototype.setup = function(player, items) {
    this.player = player;
    let count = 0;
    // Should be called before switching to the screen.
    let that = this;
    this.items = items.map(function(item) {
        // Transform the item into null if it's not acceptable
        if (that.isAcceptableFunction(item)) {
            count++;
            return item;
        } else {
            return null;
        }
    });
    // Clean set of selected indices
    this.selectedIndices = {};
    return count;
};

Game.Screen.ItemListScreen.prototype.executeOkFunction = function() {
    // Gather the selected items.
    let selectedItems = {};
    for (let key in this.selectedIndices) {
        selectedItems[key] = this.items[key];
    }
    // Switch back to the play screen.
    Game.Screen.playScreen.setSubScreen(undefined);
    // Call the OK function and end the player's turn if it return true.
    if (this.okFunction(selectedItems)) {
        this.player.getMap().getEngine().unlock();
    }
};
Game.Screen.ItemListScreen.prototype.handleInput = function(inputType, inputData) {
    if (inputType === 'keydown') {
        // If the user hit escape, hit enter and can't select an item, or hit
        // enter without any items selected, simply cancel out
        if (inputData.key === "Escape" || 
            (inputData.key === "Enter" && 
                (!this.canSelectItem || Object.keys(this.selectedIndices).length === 0))) {
            Game.Screen.playScreen.setSubScreen(undefined);
        // Handle pressing return when items are selected
        } else if (inputData.key === "Enter") {
            this.executeOkFunction();
        } 
        // Handle pressing zero when 'no item' selection is enabled
        else if (this.canSelectItem && this.hasNoItemOption && inputData.key === "0") {
                   this.selectedIndices = {};
                   this.executeOkFunction();
        }
        // Handle pressing a letter if we can select
        else if (this.canSelectItem && inputData.key >= "a" &&
            inputData.key <= "z") {
            
            //this is the correct formula for letter -> base 0 number
            let index = inputData.key.charCodeAt(0) - 97;

            if (this.items[index]) {
                // If multiple selection is allowed, toggle the selection status, else
                // select the item and exit the screen
                if (this.canSelectMultipleItems) {
                    if (this.selectedIndices[index]) {
                        delete this.selectedIndices[index];
                    } else {
                        this.selectedIndices[index] = true;
                    }
                    // Redraw screen
                    Game.refresh();
                } else {
                    this.selectedIndices[index] = true;
                    this.executeOkFunction();
                }
            }
        }
    }
};

Game.Screen.ItemListScreen.prototype.render = function(display) {
    let letters = 'abcdefghijklmnopqrstuvwxyz';
    // Render the caption in the top row
    display.drawText(0, 0, this.caption);
    if (this.hasNoItemOption) {
        display.drawText(0, 1, '0 - no item');
    }
    let row = 0;
    for (let i = 0; i < this.items.length; i++) {
        // If we have an item, we want to render it.
        if (this.items[i]) {
            // Get the letter matching the item's index
            let letter = letters.substring(i, i + 1);
            // If we have selected an item, show a +, else show a dash between
            // the letter and the item's name.
            let selectionState = (this.canSelectItem && this.canSelectMultipleItems &&
                this.selectedIndices[i]) ? '+' : '-';
            // Check if the item is worn or wielded
            let suffix = '';
            if (this.items[i] === this.player.getArmor()) {
                suffix = ' [on]';
            }
            else if (this.items[i] === this.player.getWeapon()) {
                suffix = ' [on]';
            }

            // Show Attack or Defense value
            let attackVal = '';
            let defenseVal = '';
            console.log(this.items[i])
            if (this.items[i].attackValue) {
                attackVal = ' ATT:'+this.items[i].attackValue;
            }
            if (this.items[i].defenseValue) {
                defenseVal = ' DEF:'+this.items[i].defenseValue;
            }
            // Render at the correct row and add 2.
            display.drawText(0, 2 + row, letter + ' ' + selectionState + this.items[i].describe() +" | "+ attackVal + defenseVal + suffix);
            row++;
        }
    }
};


Game.Screen.inventoryScreen = new Game.Screen.ItemListScreen({
    caption: 'Inventory',
    canSelect: false
});

Game.Screen.pickupScreen = new Game.Screen.ItemListScreen({
    caption: 'What items will you pickup?',
    canSelect: true,
    canSelectMultipleItems: true,
    ok(selectedItems) {
        // Try to pick up all items, messaging the player if they couldn't all be
        // picked up.
        if (!this.player.pickupItems(Object.keys(selectedItems))) {
            Game.sendMessage(this.player, "Your inventory is full! Not all items were picked up.");
        }
        return true;
    }
});

Game.Screen.dropScreen = new Game.Screen.ItemListScreen({
    caption: 'What item will you drop?',
    canSelect: true,
    canSelectMultipleItems: false,
    ok(selectedItems) {
        // Drop the selected item
        this.player.dropItem(Object.keys(selectedItems)[0]);
        return true;
    }
});

Game.Screen.eatScreen = new Game.Screen.ItemListScreen({
    caption: 'What item will you eat?',
    canSelect: true,
    canSelectMultipleItems: false,
    isAcceptable(item) {
        return item && item.hasMixin('Edible');
    },
    ok(selectedItems) {
        // Eat the item, removing it if there are no consumptions remaining.
        let key = Object.keys(selectedItems)[0];
        let item = selectedItems[key];
        Game.sendMessage(this.player, "You eat %s.", [item.describeThe()]);
        item.eat(this.player);
        if (!item.hasRemainingConsumptions()) {
            this.player.removeItem(key);
        }
        return true;
    }
});

Game.Screen.wieldScreen = new Game.Screen.ItemListScreen({
    caption: 'What item will you wield?',
    canSelect: true,
    canSelectMultipleItems: false,
    hasNoItemOption: true,
    isAcceptable(item) {
        return item && item.hasMixin('Equippable') && item.isWieldable();
    },
    ok(selectedItems) {
        // Check if we selected 'no item'
        let keys = Object.keys(selectedItems);
        if (keys.length === 0) {
            this.player.unwield();
            Game.sendMessage(this.player, "You are empty handed.")
        } else {
            // Make sure to unequip the item first in case it is the armor.
            let item = selectedItems[keys[0]];
            this.player.unequip(item);
            this.player.wield(item);
            Game.sendMessage(this.player, "You are wielding %s.", [item.describeA()]);
        }
        return true;
    }
});

Game.Screen.wearScreen = new Game.Screen.ItemListScreen({
    caption: 'What item will you wear?',
    canSelect: true,
    canSelectMultipleItems: false,
    hasNoItemOption: true,
    isAcceptable(item) {
        return item && item.hasMixin('Equippable') && item.isWearable();
    },
    ok(selectedItems) {
        // Check if we selected 'no item'
        let keys = Object.keys(selectedItems);
        if (keys.length === 0) {
            this.player.unwield();
            Game.sendMessage(this.player, "You are not wearing anthing.")
        } else {
            // Make sure to unequip the item first in case it is the weapon.
            let item = selectedItems[keys[0]];
            this.player.unequip(item);
            this.player.wear(item);
            Game.sendMessage(this.player, "You are wearing %s.", [item.describeA()]);
        }
        return true;
    }
});

// Define our winning screen
Game.Screen.winScreen = {
    enter() {    console.log("Entered win screen."); },
    exit() { console.log("Exited win screen."); },
    render(display) {
       // Render our prompt to the screen
       display.drawText(1,1, "%c{"+color.white+"}You hand over the %c{"+color.red+"}Necronomicon %c{"+color.white+"} and the Scholar's eyes light up.", 30);
       display.drawText(1,5, '%c{'+color.white+'}"Ah, you have done a great service to %c{'+color.red+'}Innsmouth. %c{'+color.white+'}We will finally know peace from the threat of an eternal slumber."', 30);
       display.drawText(1,10, "%c{"+color.white+"}Upon leaving the Scholar's house you collapse from a piercing migraine. %c{"+color.red+"}Cthulu %c{"+color.white+"}still whispers into your mind. It's awakening has been stalled, but you wonder for how long?", 30);
       display.drawText(1,19, "%c{"+color.red+"}Game Over", 30);
    },
    handleInput(inputType, inputData) {

    }
}

// Define our winning screen
Game.Screen.loseScreen = {
    enter() {    console.log("Entered lose screen."); },
    exit() { console.log("Exited lose screen."); },
    render(display) {
        let i = 2;
        display.drawText(1,1, "%c{"+color.red+"}Cthulu %c{"+color.white+"}has returned...", 30);
        let interval = setInterval(function(){
            display.drawText(1,i, "%c{"+color.red+"}Game Over", 100);
        },1000);


    },
    handleInput(inputType, inputData) {

    }
}