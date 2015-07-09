ig.module(
	'game.main' 
)
.requires(
    'impact.debug.debug',
	'impact.game',
	'impact.font',
    'plugins.simple-camera',
    'game.entities.button',
    'game.entities.player',
    'game.levels.area1'
)
.defines(function(){
    
    //
    // --------------------------------------------------------------------------
    // Title Screen
    // --------------------------------------------------------------------------
    //
    GameTitle = ig.Game.extend({
        
        clearColor: '#000033',
        tileSize: 10,
        gravity: 400,
        buttonStart: null,
        font: new ig.Font('media/04b03.font.png'),
        
        logo: {
            pos: {x: 0, y: 0},
            img: new ig.Image('media/space-walker.png')
        },
        
        // initialize your game here
        init: function() {
            
            // bind keys
            ig.input.bind(ig.KEY.A, 'left');
            ig.input.bind(ig.KEY.D, 'right');
            ig.input.bind(ig.KEY.MOUSE1, 'click');
            
            // show collision boxes
            //ig.Entity._debugShowBoxes = true;
            
            // add Start button
            var settings = {action:'start', anchor:{bottom:10, right:10, offset:{x:0, y:0}}, width:50, height:19, imgSrc:'media/button-start.png'};
            this.buttonStart = ig.game.spawnEntity(EntityButton, 0, 0, settings);
            
            // set game width
            this.resizeGame();
            
        },
        
        update: function() {
            
            this.parent();
            
            // if Start button is pressed
            this.buttonStart.update();
            if (ig.input.released('start'))
            {
                ig.system.setGame(GameStage);
            }
            
            // update camera
            if (this.player)
            {
                if (this.camera)
                {
                    // camera follows the player
                    this.camera.follow(this.player);
                }
                else
                {
                    // center screen on the player
                    this.screen.x = (this.player.pos.x - (ig.system.width / 2));
                    this.screen.y = (this.player.pos.y - (ig.system.height / 2));
                }
            }
            
        },
        
        draw: function() {
            
            this.parent();
            
            // draw logo
            this.logo.img.draw(this.logo.pos.x, this.logo.pos.y);
            
            // draw text
            //var text = 'You\'re a lowly slime.\nAdventures are raiding your home.\nFind a way to defeat them.';
            //text += '\n\nCLICK to jump.\nCLICK and HOLD to attack.';
            //this.font.draw(text, (ig.system.width / 2), 70, ig.Font.ALIGN.CENTER);
            
            // draw Start button
            this.buttonStart.draw(true);
            
        },
        
        // reposition entities
        resizeGame: function() {
        
            // has the game started
            if ( ! ig.system)
            {
                return;
            }
            
            // update logo position
            this.logo.pos.x = ((ig.system.width / 2) - (this.logo.img.width / 2));
            this.logo.pos.y = 50;
            
            // reposition Start button
            this.buttonStart.align();
            
        },
        
    });
    
    
    
    //
    // --------------------------------------------------------------------------
    // The Game Stage
    // --------------------------------------------------------------------------
    //
    GameStage = ig.Game.extend({
        
        clearColor: '#000033',
        isPaused: false,
        tileSize: 10,
        gravity: 400,
        font: new ig.Font('media/04b03.font.png'),
        imgPlanet: new ig.Image('media/planet.png'),
        
        
        // initialize your game here
        init: function() {
            
            // bind keys
            ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
            ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
            ig.input.bind(ig.KEY.UP_ARROW, 'up');
            ig.input.bind(ig.KEY.DOWN_ARROW, 'down');
            ig.input.bind(ig.KEY.SPACE, 'space');
            ig.input.bind(ig.KEY.X, 'jump');
            ig.input.bind(ig.KEY.Z, 'attack');
            ig.input.bind(ig.KEY.C, 'invincible');
            ig.input.bind(ig.KEY.P, 'pause');
            
            this.loadLevel(LevelArea1);
            
            // show collision boxes
            //ig.Entity._debugShowBoxes = true;
            
            // set game width
            this.resizeGame();
            
        },
        
        update: function() {
        
            this.parent();
            
            if (ig.input.pressed('pause'))
            {
                this.isPaused = !this.isPaused;
            }
            
            if (ig.game.isPaused)
            {
                return;
            }
            
            // update camera
            if (this.player)
            {
                if (this.camera)
                {
                    // camera follows the player
                    this.camera.follow(this.player);
                }
                else
                {
                    // center screen on the player
                    this.screen.x = (this.player.pos.x - (ig.system.width / 2));
                    this.screen.y = (this.player.pos.y - (ig.system.height / 2));
                }
            }
            
        },
        
        draw: function() {
            
            this.parent();
            
            // var xPos = 10;//(10 - this.screen.x);
            // var yPos = 10;//(ig.game.collisionMap.pxHeight - this.screen.y - 20);
            // this.imgPlanet.draw(xPos, yPos);
            
            // draw text
            var text =
                'ARROWS KEY TO MOVE | X TO JUMP | SPACEBAR TO REVERSE GRAVITY' + 
                '\nTHERE IS GRAVITY INSIDE THE DERELICT SHIPS';
            var xPos = (10 - this.screen.x);
            var yPos = (10 - this.screen.y); // (ig.game.collisionMap.pxHeight - this.screen.y - 20);
            this.font.draw(text, xPos, yPos, ig.Font.ALIGN.LEFT);
            
        },
        
        loadLevel: function(data) {
            
            // remember the currently loaded level, so we can reload when the player dies.
            this.currentLevel = data;
            
            // call the parent implemenation. this creates the background maps and entities.
            this.parent(data);
            
            // add planet background map
            var planet = new ig.BackgroundMap(120, [[1,2,3],[4,5,6]], 'media/planet.png');
            planet.name = 'planet';
            this.backgroundMaps.unshift(planet);
            
            // add stars background map
            var stars = new ig.BackgroundMap(150, [[1,2]], 'media/stars.png');
            stars.name = 'stars';
            stars.repeat = true;
            this.backgroundMaps.unshift(stars);
            
            // setup camera plugin
            this.camera = new ig.SimpleCamera();
            this.camera.offset.x.min = 0;
            this.camera.offset.x.max = 0;
            this.camera.getMinMax();
            
            // spawn player
            //ig.game.spawnEntity(EntityPlayer, (this.tileSize * 14), (this.tileSize * 14));
            ig.game.spawnEntity(EntityPlayer, (this.tileSize * 11), (this.tileSize * 9));
            
            // add Back button
            var settings = {action:'back', anchor:{top:10, right:5, offset:{x:0, y:0}}, width:43, height:19, imgSrc:'media/button-back.png'};
            this.buttonBack = ig.game.spawnEntity(EntityButton, 0, 0, settings);
            
        },
        
        // size the game to the browser
        resizeGame: function() {
            
            // has the game started
            if ( ! ig.system)
            {
                return;
            }
            
            if (this.camera)
            {
                this.camera.getMinMax();
            }
            
        },
        
    });
    
    
    
    //
    // --------------------------------------------------------------------------
    // ImpactJS Overrides
    // --------------------------------------------------------------------------
    //
    // override default parallax effect to force y-axis positiong from certain layers
    ig.BackgroundMap.inject({
        setScreenPos: function(x, y) {
            
            if (this.name == 'stars')
            {
                this.scroll.x = 0;
                this.scroll.y = 0;
                return;
            }
            else if (this.name == 'planet')
            {
                this.scroll.x = (x / 10 + 100);
                this.scroll.y = (y / 10 - 100);
                return;
            }
            
            this.scroll.x = (x / this.distance);
            this.scroll.y = (y / this.distance);
            
        }
    });
    
    // Ah, yes. I love vendor prefixes. So much fun!
    ig.setVendorAttribute = function( el, attr, val ) {
        var uc = attr.charAt(0).toUpperCase() + attr.substr(1);
        //el[attr] = el['ms'+uc] = el['moz'+uc] = el['webkit'+uc] = el['o'+uc] = val;
        el[attr] = el['ms'+uc] = el['moz'+uc] = el['o'+uc] = val;
    };
    
    
    
    //
    // --------------------------------------------------------------------------
    // Fullscreen / Mobile mode
    // --------------------------------------------------------------------------
    //
    ig.gameScale = 1;//(window.innerWidth < 640 ? 2 : 1);
    if (fullscreen || ig.ua.mobile)
    {
        // set the canvas element to the size of the window
        ig.gameCanvas = document.getElementById('canvas');
        ig.gameCanvas.style.width  = window.innerWidth + 'px';
        ig.gameCanvas.style.height = window.innerHeight + 'px';
        
        // on browser resize, update the canvas and game entities
        window.addEventListener('resize', function() {
        
            if ( ! ig.system)
            {
                return;
            }
            
            // resize the canvas
            if (ig.gameCanvas)
            {
                ig.gameCanvas.style.width  = window.innerWidth + 'px';
                ig.gameCanvas.style.height = window.innerHeight + 'px';
                ig.system.resize((window.innerWidth * ig.gameScale), (window.innerHeight * ig.gameScale));
            }
            
            if (ig.game.resizeGame)
            {
                ig.game.resizeGame();
            }
            
        }, false);
    }
    
    
    
    //
    // --------------------------------------------------------------------------
    // Initialize the Game
    // --------------------------------------------------------------------------
    //
    //ig.main('#canvas', GameTitle, 1, 300, 180, 3);
    ig.main('#canvas', GameStage, 1, 300, 180, 3);
    
});
