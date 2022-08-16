
// The following code should help you start things off. Learn more 
// in the Documentation   

// ---------- ---------- ---------- ---------- ---------- 
// ---------- ---------- ---------- ---------- ---------- 

// Simple function for comparing distances  
function dist_sq(coor1, coor2) {
    let a = coor1[0] - coor2[0];
    let b = coor1[1] - coor2[1];

    return a*a + b*b;
}

function dist_sqrt(...coords) {
    return Math.sqrt(dist_sq(...coords));
}

function divide_section(coor1, coor2, segmentNo, segmentCount) {
    const [x1, y1] = coor1;
    const [x2, y2] = coor2;
    
    const x = x1 - (x1 - x2) / segmentCount * segmentNo;
    const y = y1 - (y1 - y2) / segmentCount * segmentNo;

    return [x, y];
}

function eq_pos(coor1, coor2) {
    const [x1, y1] = coor1;
    const [x2, y2] = coor2;
    
    return x1 === x2 && y1 === y2;
}

// Marking whether my base is at the top starting position or bottom
var my_base = base_zxq;
var enemy_base = base_a2c;
var my_star = star_zxq;
var enemy_star = star_a2c;

if (base_a2c.control == this_player_id){
    my_base = base_a2c;
    enemy_base = base_zxq;
}

if (dist_sq(star_a2c.position, my_base.position) < dist_sq(star_zxq.position, my_base.position)){
    my_star = star_a2c;
    enemy_star = star_zxq;
}

// ---------- ---------- ---------- ---------- ---------- 
// ---------- ---------- ---------- ---------- ---------- 




var count = 3;
var my_spirits_alive = my_spirits.filter(spirit => spirit.hp > 0);
var power_spirits = [];


for (let i = 0; i < my_spirits_alive.length / count; i++) {
    power_spirits[i] = my_spirits_alive.slice(i * count, i * count + count);
}

// var other_spirits = my_spirits_alive.slice(count);

// my_spirits_alive.forEach(spirit => spirit.shout(spirit.mark.toString()));
// my_spirits_alive.forEach(spirit => spirit.shout('P' + power_spirits[0].length.toString()));

power_spirits.forEach((pspirits, pindex) => {
    pspirits.forEach((spirit, index) => {
        memory[spirit.id] = {
            index,
            pindex: pindex * count + index,
            position: divide_section(my_star.position, my_base.position, index + 1, count + 1),
        }
        
        if (!spirit.mark) {
            spirit.set_mark('move');
            spirit.shout('hello!');
        }
    });
});

power_spirits.forEach(pspirits => {
    pspirits.forEach((spirit, index) => {
        // spirit.shout(spirit.mark.toString());
    });
    
});

power_spirits.forEach(pspirits => {
    pspirits.forEach((spirit, index) => {
        // spirit.shout(Math.sqrt(dist_sq(my_base.position, my_star.position)).toString());
        // spirit.shout(spirit.id);
        const myIndex = memory[spirit.id]?.index || 0;
        const myPIndex = memory[spirit.id]?.pindex || 0;
        const capacity = spirit.energy / spirit.energy_capacity;
        
        switch (spirit.mark) {
            case 'move':
                const position = memory[spirit.id]?.position || [0, 0];
                spirit.move(position);
                
                if (eq_pos(spirit.position, position)) {
                    spirit.set_mark('lock');
                }
    
                break;
            case 'lock':
                spirit.lock();
                spirit.set_mark('harvest');
                
                break;
            case 'harvest':
                if (myIndex === count - 1) {
                    spirit.energize(my_base);
                } else if (myIndex === 0 && capacity < .5) {
                    spirit.set_mark('self_harvest');
                } else {
                    spirit.sight.friends_beamable.forEach(id => {
                        if (memory[id]?.pindex === myPIndex + 1) {
                            spirit.energize(spirits[id]);
                            spirit.shout(id);
                        }
                    })    
                }
    
                break;
            case 'self_harvest':
                if (capacity < .9 && my_star.energy > 950) {
                    spirit.energize(spirit);
                } else {
                    spirit.set_mark('harvest');
                }
    
                break;
        }
        
        return true;
    });
});

// Loop through all my spirits and making a state machine — if the
// spirit is empty, go harvest energy. If full, give it to the base
for (let spirit of []){
    if (spirit.energy == spirit.energy_capacity)
        spirit.set_mark('charging');
    if (spirit.energy == 0) {
        // spirit.set_mark('harvesting');
        
        if (my_spirits.length > 25) {
            if (!memory[spirit.id]) {
                memory[spirit.id] = Math.random() < 0.2 ? Math.random() < 0.4 ? my_star : star_p89 : star_nua;
            }
        }
        
        if (my_spirits.length > 10) {
            if (!memory[spirit.id]) {
                memory[spirit.id] = Math.random() < 0.5 ? star_nua : star_p89;
            }
        }
        
        if (!memory[spirit.id]) {
            memory[spirit.id] = my_star;
        }
    }
    
    const target_star = memory[spirit.id] || my_star;
  
    if (spirit.mark == 'charging'){
        spirit.move(my_base.position);
        spirit.energize(my_base);
    }
    if (spirit.mark == 'harvesting'){
        spirit.move(target_star.position);
        const power_level = target_star.energy / target_star.energy_capacity
        const power_target = (my_spirits.length > 10 ? .97 : .2);

        if (power_level > power_target) {
            spirit.energize(spirit);   
        }
    }

    // Rather bad code to deal with attackers. Improve it!
    if (my_base.sight.enemies.length > 0){
        //spirit objects are accessed by spirits['id']
        let enemy = spirits[my_base.sight.enemies[0]];
        spirit.move(enemy.position);
        spirit.energize(enemy);
    }
    
    // the last action (move, energize, ...) will overwrite any previous ones
    // in the same tick
}