/*INDEX*/



/**************
MATTER.JS SETUP
**************/

//Following is adapted from https://github.com/liabru/matter-js/wiki/Getting-started
// module aliases
let Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Events = Matter.Events,
    Composite = Matter.Composite,
    Composites = Matter.Composites,
    Common = Matter.Common,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    World = Matter.World,
    Body = Matter.Body,
    Bodies = Matter.Bodies,
    Vector = Matter.Vector;

// create an engine
let myEngine = Engine.create(),
    myWorld = myEngine.world;

// create a renderer
let myRender = Render.create({
    element: document.getElementById("playarea"),
    engine: myEngine
});

// create a box and a ground
let color1 = "#eeeeee";
let color2 = "#888888";
let color = color1;
let boxA = Bodies.rectangle(400, 100, 250, 40, { label: 'rect', render: { fillStyle: color1, lineWidth: 10 }});
let dropped = false;
let ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true, label: 'ground' });

// other variables
let stack = [boxA];
let boxCount = 1;
let width = 250;
let timer = 0;
let speed = 0.00066;
let score = 0;

// add all of the bodies to the world
World.add(myWorld, [boxA, ground]);

// run the engine
Engine.run(myEngine);

// run the renderer
Render.run(myRender);

// starter the runner
let myRunner = Runner.create();
Runner.run(myRunner, myEngine);

// add mouse control
let myMouse = Mouse.create(myRender.canvas),
myMouseConstraint = MouseConstraint.create(myEngine);

World.add(myWorld, myMouseConstraint);

// keep the mouse in sync with rendering
myRender.mouse = myMouse;

/***********
EVENTS/LOOPS
***********/

// primary game loop
Events.on(myEngine, 'afterUpdate', function(event) {
    let myTime = myEngine.timing.timestamp;

    // float the first box
    if(!dropped && boxCount == 1) {
        float(boxA, myTime);
    }

    // after a drop, create a new box and add it to the world and stack, then prep for next drop
    if(timer >= 60 * 1.5 && dropped) {
        if(boxCount % 2) color = color1;
        else color = color2;
        stack.push(Bodies.rectangle(400, 100, width, 40, { label: 'rect', render: { fillStyle: color, lineWidth: 10 }}));
        boxCount++;
        stack[boxCount - 1].sleepThreshold = 120;
        World.add(myWorld, stack[boxCount - 1]);
        console.log("Box spawned at index " + boxCount);
        dropped = false;
        timer = 0;
        stack[boxCount - 2].isStatic = true;
        console.log("Box at index " + (boxCount - 1) + " set to static");
    }

    // float all following boxes, velocities tend to spazz out if not controlled here
    else if(boxCount > 1 && !dropped){
        float(stack[boxCount - 1], myTime);
        Body.setAngularVelocity(stack[boxCount - 1], 0);
        stack[boxCount - 1].velocity.y = 0;
    }
    
    $("#score").html("Score: " + score);

    timer++;
});

// mouse event handler
Events.on(myMouseConstraint, 'mousedown', function(event) {
    
    // only trigger every 1.5 seconds
    if(timer >= 60 * 1.5) {
        dropped = true;
        timer = 0;
        console.log("Box dropped");
    }
});

// collision event handler
Events.on(myEngine, 'collisionStart', function(event) {
    let pairs = event.pairs;
    
    for (let i = 0, j = pairs.length; i != j; ++i) {
        let pair = pairs[i];

        // if two boxes proprely collide, call collide
        if (pair.bodyA.label === 'rect' && pair.bodyB.label === 'rect') {
            if(pair.bodyA.position.y > pair.bodyB.position.y) {
                collide(pair.bodyB, pair.bodyA);
            }
        }

        // reset if box misses
        if (pair.bodyB.label === 'rect' && boxCount > 1 && stack[boxCount - 1].position.y >= stack[boxCount - 2].position.y - 5){
            setTimeout(function(){ reset(); }, 500);
        }
    }
});

/********
FUNCTIONS
********/

// move non-dropped box back and forth at given speed
function float(rect, time) {
    let px = 400 + 200 * Math.sin(time * speed);
    Body.setVelocity(rect, { x: rect.velocity.x, y: 0 });
    Body.setPosition(rect, { x: px, y: 100 });
}

// make changes and calculations needed for two boxes colliding
function collide(top, bottom) {

    // stop all movement
    top.isStatic = true;
    
    // if left of previous rectangle, cut off extra on the left
    if(bottom.bounds.min.x > top.bounds.min.x) {
        // 1 - difference / width = scale
        targetScale = 1 - ((bottom.bounds.min.x - top.bounds.min.x) / width);
        // Move top position to ajust for scale
        targetPos = (bottom.bounds.min.x - top.bounds.min.x) / 2 + top.position.x;
        console.log("Difference of " + (bottom.bounds.min.x - top.bounds.min.x) + " in collision");
        console.log("Width scale of " + targetScale);

        Body.scale(top, targetScale, 1);
        Body.setPosition(top, { x: targetPos, y: top.position.y } );
        width = top.bounds.max.x - bottom.bounds.min.x;
        console.log("Width set to " + width);
    }

    // if right of previous rectangle, cut off extra on the right
    else if(bottom.bounds.max.x < top.bounds.max.x) {
        // 1 - difference / width = scale
        targetScale = 1 - ((top.bounds.min.x - bottom.bounds.min.x) / width);
        // Move top position to ajust for scale
        targetPos = top.position.x - ((top.bounds.min.x - bottom.bounds.min.x) / 2);
        console.log("Difference of " + (top.bounds.min.x - bottom.bounds.min.x) + " in collision");
        console.log("Width scale of " + targetScale);

        Body.scale(top, targetScale, 1);
        Body.setPosition(top, { x: targetPos, y: top.position.y } );
        width = bottom.bounds.max.x - top.bounds.min.x;
        console.log("Width set to " + width);
    }

    // calculate earned points and add to score, higher stacks and smaller widths mean higher scores
    let points = Math.floor(40 + (5 * boxCount) * (250 / width));
    score += points;
}

function reset() {
    // hard page reset not optimal, best solution I could manage in the time I had
    location = location;

    //previous attempt at reseting, works on first reset, but game is broken afterwords

    /*for(let i = boxCount - 1; i > 0; i--){
        World.remove(myWorld, stack[i]);
        stack.pop();
    }
    Common._nextId = 0;
    Common._seed = 0;
    World.clear(myWorld);
    Engine.clear(myEngine);
    myEngine.events = {};
    Runner.stop(myRunner);
    Runner.run(myRunner, myEngine);
    boxCount = 1;
    width = 250;
    timer = 0;
    speed = 0.00066;
    stack = [boxA];
    World.add(myWorld, [boxA, ground]);
    dropped = false;*/
}

/***********
JQUERY CALLS
***********/
