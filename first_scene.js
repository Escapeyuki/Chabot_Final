function first_scene() {
    const dialogue = [
        { speaker: "???", text: "Complete darkness." },
        { speaker: "???", text: "Then, the sound." },
        { speaker: "???", text: "Something mechanical. Something enormous." },
        { speaker: "???", text: "Metal against metal, endless," },
        { speaker: "???", text: "like a heartbeat that belongs to something far bigger than a heart." },
        { speaker: "???", text: "There is rain outside." },
        { speaker: "???", text: "Droplets hit the window with a rhythmic pattern." },
        { speaker: "???", text: "I barely open my eyes." },
        { speaker: "???", text: "The ceiling, grey, some water stains in the upper left corner." },
        { speaker: "???", text: "Where, where am I?" },
        { speaker: "???", text: "Motherfucker we are in hell." },
        { speaker: "???", text: "After I gathered my composure again," },
        { speaker: "???", text: "I sit up, and looked around." },
        { speaker: "???", text: "The room is unexpectedly quite spacious. A bed, a window, a desk. Functional to say the least, but nowhere near cozy." },
        { speaker: "???", text: "There is a small piece of paper on the desk." },
        { speaker: "???", text: "Well, there isn't any other things or creatures that interest me." },
        { speaker: "???", text: "..." },
        { speaker: "???", text: "A... A ticket?" },
        { speaker: "???", text: '"Mike"' },
        { speaker: "???", text: "Just Mike? Is that my name." },
        { speaker: "Mike", text: "I, I don't understand." },
        { speaker: "Mike", text: "I don't know this train, I don't know this room." },
        { speaker: "Mike", text: "I'm not ready for this yet. Is this the afterlife, or is this hell?" },
        { speaker: "Mike", text: "There are just so many questions." },
        { speaker: "Mike", text: "It is like a creation from above." },
        { speaker: "Mike", text: "The same for my heart. Racing." },
        { speaker: "Mike", text: "I stood. The hum travels up through my feet, into my legs, into my chest." },
        { speaker: "Mike", text: "Clank, Clank, Clank." },
        { speaker: "Mike", text: "..." },
        { speaker: "Mike", text: "The train breathes it into me whether I want it to or not." },
        { speaker: "Mike", text: "There is a door." },
        { speaker: "Mike", text: "I take one breath." },
        { speaker: "Mike", text: "Then I walk toward it." },
    ]

    const layout = {
        boxHeight: 0.28,
        boxMargin: 0.05,
        boxPadding: 0.03,
        textSizeRatio: 0.032,
        nameSize: 0.026,
    }

    this.getLayout = function() {
        return {
            boxH: height * layout.boxHeight,
            boxM: width * layout.boxMargin,
            boxP: width * layout.boxPadding,
            txtSize: height * layout.textSizeRatio,
            nmSize: height * layout.nameSize,
        }
    }

    this.setup = function() {
        bgImages[0] = loadImage("assets/first.jpg")
        bgImages[1] = loadImage("assets/second2.png")
        bgImages[2] = loadImage("assets/third.jpg")
        textFont("Georgia");
        this.startLine(lineIndex);
        
    }



    let bgImages = []

    // this.preload = function() {
    //     bgImages[0] = loadImage("first.jpg")
    //     bgImages[1] = loadImage("second.jpg")
    //     bgImages[2] = loadImage("third.jpg")
    // }

    this.getSceneIndex = function(idx) {
        if (idx <= 7) return 0;
        if (idx <= 25) return 1;
        return 2;
    }
    let isTyping = false
    let isFinished = false
    let charIndex = 0
    let displayText = ""
    const typingSpeed = 2
    let lineIndex = 0;

    this.draw = function() {
        console.log(bgImages[0], this.getSceneIndex(lineIndex));
        this.drawBackground();
        if (isTyping) {
            const full = dialogue[lineIndex].text;
            charIndex = min(charIndex + typingSpeed, full.length);
            displayText = full.substring(0, charIndex)
            if (charIndex >= full.length) isTyping = false;
        }
        
        this.drawDialogueBox();
    }



    this.drawBackground = function() {
        
        const scene = this.getSceneIndex(lineIndex);
        const img = bgImages[scene]
        if (img) {
            image(img, 0, 0, width, height);
            
        } else {
            background(0)
        }
    }

    this.drawDialogueBox = function() {
        if (isFinished) { this.drawFinished(); return; }
        const { boxH, boxM, boxP, txtSize, nmSize } = this.getLayout();
        const boxY = height - boxH - boxM;
        const boxW = width - boxM * 2;
        const line = dialogue[lineIndex];

        noStroke()
        fill(204, 47, 68, 210)
        rect(boxM, boxY, boxW, boxH, 10);
        
        if (line.speaker) {
            textSize(nmSize)
            textStyle(BOLD)
            const nameW = textWidth(line.speaker) + boxP * 2
            const tagH = nmSize * 2
            
            
            rect(boxM + boxP, boxY - tagH, nameW, tagH, 6, 6, 0, 0)
            fill(0)
            text(line.speaker, boxM + boxP * 1.5, boxY - tagH * 0.25)
            
        }
        fill(0)
        textSize(txtSize);
        textStyle(NORMAL);
        textLeading(txtSize * 1.55)
        text(
            displayText,
            boxM + boxP,
            boxY + boxP + txtSize,
            boxW - boxP * 2,
            boxH - boxP * 2,
            
        );
    }


    this.keyPressed = function() {
        if (key == ' ') {
            if (isFinished) return;
            if (isTyping) {
                charIndex = dialogue[lineIndex].text.length;
                displayText = dialogue[lineIndex].text;
                isTyping = false;
            } else {
                lineIndex++;
                this.startLine(lineIndex);
            }
        }
    
    }
    
    this.startLine = function(index) {
        if(index >= dialogue.length) {isFinished = true; return; }
        charIndex = 0;
        displayText = "";
        isTyping = true;
    }

    this.drawFinished = function() {
        background(0);
        const btnW = 220, btnH = 48;
        const btnX = width - btnW - 40;
        const btnY = height - btnH - 40;

        const hovering = mouseX > btnX && mouseX < btnX + btnW &&
                        mouseY > btnY && mouseY < btnY + btnH;

        fill(hovering ? 180 : 204, hovering ? 30 : 47, hovering ? 50 : 68);
        noStroke();
        rect(btnX, btnY, btnW, btnH, 8);

        fill(255);
        noStroke();
        textSize(16);
        textStyle(NORMAL);
        textAlign(CENTER, CENTER);
        text("Continue to next scene →", btnX + btnW / 2, btnY + btnH / 2);
        textAlign(LEFT, BASELINE);
    }

    this.mouseClicked = function() {
        if (!isFinished) return;

    const btnW = 220, btnH = 48;
    const btnX = width - btnW - 40;
    const btnY = height - btnH - 40;

    if (mouseX > btnX && mouseX < btnX + btnW &&
        mouseY > btnY && mouseY < btnY + btnH) {
        this.sceneManager.showScene(chatbot);
    }
        
    }
}

