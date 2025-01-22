const lerp = (x, y, a) => x * (1 - a) + y * a;

// Player template
Game.PlayerTemplate = {
    character: '@',
    foreground: 'white',
    maxHp: 10,
    attackValue: 10,
    sightRadius: 50,
    inventorySlots: 22,
    mixins: [Game.EntityMixins.PlayerActor,
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
             Game.EntityMixins.MessageRecipient, Game.EntityMixins.Sight,
             Game.EntityMixins.InventoryHolder, Game.EntityMixins.FoodConsumer,
             Game.EntityMixins.Equipper, Game.EntityMixins.QuestReciever]
}



// Create our central entity repository
Game.EntityRepository = new Game.Repository('entities', Game.Entity);

//npcs

//Quest: Lost son
//reward: can use inn for free
Game.EntityRepository.define('innkeeper',{
    name: "Innkeeper",
    character: 'I',
    foreground: color.purple,
    quest: "Lost Son",
    dialogue(player){

        //check lost son quest
        items = player.getItems();
        for (let i = player.getItems().length - 1; i >= 0; i--) {
            if (items[i]) {   
                if(items[i].name == "lost son"){
                 this.questTrigger = true;
                }
            }
        }

        Game.sendMessage(player, this.name+":");
        if (!this.questStarted && !this.questComplete) {
            Game.sendMessage(player, 'Will you please help me find my son? He went missing this morning.');
            this.questStarted = true;
            player.addQuest(this.quest);
        }
        else if (!this.questComplete && this.questStarted && this.questTrigger) {
            Game.sendMessage(player, "My son! you're a true hero. Please use my inn whenever you need.");
            player.completeQuest(this.quest);
        }
        else if (!this.questComplete && this.questStarted) {
            Game.sendMessage(player, 'Have you found my son?');
        }
        else if(this.questComplete){
            Game.sendMessage(player, 'Thank you so much! Feel free to use my Inn anytime!');
        }
    },
    mixins: [Game.EntityMixins.TownActor, Game.EntityMixins.QuestGiver]
});

//Quest: Pay off dead mans debt
//reward: gives you free food?
Game.EntityRepository.define('shopkeeper',{
    name: "Shopkeeper",
    character: 'S',
    foreground: color.yellow,
    quest: "Debt To Pay",
    dialogue(player){
        Game.sendMessage(player, this.name+":");

        items = player.getItems();
        for (let i = player.getItems().length - 1; i >= 0; i--) {
            if (items[i]) {   
                if(items[i].name == "gold" && items[i].value >= 10){
                 items[i].value -= 10;
                 if (items[i].value <= 0) {
                    items[i] = null;
                 }
                 this.questTrigger = true;
                }
            }
        }

        if (!this.questComplete && !this.questStarted) {
            Game.sendMessage(player, 'That idiot went and died with a 10 gold debt! If you pay it off I will make it worth your while.');
            this.questStarted = true;
            player.addQuest(this.quest);
        }
        else if (!this.questComplete && this.questTrigger){
            Game.sendMessage(player, 'Great, now him and I are even. You can have what you need from my store.');
            player.completeQuest(this.quest);
        }
        else if (!this.questComplete && this.questStarted) {
            Game.sendMessage(player, 'I need that 10 gold!');
        }
        else if(this.questComplete){
            Game.sendMessage(player, 'Have you taken enough?');
        }
    },
    mixins: [Game.EntityMixins.TownActor, Game.EntityMixins.QuestGiver]
});

//Quest: Bring him a cutlass
//reward: gives you BIS item?
Game.EntityRepository.define('blacksmith',{
    name: "Blacksmith",
    character: 'B',
    foreground: color.grey,
    quest: "A Blacksmith's Life",
    dialogue(player){

        //check blacksmith quest
        items = player.getItems();
        for (let i = player.getItems().length - 1; i >= 0; i--) {
            if (items[i]) {   
                if(items[i].name == "cutlass"){
                 this.questTrigger = true;
                }
            }
        }

        Game.sendMessage(player, this.name+":");
        if (!this.questComplete && !this.questStarted) {
            Game.sendMessage(player, 'My work has been getting shabby. Bring me a curved blade to inspire me.');
            this.questStarted = true;
            player.addQuest(this.quest);
        }
        else if (!this.questComplete && this.questTrigger){
            Game.sendMessage(player, 'Ah perfect. Take this battleaxe I made for all your hard work.');
            player.completeQuest(this.quest);
        }
        else if (!this.questComplete && this.questStarted) {
            Game.sendMessage(player, 'Have you found me a curved blade to inspire me?');
        }
        else if (this.questComplete) {
            Game.sendMessage(player, 'How do you like my work?');
        }
    },
    mixins: [Game.EntityMixins.TownActor, Game.EntityMixins.QuestGiver]
});

