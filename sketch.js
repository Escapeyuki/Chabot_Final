let mgr;

function setup() {
    createCanvas(windowWidth, windowHeight);
    mgr = new SceneManager();
    mgr.wire();

    //add the scene
    mgr.showScene(first_scene);
}

function draw() {
    mgr.draw();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


