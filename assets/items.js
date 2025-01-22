Game.ItemRepository = new Game.Repository('items', Game.Item);



Game.ItemRepository.define('apple_shop', {
    name: 'apple',
    character: '*',
    foreground: color.red,
    foodValue: 50,
    mixins: [Game.ItemMixins.Edible, Game.ItemMixins.QuestReward_Shop]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('gold', {
    name: 'gold',
    character: '*',
    value: 1,
    foreground: color.yellow,
    mixins: [Game.ItemMixins.Collectable]
});

Game.ItemRepository.define('apple', {
    name: 'apple',
    character: '*',
    foreground: color.red,
    foodValue: 50,
    mixins: [Game.ItemMixins.Edible]
});
Game.ItemRepository.define('potato', {
    name: 'potato',
    character: '*',
    foreground: color.brown,
    foodValue: 35,
    consumptions: 3,
    mixins: [Game.ItemMixins.Edible]
});
Game.ItemRepository.define('chicken', {
    name: 'chicken',
    character: '*',
    foreground: color.white,
    foodValue: 200,
    mixins: [Game.ItemMixins.Edible]
});
Game.ItemRepository.define('rawChicken', {
    name: 'raw chicken',
    character: '*',
    foreground: color.pink,
    foodValue: -100,
    mixins: [Game.ItemMixins.Edible]
});

Game.ItemRepository.define('rock', {
    name: 'rock',
    character: ',',
    foreground: 'white'
});

Game.ItemRepository.define('necronomicon', {
    name: 'necronomicon',
    character: '&',
    foreground: color.red
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('corpse', {
    name: 'corpse',
    character: '%',
    foodValue: 75,
    consumptions: 1,
    mixins: [Game.ItemMixins.Edible]
}, {
    disableRandomCreation: true
});

// Weapons
Game.ItemRepository.define('dagger', {
    name: 'dagger',
    character: ')',
    foreground: 'gray',
    attackValue: 4,
    wieldable: true,
    mixins: [Game.ItemMixins.Equippable]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('gauntlet', {
    name: 'gauntlet',
    character: ')',
    foreground: 'white',
    attackValue: 5,
    defenseValue: 1,
    wieldable: true,
    mixins: [Game.ItemMixins.Equippable]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('cutlass', {
    name: 'cutlass',
    character: ')',
    foreground: color.purple,
    attackValue: 7,
    wieldable: true,
    mixins: [Game.ItemMixins.Equippable]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('battleaxe', {
    name: 'battleaxe',
    character: ')',
    foreground: color.purple,
    attackValue: 15,
    wieldable: true,
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.QuestReward_Blacksmith]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('cane', {
    name: 'cane',
    character: ')',
    foreground: color.brown,
    attackValue: 3,
    defenseValue: 2,
    wieldable: true,
    mixins: [Game.ItemMixins.Equippable]
}, {
    disableRandomCreation: true
});

// Wearables
Game.ItemRepository.define('waistcoat', {
    name: 'waistcoat',
    character: '[',
    foreground: color.red,
    defenseValue: 1,
    wearable: true,
    mixins: [Game.ItemMixins.Equippable]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('tunic', {
    name: 'tunic',
    character: '[',
    foreground: color.green,
    defenseValue: 2,
    wearable: true,
    mixins: [Game.ItemMixins.Equippable]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('blazer', {
    name: 'blazer',
    character: '[',
    foreground: color.blue,
    defenseValue: 3,
    wearable: true,
    mixins: [Game.ItemMixins.Equippable]
}, {
    disableRandomCreation: true
});
Game.ItemRepository.define('overcoat', {
    name: 'overcoat',
    character: '[',
    foreground: color.brown,
    defenseValue: 4,
    wearable: true,
    mixins: [Game.ItemMixins.Equippable]
}, {
    disableRandomCreation: true
});

//quest items
Game.ItemRepository.define('lostSon', {
    name: 'lost son',
    character: 'l',
    foreground: color.green
}, {
    disableRandomCreation: true
});