ig.module(
	'game.entities.turrent-shot'
)
.requires(
	'impact.entity',
    'impact.entity-pool'
)
.defines(function() {
    EntityTurrentShot = ig.Entity.extend({
        
        size: {x: 5, y: 5},
        offset: {x: 0, y: 0},
        maxVel: {x: 200, y: 200},
        friction: {x: 0, y: 0},
        flip: false,
        speed: 90,
        gravityFactor: 0,
        animSheet: new ig.AnimationSheet('media/turrent-shot.png', 5, 5),
        
        angle: 0,
        canAttack: false,
        decayTime: 3.0,
        timerDecay: new ig.Timer(0),
        
        type: ig.Entity.TYPE.B, // add to enemy group
        checkAgainst: ig.Entity.TYPE.A, // check collisions against friendly group
        collides: ig.Entity.COLLIDES.NONE,
        _wmIgnore: true,
        
        init: function(x, y, settings) {
            
            this.parent(x, y, settings);
            this.prepareEntity();
            
            // add the animations
            this.addAnim('idle', 1, [0], true);
            
        },
        
        // resurrect this entity from the entity pool
        reset: function(x, y, settings) {
        
            this.parent(x, y, settings);
            this.prepareEntity();
            
        },
        
        // reset parameters
        prepareEntity: function() {
        
            // reset parameters
            this.canAttack = true;
            this.timerDecay = new ig.Timer(this.decayTime);
            
            // set destination
            this.setDestination();
            
        },
        
        // set destination
        setDestination: function() {
        
            if (ig.game.player)
            {
                // get angle from entity to player in radians
                var mx = (ig.game.player.pos.x + (ig.game.player.size.x / 2));
                var my = (ig.game.player.pos.y + (ig.game.player.size.y / 2));
                var radians =  Math.atan2(
                    (my - this.pos.y),
                    (mx - this.pos.x)
                );
                
                // use angle to determine velocity
                var xVel = (Math.cos(radians) * this.speed);
                var yVel = (Math.sin(radians) * this.speed);
                this.maxVel.x = this.vel.x = this.accel.x = xVel;
                this.maxVel.y = this.vel.y = this.accel.y = yVel;
                
                // set entity rotation
                this.setRotation(radians);
            }
            
        },
        
        // update the entity's rotation and hitbox
        setRotation: function(radians) {
            /*
            // set entity rotation
            this.angle = radians;
            
            // position collision box
            // x = h + r * cos(θ) 
            // y = k + r * sin(θ) 
            // where (h, k) is the center of the circle, r is the radius, and x and y are the co-ordinates of the point
            var radius = 3;
            var x = (radius * Math.cos(radians));
            var y = (radius * Math.sin(radians));
            this.offset.x = (this.animSheet.width / 2) - (this.size.x / 2) + x;
            this.offset.y = (this.animSheet.height / 2) - (this.size.y / 2) + y;
            */
        },
        
        update: function() {
        
            if (ig.game.isPaused)
            {
                return;
            }
            
            this.checkStatus();
            this.parent();
            
        },
        
        checkStatus: function() {
            
            // if decayed
            if (this.timerDecay.delta() > 0)
            {
                this.kill();
            }
            
            // rotate entity
            //this.currentAnim.angle = this.angle;
            
        },
        
        // opt out of collision
        handleMovementTrace: function(res) {
        
            var mx = (this.vel.x * ig.system.tick);
            var my = (this.vel.y * ig.system.tick);
            this.pos.x += mx;
            this.pos.y += my;
            
        },
        
        // called during a .checkAgainst collision
        check: function(other) {
        
            if (this.canAttack)
            {
                if (other.receiveDamage(1, this))
                {
                    this.kill();
                }
            }
            
        },
        
        // called by other entity during a .checkAgainst collision
        receiveDamage: function(amount, from) {
        
            this.kill();
            return true;
            
        },
        
    });
    
    ig.EntityPool.enableFor(EntityTurrentShot);
});