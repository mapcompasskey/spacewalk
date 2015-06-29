ig.module(
    'game.entities.button'
)
.requires(
    'impact.entity'
)
.defines(function() {
    EntityButton = ig.Entity.extend({
        
        size: {x: 150, y: 57},
        maxVel: {x: 0, y: 0},
        tile: 0,
        pressed: false,
        imgButton: null,
        action: 'undefined',
        hasFocus: false,
        anchor: {
            top: 0, // or bottom: 0,
            left: 0, // or right: 0,
            offset: {x: 0, y: 0}
        },
        
        type: ig.Entity.TYPE.NONE,
        checkAgainst: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.NEVER,
        _wmIgnore: true, // tells Weltmeister editor to ignore this entity
        
        init: function(x, y, settings) {
        
            this.parent(x, y, settings);
            
            // update parameters
            if (settings.action)
            {
                this.action = settings.action;
            }
            if (settings.anchor)
            {
                this.anchor = settings.anchor;
            }
            if (settings.width)
            {
                this.size.x = settings.width;
            }
            if (settings.height)
            {
                this.size.y = settings.height;
            }
            if (settings.imgSrc)
            {
                this.imgButton = new ig.Image(settings.imgSrc);
            }
            
            this.align();
            
        },
        
        update: function() {
        
            if (ig.game.isPaused)
            {
                return;
            }
            
            this.checkStatus();
            this.parent();
            
        },
        
        draw: function(show) {
        
            if (show)
            {
                if (this.imgButton)
                {
                    this.imgButton.drawTile(this.pos.x, this.pos.y, this.tile, this.size.x, this.size.y);
                }
            }
            
        },
        
        // check the current state of this entty
        checkStatus: function() {
        
            // default button state
            this.tile = 0;
            
            // if there was a mouse click
            if (ig.input.pressed('click'))
            {
                this.onClickStart();
            }
            
            // does this entity have focus
            this.hasFocus = (this.pressed ? this.checkFocus() : false);
            
            // if the mouse is being held down
            if (ig.input.state('click'))
            {
                if (this.pressed && this.hasFocus)
                {
                    this.tile = 1;
                }
            }
            
            // if the mouse click has been released
            if (ig.input.released('click'))
            {
                this.onClickEnd();
                this.pressed = false;
                this.hasFocus = false;
            }
            
        },
        
        // on button clicked event
        onClickStart: function() {
            
            if (this.checkFocus())
            {
                this.pressed = true;
                ig.input.actions[this.action] = true;
                if ( ! ig.input.locks[this.action])
                {
                    ig.input.presses[this.action] = true;
                    ig.input.locks[this.action] = true;
                }
            }
            
        },
        
        // on button released event
        onClickEnd: function() {
        
            if (this.pressed)
            {
                if (this.hasFocus)
                {
                    ig.input.delayedKeyup[this.action] = true;
                }
                else
                {
                    ig.input.actions[this.action] = false;
                }
            }
            
        },
        
        // check if the mouse is over this entity
        checkFocus: function() {
        
            var minX = this.pos.x;
            var maxX = this.pos.x + this.size.x;
            var mouseX = ig.input.mouse.x; //(ig.input.mouse.x + ig.game.screen.x);
            
            var minY = this.pos.y;
            var maxY = this.pos.y + this.size.y;
            var mouseY = ig.input.mouse.y; //(ig.input.mouse.y + ig.game.screen.y);
            
            return ((mouseX >= minX) && (mouseX <= maxX) && (mouseY >= minY) && (mouseY <= maxY));
            
        },
        
        // position the entity
        align: function() {
        
            var w = ig.system.width || window.innerWidth;
            var h = ig.system.height || window.innerHeight;
            
            // align on the x-axis
            if ('left' in this.anchor)
            {
                if (this.anchor.left == 'center')
                {
                    this.pos.x = ((w / 2) - (this.size.x / 2));
                }
                else
                {
                    this.pos.x = this.anchor.left;
                }
            }
            else if ('right' in this.anchor)
            {
                if (this.anchor.right == 'center')
                {
                    this.pos.x = ((w / 2) - (this.size.x / 2));
                }
                else
                {
                    this.pos.x = (w - this.anchor.right - this.size.x);
                }
            }
            
            // align on the y-axis
            if ('top' in this.anchor)
            {
                if (this.anchor.top == 'center')
                {
                    this.pos.y = ((h / 2) - (this.size.y / 2));
                }
                else
                {
                    this.pos.y = this.anchor.top;
                }
            }
            else if ('bottom' in this.anchor) {
                if (this.anchor.bottom == 'center') {
                    this.pos.y = ((h / 2) - (this.size.y / 2));
                } else {
                    this.pos.y = (h - this.anchor.bottom - this.size.y);
                }
            }
            
            // offset position
            if (this.anchor.offset)
            {
                this.pos.x += this.anchor.offset.x;
                this.pos.y += this.anchor.offset.y;
            }
            
            var internalWidth = parseInt(ig.system.canvas.offsetWidth) || ig.system.realWidth;
            var s = (ig.system.scale * (internalWidth / ig.system.realWidth));
            this.area = {
                x1: (this.pos.x * s),
                y1: (this.pos.y * s),
                x2: ((this.pos.x + this.size.x) * s),
                y2: ((this.pos.y + this.size.y) * s)
            };
            
        },
        
    });
});