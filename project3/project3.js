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
    Bodies = Matter.Bodies;

// create an engine
let myEngine = Engine.create(),
    myWorld = myEngine.world;

// create a renderer
let myRender = Render.create({
    element: document.getElementById("playarea"),
    engine: myEngine
});

// create a box and a ground
let boxA = Bodies.rectangle(400, 100, 250, 40);
let dropped = false;
let ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });
//let wallA = Bodies.rectangle(0, 400, 60, 810, { isStatic: true });
//let wallB = Bodies.rectangle(800, 400, 60, 810, { isStatic: true });

// other variables
let stack = [boxA];
let boxCount = 1;
let timer = 0;

// DOM variables

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
myMouseConstraint = MouseConstraint.create(myEngine, {
    mouse: myMouse,
    constraint: {
        stiffness: 0.2,
        render: {
            visible: false
        }
    }
});

World.add(myWorld, myMouseConstraint);

// keep the mouse in sync with rendering
myRender.mouse = myMouse;

/***********
EVENTS/LOOPS
***********/

// primary game loop
Events.on(myEngine, 'afterUpdate', function(event) {
    let myTime = myEngine.timing.timestamp;

    if(!dropped && boxCount == 1) {
        float(boxA, myTime);
    }

    if(boxCount == 2 && !dropped) {
        //Body.setPosition(ground.position.x, boxA.position.x);
        //Body.scale(ground, 810/250, 1);
    }

    if(timer >= 60 * 1.5 && dropped) {
        stack.push(Bodies.rectangle(400, 100, 250, 40));
        boxCount++;
        stack[boxCount - 1].sleepThreshold = 120;
        World.add(myWorld, stack[boxCount - 1]);
        console.log("Box spawned at index " + boxCount);
        dropped = false;
        timer = 0;
        stack[boxCount - 2].isStatic = true;
        console.log("Box at index " + (boxCount - 1) + " set to static");
    }
    else if(boxCount > 1 && !dropped){
        float(stack[boxCount - 1], myTime);
        Body.setAngularVelocity(stack[boxCount - 1], 0);
        stack[boxCount - 1].velocity.y = 0;
    }

    /*if(stack[boxCount - 1].isSleeping){
        stack[boxCount - 1].isStatic = true;
        console.log("Box at index " + stack[boxCount - 1] + " set to static");
    }*/
    
    $("#footer").html(stack[boxCount - 1].angularVelocity);

    timer++;
});

// mouse event handler
Events.on(myMouseConstraint, 'mousedown', function(event) {
    
    if(timer >= 60 * 1.5) {
        dropped = true;
        timer = 0;
        console.log("Box dropped");
    }
});

/********
FUNCTIONS
********/

function float(rect, time) {
    let px = 400 + 200 * Math.sin(time * 0.00066);
    Body.setVelocity(rect, { x: rect.velocity.x, y: 0 });
    Body.setPosition(rect, { x: px, y: 100 });
}
