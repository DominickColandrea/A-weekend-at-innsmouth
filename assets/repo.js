// A repository has a name and a constructor. The constructor is used to create
// items in the repository.
Game.Repository = function(name, ctor) {
    this.name = name;
    this.templates = {};
    this.ctor = ctor;

    this.randomTemplates = {};
};

// Define a new named template.
Game.Repository.prototype.define = function(name, template, options) {
    this.templates[name] = template;
    // Apply any options
    let disableRandomCreation = options && options['disableRandomCreation'];
    if (!disableRandomCreation) {
        this.randomTemplates[name] = template;
    }
};


// Create an object based on a template.
Game.Repository.prototype.create = function(name, extraProperties) {
    if (!this.templates[name]) {
        throw new Error("No template named '" + name + "' in repository '" +
            this.name + "'");
    }
    // Copy the template
    let template = Object.create(this.templates[name]);
    // Apply any extra properties
    if (extraProperties) {
        for (let key in extraProperties) {
            template[key] = extraProperties[key];
        }
    }
    // Create the object, passing the template as an argument
    return new this.ctor(template);
};

// Create an object based on a random template
Game.Repository.prototype.createRandom = function() {
    // Pick a random key and create an object based off of it.
    return this.create(Object.keys(this.randomTemplates).random());
};