function start_scene() {
    let startBtn;

    this.setup = function() {
        startBtn = createButton("START");
        startBtn.position(width / 2 - 60, height / 2 + 40);
        startBtn.size(120, 50);
        startBtn.mousePressed(() => {
            startBtn.remove();
            this.sceneManager.showScene(first_scene);
        });
    }

    this.draw = function() {
        background(12, 14, 20);
        fill(240, 236, 230);
        textAlign(CENTER, CENTER);
        textSize(64);
        textFont("Georgia");
        textStyle(BOLD);
        text("THE INFERNO", width / 2, height / 2 - 40);
    }
}