Game.ItemMixins = {};

// Edible mixins
Game.ItemMixins.Edible = {
    name: 'Edible',
    init(template) {
        // Number of points to add to hunger
        this.foodValue = template['foodValue'] || 5;
        // Number of times the item can be consumed
        this.maxConsumptions = template['consumptions'] || 1;
        this.remainingConsumptions = this.maxConsumptions;
    },
    eat(entity) {
        if (entity.hasMixin('FoodConsumer')) {
            if (this.hasRemainingConsumptions()) {
                entity.modifyFullnessBy(this.foodValue);
                this.remainingConsumptions--;
            }
        }
    },
    hasRemainingConsumptions() {
        return this.remainingConsumptions > 0;
    },
    describe() {
        if (this.maxConsumptions != this.remainingConsumptions) {
            return 'partly eaten ' + Game.Item.prototype.describe.call(this);
        } else {
            return this.name;
        }
    }
};

Game.ItemMixins.Equippable = {
    name: 'Equippable',
    init(template) {
        this.attackValue = template['attackValue'] || 0;
        this.defenseValue = template['defenseValue'] || 0;
        this.wieldable = template['wieldable'] || false;
        this.wearable = template['wearable'] || false;
    },
    getAttackValue() {
        return this.attackValue;
    },
    getDefenseValue() {
        return this.defenseValue;
    },
    isWieldable() {
        return this.wieldable;
    },
    isWearable() {
        return this.wearable;
    }
};

Game.ItemMixins.Collectable = {
    name: 'Collectable',
    init(template) {
        this.value = template['value'] || 1;
    },
    describe() {
        return this.value + " " + Game.Item.prototype.describe.call(this);
    }
};


Game.ItemMixins.QuestReward_Shop = {
    name: 'QuestReward_Shop',
};
Game.ItemMixins.QuestReward_Blacksmith = {
    name: 'QuestReward_Blacksmith',
};