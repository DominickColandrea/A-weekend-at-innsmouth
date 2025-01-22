Game.Item = function(properties) {
    properties = properties || {};
    // Call the glyph's construtor with our set of properties
    Game.DynamicGlyph.call(this, properties);
    // Instantiate any properties from the passed object
    this.name = properties['name'] || '';
};
// Make items inherit all the functionality from glyphs
Game.Item.extend(Game.DynamicGlyph);


Game.Item.prototype.describe = function() {
    return this.name;
};
Game.Item.prototype.describeA = function(capitalize) {
    // Optional parameter to capitalize the a/an.
    let prefixes = capitalize ? ['A', 'An'] : ['a', 'an'];
    let string = this.describe();
    let firstLetter = string.charAt(0).toLowerCase();
    // If word starts by a vowel, use an, else use a. Note that this is not perfect.
    let prefix = 'aeiou'.indexOf(firstLetter) >= 0 ? 1 : 0;

    return prefixes[prefix] + ' ' + string;
};