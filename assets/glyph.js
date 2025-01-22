Game.Glyph = function(properties) {
    // Instantiate properties to default if they weren't passed
    properties = properties || {};
    this.char = properties['character'] || ' ';
    this.foreground = properties['foreground'] || 'white';
    this.background = properties['background'] || 'black';
};

// Create standard getters for glyphs
Game.Glyph.prototype.getChar = function(){ 
    return this.char; 
}
Game.Glyph.prototype.getBackground = function(){
    return this.background;
}
Game.Glyph.prototype.getForeground = function(){ 
    return this.foreground; 
}