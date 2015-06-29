ig.module(
    'plugins.touch-button'
)
.requires(
    'impact.system',
    'impact.input',
    'impact.image'
)
.defines(function() { "use strict";
    ig.TouchButton = ig.Class.extend({
        action: 'undefined',
        image: null,
        tile: 0,
        pos: {x: 0, y: 0},
        size: {x: 0, y: 0},
        area: {x1: 0, y1: 0, x2: 0, y2: 0},
        
        pressed: false,	
        touchId: 0,
        anchor: null,
        
        init: function( action, anchor, width, height, image, tile ) {
            this.action = action;
            this.anchor = anchor;
            this.size = {x: width, y: height};
            
            this.image = image || null;
            this.tile = tile || 0;
        },
        
        align: function( w, h ) {
            // align on the x-axis
            if ( 'left' in this.anchor ) {
                if ( this.anchor.left == 'center' ) {
                    this.pos.x = ( ( w / 2 ) - ( this.size.x / 2 ) );
                } else {
                    this.pos.x = this.anchor.left;
                }
            }
            else if ( 'right' in this.anchor ) {
                if ( this.anchor.right == 'center' ) {
                    this.pos.x = ( ( w / 2 ) - ( this.size.x / 2 ) );
                } else {
                    this.pos.x = w - this.anchor.right - this.size.x;
                }
            }
            
            // align on the y-axis
            if ( 'top' in this.anchor ) {
                if ( this.anchor.top == 'center' ) {
                    this.pos.y = ( ( h / 2 ) - ( this.size.y / 2 ) );
                } else {
                    this.pos.y = this.anchor.top;
                }
            }
            else if ( 'bottom' in this.anchor ) {
                if ( this.anchor.bottom == 'center' ) {
                    this.pos.y = ( ( h / 2 ) - ( this.size.y / 2 ) );
                } else {
                    this.pos.y = h - this.anchor.bottom - this.size.y;
                }
            }
            
            // offset position
            if ( this.anchor.offset ) {
                this.pos.x += this.anchor.offset.x;
                this.pos.y += this.anchor.offset.y;
            }
            
            var internalWidth = parseInt( ig.system.canvas.offsetWidth ) || ig.system.realWidth;
            var s = ( ig.system.scale * ( internalWidth / ig.system.realWidth ) );
            this.area = {
                x1: ( this.pos.x * s ),
                y1: ( this.pos.y * s ),
                x2: ( ( this.pos.x + this.size.x ) * s ),
                y2: ( ( this.pos.y + this.size.y ) * s )
            };
        },
        
        mouseStart: function( ev ) {
            if ( this.pressed ) { return; }
            
            var pos = {left: 0, top: 0};
            if ( ig.system.canvas.getBoundingClientRect ) {
                pos = ig.system.canvas.getBoundingClientRect();
            }
            
            var mouseX = ev.x || ev.pageX;
            var mouseY = ev.y || ev.pageY;
            
            if ( this.checkStart( ev.button, (mouseX - pos.left), (mouseY - pos.top) ) ) {
                return;
            }
        },
        
        mouseEnd: function( ev ) {
            if ( ! this.pressed ) { return; }
            
            var pos = {left: 0, top: 0};
            if ( ig.system.canvas.getBoundingClientRect ) {
                pos = ig.system.canvas.getBoundingClientRect();
            }
            
            var mouseX = ev.x || ev.pageX;
            var mouseY = ev.y || ev.pageY;
            
            if ( this.checkEnd( ev.button, (mouseX - pos.left), (mouseY - pos.top) ) ) {
                return;
            }
        },
        
        touchStart: function( ev ) {
            if ( this.pressed ) { return; }
            
            var pos = {left: 0, top: 0};
            if ( ig.system.canvas.getBoundingClientRect ) {
                pos = ig.system.canvas.getBoundingClientRect();
            }
            
            for ( var i = 0; i < ev.touches.length; i++ ) {
                var touch = ev.touches[i];
                if ( this.checkStart( touch.identifier, (touch.clientX - pos.left), (touch.clientY - pos.top) ) ) {
                    return;
                }
            }
        },
        
        touchEnd: function( ev ) {
            if ( !this.pressed ) { return; }
            
            var pos = {left: 0, top: 0};
            if ( ig.system.canvas.getBoundingClientRect ) {
                pos = ig.system.canvas.getBoundingClientRect();
            }
            
            for ( var i = 0; i < ev.changedTouches.length; i++ ) {
                if ( this.checkEnd( ev.changedTouches[i].identifier, (ev.changedTouches[i].clientX - pos.left), (ev.changedTouches[i].clientY - pos.top) ) ) {
                    return;
                }
            }
        },
        
        touchStartMS: function( ev ) {
            if ( this.pressed ) { return; }
            
            var pos = {left: 0, top: 0};
            if ( ig.system.canvas.getBoundingClientRect ) {
                pos = ig.system.canvas.getBoundingClientRect();
            }
            
            this.checkStart( ev.pointerId, (ev.clientX - pos.left), (ev.clientY - pos.top) );
        },
        
        touchEndMS: function( ev ) {
            if ( !this.pressed ) { return; }
            
            var pos = {left: 0, top: 0};
            if ( ig.system.canvas.getBoundingClientRect ) {
                pos = ig.system.canvas.getBoundingClientRect();
            }
            
            this.checkEnd( ev.pointerId, (ev.clientX - pos.left), (ev.clientY - pos.top) );
        },
        
        checkStart: function( id, x, y ) {
            if ( x > this.area.x1 && x < this.area.x2 && y > this.area.y1 && y < this.area.y2 ) {
                this.tile = 1;
                this.pressed = true;
                this.touchId = id;
                
                ig.input.actions[this.action] = true;
                if ( ! ig.input.locks[this.action] ) {
                    ig.input.presses[this.action] = true;
                    ig.input.locks[this.action] = true;
                }
                return true;
            }
            
            return false;
        },
        
        checkEnd: function( id, x, y ) {
            if ( id === this.touchId ) {
                this.tile = 0;
                this.pressed = false;
                this.touchId = 0;
                if ( this.checkOver( x, y ) ) {
                    ig.input.delayedKeyup[this.action] = true;
                }
                return true;
            }
            
            return false;
        },
        
        checkOver: function( x, y ) {
            if ( x > this.area.x1 && x < this.area.x2 && y > this.area.y1 && y < this.area.y2 ) {
                return true;
            }
            return false;
        },
        
        draw: function() {
            if ( this.image ) { 
                this.image.drawTile( this.pos.x, this.pos.y, this.tile, this.size.x, this.size.y );
            }
        }
    });
    
    
    
    ig.TouchButtonCollection = ig.Class.extend({
        buttons: [],
        
        init: function( buttons ) {
            this.buttons = buttons;
            
            document.addEventListener('mousedown', this.mouseStart.bind(this), true );
            document.addEventListener('mouseup', this.mouseEnd.bind(this), true );
            
            if ( ig.ua.touchDevice ) {
                // Standard
                document.addEventListener('touchstart', this.touchStart.bind(this), false);
                document.addEventListener('touchend', this.touchEnd.bind(this), false);
                
                // MS
                document.addEventListener('MSPointerDown', this.touchStartMS.bind(this), false);
                document.addEventListener('MSPointerUp', this.touchEndMS.bind(this), false);
                document.body.style.msTouchAction = 'none';
            }
        },
        
        mouseStart: function( ev ) {
            ev.preventDefault();
            
            for ( var i = 0; i < this.buttons.length; i++ ) {
                this.buttons[i].mouseStart( ev );
            }
        },
        
        mouseEnd: function( ev ) {
            ev.preventDefault();
            
            for ( var i = 0; i < this.buttons.length; i++ ) {
                this.buttons[i].mouseEnd( ev );
            }
        },
        
        touchStart: function(ev) {
            ev.preventDefault();
            
            for ( var i = 0; i < this.buttons.length; i++ ) {
                this.buttons[i].touchStart( ev );
            }
        },
        
        touchEnd: function(ev) {
            ev.preventDefault();
            
            for ( var i = 0; i < this.buttons.length; i++ ) {
                this.buttons[i].touchEnd( ev );
            }
        },
        
        touchStartMS: function(ev) {
            ev.preventDefault();
            
            for ( var i = 0; i < this.buttons.length; i++ ) {
                this.buttons[i].touchStartMS( ev );
            }
        },
        
        touchEndMS: function(ev) {
            ev.preventDefault();
            
            for ( var i = 0; i < this.buttons.length; i++ ) {
                this.buttons[i].touchEndMS( ev );
            }
        },
        
        align: function() {
            var w = ig.system.width || window.innerWidth;
            var h = ig.system.height || window.innerHeight;
            
            for ( var i = 0; i < this.buttons.length; i++ ) {
                this.buttons[i].align( w, h );
            }
        },
        
        draw: function() {
            for ( var i = 0; i < this.buttons.length; i++ ) {
                this.buttons[i].draw();
            }
        }
    });
    
});
