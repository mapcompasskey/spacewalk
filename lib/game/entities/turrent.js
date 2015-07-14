ig.module(
    'game.entities.turrent'
)
.requires(
    'impact.entity',
    'game.entities.turrent-shot'
)
.defines(function() {
    EntityTurrent = ig.Entity.extend({
        
        size: {x: 13, y: 13},
        offset: {x: 0, y: 0},
        maxVel: {x: 0, y: 0},
        friction: {x: 0, y: 0},
        flip: false,
        speed: 0,
        jump: 0,
        health: 6,
        angle: 0,
        gravityFactor: 0,
        animSheet: new ig.AnimationSheet('media/turrent.png', 13, 13),
        
        proximity: 100,
        timeAttack: 1,
        attackTimer: null,
        
        idling: false,
        hurting: false,
        dying: false,
        aiming: false,
        attacking: false,
        
        type: ig.Entity.TYPE.B,
        checkAgainst: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.PASSIVE,
        
        init: function(x, y, settings) {
        
            this.parent(x, y, settings);
            
            // add the animations
            this.addAnim('idle', 1, [0,1], false);
            this.addAnim('attack', 1, [2], true);
            this.addAnim('hurt', 1, [0], true);
            this.addAnim('dead', 1, [0], true);
            
        },
        
        update: function() {
            
            if (ig.game.isPaused)
            {
                return;
            }
            
            this.checkStatus();
            this.checkPosition();
            this.parent();
            
        },
        
        checkStatus: function() {
            
            // check entity status
            this.isHurting();
            this.isAiming();
            this.isAttacking();
            this.isIdling();
            this.animate();
            
        },
        
        // check if hurting
        isHurting: function() {
            
            // if dying, kill this entity when the animation ends
            if (this.dying)
            {
                if (this.currentAnim == this.anims.dead)
                {
                    if (this.currentAnim.loopCount)
                    {
                        this.kill();
                    }
                }
            }
            
            // if hurting, stop hurting when the animation ends
            if (this.hurting)
            {
                if (this.currentAnim == this.anims.hurt)
                {
                    if (this.currentAnim.loopCount)
                    {
                        this.hurting = false;
                    }
                }
            }
            
        },
        
        // check if aiming
        isAiming: function() {
        
            if (this.hurting || this.dying)
            {
                return;
            }
            
            // check the player entity exist
            if (ig.game.player)
            {
                if (this.distanceTo(ig.game.player) < this.proximity)
                {
                    this.aiming = true;
                }
                else
                {
                    this.aiming = false;
                }
                
                // rotate towards the player entity
                if (this.aiming)
                {
                    // 2d game slowly turn turret angle towards player
                    // https://jibransyed.wordpress.com/2013/09/05/game-maker-gradually-rotating-an-object-towards-a-target/
                    // http://impactjs.com/forums/help/rotating-a-player-entity-to-a-specific-angle-from-its-current-direction/page/1
                    
                    var thisAngle = this.angle;
                    thisAngle = thisAngle.toDeg();
                    
                    var targetAngle = this.angleTo(ig.game.player);
                    targetAngle = targetAngle.toDeg();
                    
                    var angleDiff = (thisAngle - targetAngle);
                    
                    if (Math.abs(angleDiff) > 180)
                    {
                        if (thisAngle > targetAngle)
                        {
                            angleDiff = -1 * ((360 - thisAngle) + targetAngle);
                        }
                        else
                        {
                            angleDiff = (360 - targetAngle) + thisAngle;
                        }
                    }
                    
                    if (Math.abs(angleDiff) > 10)
                    {
                        this.angle -= (angleDiff/10).toRad();
                    }
                    else
                    {
                        this.attacking = true;
                        this.angle = targetAngle.toRad();
                    }
                    
                }
            }
        
        },
        
        // check if attacking
        isAttacking: function() {
            
            if (this.hurting || this.dying)
            {
                this.attacking = false;
                return;
            }
            
            if ( ! this.aiming && this.attacking)
            {
                this.attacking = false;
            }
            
            if (this.attacking)
            {
                if (this.attackTimer)
                {
                    // attack again when the timer ends
                    if (this.attackTimer.delta() > 0)
                    {
                        this.attackTimer = null;
                        //this.startAttack();
                    }
                }
                else
                {
                    this.startAttack();
                    this.attackTimer = new ig.Timer(this.timeAttack);
                }
            }
            
        },
        
        // check if idling
        isIdling: function() {
            
            if (this.hurting || this.dying || this.aiming || this.attacking)
            {
                return;
            }
            
            this.angle += 0.01;
            
        },
        
        // update entity animation
        animate: function() {
            
            // update entitiy opacity
            if (this.hurting)
            {
                this.currentAnim.alpha = 0.5;
            }
            else if (this.currentAnim.alpha < 1)
            {
                this.currentAnim.alpha = 1;
            }
            
            // update animation state
            if (this.dying)
            {
                if (this.currentAnim != this.anims.dead)
                {
                    this.currentAnim = this.anims.dead.rewind();
                }
            }
            else if (this.hurting)
            {
                if (this.currentAnim != this.anims.hurt)
                {
                    this.currentAnim = this.anims.hurt.rewind();
                }
            }
            else if (this.aiming || this.attacking)
            {
                if (this.currentAnim != this.anims.attack)
                {
                    this.currentAnim = this.anims.attack.rewind();
                }
            }
            else
            {
                if (this.currentAnim != this.anims.idle)
                {
                    this.currentAnim = this.anims.idle.rewind();
                }
            }
            
            // update facing direction
            this.currentAnim.flip.x = this.flip;
            
            // update angle
            this.currentAnim.angle = this.angle;
            
        },
        
        // shot a projectile
        startAttack: function() {
            
            var xPos = this.pos.x;
            var yPos = this.pos.y;
            ig.game.spawnEntity(EntityTurrentShot, xPos, yPos);
            
        },
        
        // check if this entity needs repositioned
        checkPosition: function() {
            
            // if this entity has moved off the map
            if (this.pos.x < ig.game.camera.offset.x.min)
            {
                this.pos.x = (ig.game.collisionMap.pxWidth - ig.game.camera.offset.x.max - (this.size.x * 2));
            }
            else if ((this.pos.x + this.size.x) > (ig.game.collisionMap.pxWidth - ig.game.camera.offset.x.max))
            {
                this.pos.x = (ig.game.camera.offset.x.min + this.size.x);
            }
            
            // if this entity has fallen off the map
            if (this.pos.y > ig.game.collisionMap.pxHeight)
            {
                this.pos.y = 0;
            }
            else if (this.pos.y < 0)
            {
                this.pos.y = (ig.game.collisionMap.pxHeight - 10);
            }
            
        },
        
        // called when overlapping with an entity whose .checkAgainst property matches this entity
        receiveDamage: function(amount, from) {
        
            if (this.hurting || this.dying)
            {
                return;
            }
            
            /*
            // reduce health
            this.health -= amount;
            
            // if dead
            if (this.health <= 0)
            {
                this.vel.x = 0;
                this.vel.y = 0;
                this.maxVel.x = 0;
                this.maxVel.y = 0;
                this.dying = true;
                return true;
            }
            
            // update state
            this.hurting = true;
            
            // apply knockback
            this.vel.x = (from.pos.x > this.pos.x) ? -200 : 200;
            this.vel.y = -150;
            */
            
            return true;
            
        },
        
    });
});