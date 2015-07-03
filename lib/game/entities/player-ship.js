ig.module(
    'game.entities.player-ship'
)
.requires(
    'impact.entity'
)
.defines(function() {
    EntityPlayerShip = ig.Entity.extend({
        
        size: {x: 150, y: 60},
        offset: {x: 0, y: 0},
        maxVel: {x: 0, y: 0},
        friction: {x: 0, y: 0},
        gravityFactor: 0,
        animSheet: new ig.AnimationSheet('media/player-ship.png', 150, 60),
        
        type: ig.Entity.TYPE.NONE,
        checkAgainst: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.NONE,
        
        init: function(x, y, settings) {
            this.parent(x, y);
            this.addAnim('idle', 1, [0], true);
        },
        
        update: function() {
            this.parent();
        },
        
        draw: function() {
            this.parent();
        },
        
    });
});