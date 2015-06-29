ig.module(
    'plugins.simple-camera'
)
.defines(function(){ "use strict";
    ig.SimpleCamera = ig.Class.extend({
        
        x: {
            min: 0,
            max: 0
        },
        y: {
            min: 0,
            max: 0
        },
        offset: {
            x: {
                min: 0,
                max: 0
            },
            y: {
                min: 0,
                max: 0
            }
        },
        
        init: function() {
            this.getMinMax();
        },
        
        update: function() {
            if ( ig.game.isPaused ) {
                return;
            }
            this.parent();
        },
        
        // update min/max on window resize
        getMinMax: function() {
            // get the min x/y coordinates of the level
            this.x.min = this.offset.x.min;
            this.y.min = this.offset.y.min;
            
            // get the max x/y coordinates of the level
            this.x.max = ig.game.collisionMap.pxWidth - ig.system.width - this.offset.x.max;
            this.y.max = ig.game.collisionMap.pxHeight - ig.system.height - this.offset.y.max;
        },
        
        follow: function( entity ) {
            // update the camera
            ig.game.screen.x = this.move( 'x', entity.pos.x );
            ig.game.screen.y = this.move( 'y', entity.pos.y );
        },
        
        move: function( axis, pos ) {
            var system_size = ( axis == 'x' ? ig.system.width : ig.system.height );
            pos = ( pos -  ( system_size / 2 ) );
            if ( pos < this[axis].min ) {
                pos = this[axis].min;
            }
            if ( pos > this[axis].max ) {
                pos = this[axis].max;
            }
            return pos;
        },
        
        animate: function( target ) {
            
            // prevent moving below the camera's minimum y-axis
            if ( target.y.end > this.y.max ) {
                target.y.end = this.y.max;
            }
            
            var xRate = ( ( ( target.x.end - target.x.start ) * ig.system.tick ) / target.time );
            var yRate = ( ( ( target.y.end - target.y.start ) * ig.system.tick ) / target.time );
            
            // if moving to the left
            if ( target.x.end < target.x.start ) {
                if ( ( ig.game.screen.x + xRate ) < target.x.end ) {
                    ig.game.screen.x = target.x.end
                } else {
                    ig.game.screen.x += xRate;
                }
            }
            // else, moving to the right
            else {
                if ( ( ig.game.screen.x + xRate ) > target.x.end ) {
                    ig.game.screen.x = target.x.end
                } else {
                    ig.game.screen.x += xRate;
                }
            }
            
            // if moving down
            if ( target.y.end > target.y.start) {
                if ( ( ig.game.screen.y + yRate ) > target.y.end ) {
                    ig.game.screen.y = target.y.end;
                } else {
                    ig.game.screen.y += yRate;
                }
            }
            // else, moving up
            else {
                if ( ( ig.game.screen.y + yRate ) < target.y.end ) {
                    ig.game.screen.y = target.y.end;
                } else {
                    ig.game.screen.y += yRate;
                }
            }
            
        }
    });
});