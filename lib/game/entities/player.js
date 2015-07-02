ig.module(
    'game.entities.player'
)
.requires(
    'impact.entity'
)
.defines(function() {
    EntityPlayer = ig.Entity.extend({
        
        size: {x: 4, y: 10},
        offset: {x: 6, y: 5},
        maxVel: {x: 500, y: 500},
        friction: {x: 0, y: 0},
        flip: false,
        speed: 100,
        jump: 160,
        health: 6,
        gravityFactor: 0,
        reverseGravity: 1,
        isInvincible: false,
        animSheet: new ig.AnimationSheet('media/player.png', 15, 15),
        
        walking: false,
        jumping: true,
        falling: false,
        hurting: false,
        dying: false,
        attacking: false,
        
        type: ig.Entity.TYPE.A, // add to friendly group
        checkAgainst: ig.Entity.TYPE.NONE, // check collisions against nothing
        collides: ig.Entity.COLLIDES.PASSIVE,
        
        init: function(x, y, settings) {
        
            this.parent(x, (y - this.size.y), settings);
            
            // add the animations
            this.addAnim('idle', 1, [0], true);
            this.addAnim('walk', 0.3, [1,2,1,3], false);
            this.addAnim('jump', 1, [4], true);
            this.addAnim('fall', 1, [4], true);
            this.addAnim('hurt', 1, [0], true);
            this.addAnim('dead', 1, [0], true);
            this.addAnim('attack', 1, [0], true);
            
            // game instance of this entity
            ig.game.player = this;
            
        },
        
        update: function() {
            
            if (ig.game.isPaused)
            {
                return;
            }
            
            this.checkStatus();
            this.checkPosition();
            this.parent();
            
            this.gravityFactor = (this.hasGravity ? (1 * this.reverseGravity) : 0);
            //this.hasGravity = false;
            
        },
        
        checkStatus: function() {
        
            // update direction facing
            if ( ! this.hurting && ! this.dying)
            {
                if (ig.input.state('left'))
                {
                    this.flip = true;
                }
                else if (ig.input.state('right'))
                {
                    this.flip = false;
                }
            }
            
            // toggle invincibility
            if (ig.input.pressed('invincible'))
            {
                this.isInvincible = this.isInvincible ? false : true;
            }
            
            // shift player's gravity
            if (ig.input.pressed('space'))
            {
                this.reverseGravity = (this.reverseGravity >= 1 ? -1 : 1);
                this.updateCollisionBox();
            }
            
            // check entity status
            this.isHurting();
            this.isAttacking();
            this.isJumping();
            this.isMoving();
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
        
        // check if attacking
        isAttacking: function() {
            
            if (this.hurting || this.dying)
            {
                this.attacking = false;
                return;
            }
            
        },
        
        // check if jumping
        isJumping: function() {
            
            if (this.hurting || this.dying)
            {
                this.jumping = false;
                this.falling = false;
                return;
            }
            
            // if standing on something and just pressed "JUMP" button
            if (this.standing && ig.input.pressed('jump'))
            {
                this.jumping = true;
                this.vel.y = -(this.jump * this.reverseGravity);
                return;
            }
            
            // reduce jumping height
            if (this.jumping && ig.input.released('jump'))
            {
                this.vel.y = ((this.vel.y / 2));
            }
            
            // if falling
            if (this.vel.y > 0 && ! this.standing)
            {
                this.falling = true;
                return;
            }
            
            // if standing on something while jumping/falling
            if ((this.jumping || this.falling) && this.standing)
            {
                this.jumping = false;
                this.falling = false;
            }
        },
        
        // checking if idle or moving left/right
        isMoving: function() {
        
            if (this.hurting || this.dying)
            {
                this.walking = false;
                return;
            }
            
            if (this.hasGravity)
            {
                if (ig.input.state('left'))
                {
                    this.walking = true;
                    this.vel.x = -this.speed;
                }
                else if (ig.input.state('right'))
                {
                    this.walking = true;
                    this.vel.x = this.speed;
                }
                else
                {
                    this.walking = false;
                    this.vel.x = 0;
                }
            }
            else
            {
                this.walking = false;
                
                if (ig.input.state('left'))
                {
                    this.jumping = true;
                    this.vel.x = -this.speed;
                }
                else if (ig.input.state('right'))
                {
                    this.jumping = true;
                    this.vel.x = this.speed;
                }
                else
                {
                    this.vel.x = 0;
                }
                
                if (ig.input.state('up'))
                {
                    this.jumping = true;
                    this.vel.y = -this.speed;
                }
                else if (ig.input.state('down'))
                {
                    this.jumping = true;
                    this.vel.y = this.speed;
                }
                else
                {
                    this.vel.y = 0;
                }
            }
            
        },
        
        // update entity animation
        animate: function() {
            
            // update entitiy opacity
            if (this.hurting || this.isInvincible)
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
            else if (this.attacking)
            {
                if (this.currentAnim != this.anims.attack)
                {
                    this.currentAnim = this.anims.attack.rewind();
                }
            }
            else if (this.jumping || this.falling)
            {
                if (this.currentAnim != this.anims.jump)
                {
                    this.currentAnim = this.anims.jump.rewind();
                }
            }
            else if (this.walking)
            {
                if (this.currentAnim != this.anims.walk)
                {
                    this.currentAnim = this.anims.walk.rewind();
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
            
            this.currentAnim.flip.y = (this.reverseGravity > 0 ? false : true);
            
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
        
        gravityOn: function() {
            this.hasGravity = true;
        },
        
        gravityOff: function() {
            this.hasGravity = false;
        },
        
        handleMovementTrace: function(res) {
            this.parent(res);
            
            if (res.collision.y)
            {
                // helps with ceiling collision
                if (this.vel.y == 0)
                {
                    this.standing = true;
                }
            }
        },
        
        // update the size of the collision box
        updateCollisionBox: function() {
        
            if (this.reverseGravity < 0)
            {
                this.size.x = 4;
                this.size.y = 10;
                this.offset.x = 6;
                this.offset.y = 0;
            }
            else
            {
                this.size.x = 4;
                this.size.y = 10;
                this.offset.x = 6;
                this.offset.y = 5;
            }
            
        },
        
        // called when overlapping with an entity whose .checkAgainst property matches this entity
        receiveDamage: function(amount, from) {
        
            if (this.hurting || this.dying || this.isInvincible)
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
            
        }
        
    });
});