ig.module(
    'game.entities.gravity-off'
)
.requires(
    'impact.entity'
)
.defines(function() {
    EntityGravityOff = ig.Entity.extend({
        
        size: {x: 10, y: 10},
        offset: {x: 0, y: 0},
        maxVel: {x: 0, y: 0},
        
        checkAgainst: ig.Entity.TYPE.A,
        collides: ig.Entity.COLLIDES.NONE,
        
        _wmDrawBox: true,
        _wmScalable: true,
        _wmBoxColor: 'rgba(0, 255, 255, 0.7)',
        
        init: function(x, y, settings) {
            this.parent(x, y, settings);
        },
        
        // called when overlapping with ig.Entity.TYPE.A entities
        check: function(other) {
            if (other.gravityOff)
            {
                other.gravityOff();
            }
        },
        
    });
});