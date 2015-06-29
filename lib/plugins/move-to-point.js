/*
    This plugin moves the entity towards a x/y coordinate.
    Based on the example outlined in "Html5 Game Development with Impactjs By Arno Meysman Davy Ciele"
    
    Example:
    
        init: function( x, y, settings ) {
            this.parent( x, y, settings );
            ig.input.bind( ig.KEY.MOUSE1, 'click' );
            this.MoveToPoint = new MoveToPoint();
        },
        
        update: function() {
            if ( this.moving ) {
                this.vel = this.MoveToPoint.getVelocity(100, this);
                if ( this.vel.x == 0 && this.vel.y == 0 ) {
                    this.moving = false;
                }
            }
            
            if ( ig.input.pressed('click') ) {
                this.moving = true;
                var destination = {
                    x: ( ig.input.mouse.x + ig.game.screen.x ),
                    y: ( ig.input.mouse.y + ig.game.screen.y )
                };
                this.MoveToPoint.setDestination( destination );
            }
            
            this.parent();
        }
*/
ig.module( 
	'plugins.move-to-point'
)
.requires(
	'impact.game'
)
.defines(function(){
    MoveToPoint = ig.Class.extend({
        
        speed: 0,
        minimun: 2,
        destination: {x: 0, y: 0},
        
        init: function() {
            
        },
        
        setDestination: function( destination, offset ) {
        
            if ( destination == undefined ) {
                return;
            }
            if ( isNaN( destination.x ) || isNaN( destination.x ) ) {
                return;
            }
            if ( offset == undefined ) {
                offset = {x:0, y:0};
            }
            if ( offset.x == undefined ) {
                offset.x = 0;
            }
            if ( offset.y == undefined ) {
                offset.y = 0;
            }
            
            this.destination.x = ( destination.x + offset.x );
            this.destination.y = ( destination.y + offset.y );
        },
        
        getVelocity: function( speed, source ) {
            
            var vel = {x: 0, y: 0};
            
            if ( isNaN( speed ) ) {
                return vel;
            }
            if ( source == undefined ) {
                return vel;
            }
            if ( source.pos == undefined ) {
                return vel;
            }
            if ( isNaN( source.pos.x ) || isNaN( source.pos.x ) ) {
                return vel;
            }
            if ( source.size == undefined ) {
                return vel;
            }
            if ( isNaN( source.size.x ) || isNaN( source.size.x ) ) {
                return vel;
            }
            
            var distance = {
                x: 0,
                y: 0,
                abs: {
                    x: 0,
                    y: 0
                }
            };
            distance.x = ( this.destination.x - source.pos.x - ( source.size.x / 2 ) );
            distance.y = ( this.destination.y - source.pos.y - ( source.size.y / 2 ) );
            distance.abs.x = Math.abs( distance.x );
            distance.abs.y = Math.abs( distance.y );
            
            if ( distance.abs.x > this.minimun || distance.abs.y > this.minimun ) {
                if ( distance.abs.x > distance.abs.y ) {
                    if ( distance.x > 0 ) {
                        vel.x = speed;
                        vel.y = ( ( distance.y / distance.x ) * speed );
                    } else {
                        vel.x = -speed;
                        vel.y = ( ( distance.y / distance.abs.x ) * speed );
                    }
                } else {
                    if ( distance.y > 0 ) {
                        vel.y = speed;
                        vel.x = ( ( distance.x / distance.y ) * speed );
                    } else {
                        vel.y = -speed;
                        vel.x = ( ( distance.x / distance.abs.y ) * speed );
                    }
                }
            }
            
            return vel;
        }
        
    });
});