//Quest: Get him necronomicon
//reward: win the game
Game.EntityRepository.define('scholar',{
    name: "Scholar",
    character: 'S',
    foreground: color.red,
    dialogue(player){
        Game.sendMessage(player, this.name+":");
        //check for necro
        for (let i = 0; i < player.items.length; i++) {
            if (player.items[i] != undefined) {
                if (player.items[i].name == "necronomicon") {
                    this.questComplete = true;
                }
            }
        }

        if (!this.questComplete && !this.questStarted) {
            Game.sendMessage(player, 'You seek the necronomicon? Bring it to me and I will aid you.');
            this.questStarted = true;
        }
        else if (!this.questComplete && this.questStarted) {
            Game.sendMessage(player, 'Have you found the necronomicon?');
        }
        else{
            Game.sendMessage(player, 'Could it be? Hand it to me, quickly!');
            Game.sendMessage(player, 'Press %c{'+color.red+'}[Enter] %c{'+color.white+'}to hand over the necronomicon.');
            Game.winCon = true;
            Game.Screen.playScreen.setGameWin(true);
        }
    },
    mixins: [Game.EntityMixins.TownActor, Game.EntityMixins.QuestGiver]
});

Game.EntityRepository.define('citizen',{
    name: "Citizen",
    character: 'C',
    foreground: color.blue,
    dialogue(player){
        Game.sendMessage(player, this.name+":");

        if (ROT.RNG.getUniform() <= 0.01) {
            Game.sendMessage(player, '%c{'+color.red+'}We will sleep again soon.');
        }
        else{
            Game.sendMessage(player, 'Welcome to Innsmouth.');
        }
    },
    mixins: [Game.EntityMixins.CitizenActor, Game.EntityMixins.TownActor]
});

//monsters
Game.EntityRepository.define('fungus',{
    name: "fungus",
    character: 'f',
    foreground: 'ForestGreen',
    speed: 250,
    maxHp: 10,
    mixins: [Game.EntityMixins.FungusActor, Game.EntityMixins.Destructible,
        Game.EntityMixins.CorpseDropper]
});

Game.EntityRepository.define('zombie',{
    name: 'zombie',
    character: 'z',
    foreground: color.indigo,
    speed: 500,
    maxHp: 5,
    attackValue: 4,
    sightRadius: 3,
    tasks: ['hunt', 'wander'],
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight, 
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
             Game.EntityMixins.CorpseDropper, Game.EntityMixins.GoldDropper]
});

Game.EntityRepository.define('cultist',{
    name: 'cultist',
    character: 'c',
    foreground: color.red,
    speed: 1000,
    maxHp: 15,
    attackValue: 4,
    sightRadius: 10,
    tasks: ['hunt', 'wander'],
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight, 
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
             Game.EntityMixins.CorpseDropper, Game.EntityMixins.GoldDropper]
});

Game.EntityRepository.define('possesed',{
    name: 'possesed',
    character: 'p',
    foreground: color.pink,
    speed: 750,
    maxHp: 5,
    attackValue: 4,
    sightRadius: 6,
    tasks: ['hunt', 'wander'],
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight, 
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
             Game.EntityMixins.CorpseDropper, Game.EntityMixins.GoldDropper]
});

Game.EntityRepository.define('hulking shambler',{
    name: 'hulking shambler',
    character: 'h',
    foreground: color.white,
    speed: 2000,
    maxHp: 50,
    attackValue: 9,
    sightRadius: 10,
    tasks: ['hunt', 'wander'],
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight, 
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
             Game.EntityMixins.CorpseDropper, Game.EntityMixins.BossMob],

},
{
    disableRandomCreation: true
});



Game.sendMessage = function(recipient, message, args) {
    // Make sure the recipient can receive the message 
    // before doing any work.
    if (recipient.hasMixin(Game.EntityMixins.MessageRecipient)) {
        // If args were passed, then we format the message, else
        // no formatting is necessary
        if (args) {
            message = vsprintf(message, args);
        }
        recipient.receiveMessage(message);
    }
}

Game.sendMessageNearby = function(map, centerX, centerY, centerZ, message, args) {
    // If args were passed, then we format the message, else
    // no formatting is necessary
    if (args) {
        message = vsprintf(message, args);
    }
    // Get the nearby entities
    entities = map.getEntitiesWithinRadius(centerX, centerY, centerZ, 5);
    // Iterate through nearby entities, sending the message if
    // they can receive it.
    for (let i = 0; i < entities.length; i++) {
        if (entities[i].hasMixin(Game.EntityMixins.MessageRecipient)) {
            entities[i].receiveMessage(message);
        }
    }
}