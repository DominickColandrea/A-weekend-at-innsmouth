let Game = {
    display: null,
    currentScreen: null,
    //change width and height when changing font
    screenWidth: 32,
    screenHeight: 24,
    seed: ROT.RNG.getSeed(),
    counter: 0,
    winCon: false,
    timeOut: false,
    time: {
        day: 1,
        hour: 6,
        minute: 0,
        cycle: "AM",
        trueHour: 6,
    },

    init() {
        this.display = new ROT.Display({
            width:this.screenWidth,
            height:this.screenHeight+ 1,//+1 for the UI
            fontSize:28,
            forceSquareRatio: true,
            fontFamily: "Syne Mono, monospace"
        });

        // Create a helper function for binding to an event
        // and making it send it to the screen
        let game = this;
        let bindEventToScreen = function(event) {
            window.addEventListener(event, function(e) {
                if (game.currentScreen !== null) {
                    game.currentScreen.handleInput(event, e);
                }
            });
        }
        // Bind keyboard input events
        bindEventToScreen('keydown');
        //bindEventToScreen('keyup');
        bindEventToScreen('keypress');

    },

    advanceTime() {
        this.counter++;

        if (this.counter >=3) {
            this.counter = 0;
            this.time.minute++;
        }
        
        if (this.time.minute >= 60) {
            this.time.minute = 0;
            this.time.trueHour++;
        }

        //set hour to trueHour clock
        if(this.time.trueHour >= 49){
            this.time.hour = this.time.trueHour-48;
            this.time.cycle = "AM";

            if (this.time.day == 2) {
                this.time.day++;
                
                Game.timeOut = true;
                Game.Screen.playScreen.player.kill("You have run out of time");
            }
        }
        else if(this.time.trueHour >= 48){
            this.time.hour = this.time.trueHour-36;
            this.time.cycle = "AM";

            if (this.time.day == 2) {
                this.time.day++;

                Game.timeOut = true;
                Game.Screen.playScreen.player.kill("You have run out of time");
            }
        }
        else if(this.time.trueHour >= 37){
            this.time.hour = this.time.trueHour-36;
            this.time.cycle = "PM";
        }
        else if(this.time.trueHour >= 36){
            this.time.hour = this.time.trueHour-24;
            this.time.cycle = "PM";
        }
        else if(this.time.trueHour >= 25){
            this.time.hour = this.time.trueHour-24;
            this.time.cycle = "AM";

            if (this.time.day == 1) {
                this.time.day++;
            }
        }
        else if(this.time.trueHour >= 24){
            this.time.hour = this.time.trueHour-12;
            this.time.cycle = "AM";

            if (this.time.day == 1) {
                this.time.day++;
            }
        }
        else if(this.time.trueHour >= 13){
            this.time.hour = this.time.trueHour-12;
            this.time.cycle = "PM";
        }
        else if(this.time.trueHour >= 12){
            this.time.hour = this.time.trueHour;
            this.time.cycle = "PM";
        }
        else {
            this.time.hour = this.time.trueHour;
        }

    },
    refresh() {
        this.advanceTime();
        this.display.clear();
        this.currentScreen.render(this.display);
    },
    getDisplay() {
        return this.display;
    },
    getScreenWidth() {
        return this.screenWidth;
    },
    getScreenHeight() {
        return this.screenHeight;
    },

    getCanvas(){
        return this.ctx;
    },

    switchScreen(screen) {

        if (this.currentScreen !== null) {
            this.currentScreen.exit();
        }

        this.getDisplay().clear();

        this.currentScreen = screen;
        if (!this.currentScreen !== null) {
            this.currentScreen.enter();
            this.refresh();
        }
    }
}

window.addEventListener('load', function() {
   
   Game.init();
   document.body.appendChild(Game.getDisplay().getContainer());
   
   Game.canvas = document.getElementsByTagName("canvas")[0];
   Game.ctx = Game.canvas.getContext("2d");
   
   Game.switchScreen(Game.Screen.startScreen);
   
});