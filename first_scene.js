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


    const theme = {
        panelFill:     [18, 20, 28, 215],   // dark translucent navy-black
        panelStroke:   [220, 220, 230, 40], // subtle inner border
        accent:        [204, 47, 68],       // signature red (now an accent)
        accentSoft:    [204, 47, 68, 180],
        textColor:     [240, 236, 230],     // warm off-white
        nameColor:     [255, 255, 255],
        metaColor:     [180, 175, 165, 180],
    }

    const layout = {
        boxHeight: 0.26,
        boxMargin: 0.05,
        boxPadding: 0.035,
        textSizeRatio: 0.030,
        nameSize: 0.024,
        metaSize: 0.016,
    }

    this.getLayout = function() {
        return {
            boxH: height * layout.boxHeight,
            boxM: width * layout.boxMargin,
            boxP: width * layout.boxPadding,
            txtSize: height * layout.textSizeRatio,
            nmSize: height * layout.nameSize,
            metaSize: height * layout.metaSize,
        }
    }

    this.setup = function() {
        bgImages[0] = loadImage("assets/first.jpg")
        bgImages[1] = loadImage("assets/celling.jpg")
        bgImages[2] = loadImage("assets/second2.png")
        bgImages[3] = loadImage("assets/ticket.png")
        bgImages[4] = loadImage("assets/third.jpg")
        textFont("Georgia");
        this.startLine(lineIndex);
    }

    let bgImages = []

    this.getSceneIndex = function(idx) {
        if (idx <= 6) return 0;
        if (idx <= 9) return 1;
        if (idx <= 15) return 2;
        if (idx <= 24) return 3
        return 4;
    }

    let isTyping = false
    let isFinished = false
    let charIndex = 0
    let displayText = ""
    const typingSpeed = 2
    let lineIndex = 0;
    let lineStartTime = 0;   // for fade-in of new lines

    // Continue button dimensions (used by both drawFinished and mouseClicked)
    const btnW = 240, btnH = 52;
    this.getContinueButtonBounds = function() {
        return {
            btnW,
            btnH,
            btnX: width / 2 - btnW / 2,
            btnY: height / 2 - btnH / 2,
        };
    }

    this.draw = function() {
        this.drawBackground();

        // subtle vignette for cinematic depth
        this.drawVignette();

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

    this.drawVignette = function() {
        // soft dark gradient from edges for focus & text readability
        noStroke();
        // bottom darken for dialogue legibility
        for (let i = 0; i < 120; i++) {
            fill(0, 0, 0, i * 1.2);
            rect(0, height - i * 3, width, 3);
        }
    }

    this.drawDialogueBox = function() {
        if (isFinished) { this.drawFinished(); return; }
        const { boxH, boxM, boxP, txtSize, nmSize, metaSize } = this.getLayout();
        const boxY = height - boxH - boxM;
        const boxW = width - boxM * 2;
        const line = dialogue[lineIndex];

        // ---- Fade-in for the panel contents ----
        const fadeMs = 220;
        const elapsed = millis() - lineStartTime;
        const fade = constrain(elapsed / fadeMs, 0, 1);

        // ---- Soft shadow under panel ----
        noStroke();
        for (let i = 6; i >= 0; i--) {
            fill(0, 0, 0, 8 + i * 4);
            rect(boxM - i, boxY - i, boxW + i * 2, boxH + i * 2, 14);
        }

        // ---- Main dark panel ----
        fill(theme.panelFill[0], theme.panelFill[1], theme.panelFill[2], theme.panelFill[3]);
        rect(boxM, boxY, boxW, boxH, 12);

        // ---- Inner border (very subtle) ----
        noFill();
        stroke(theme.panelStroke[0], theme.panelStroke[1], theme.panelStroke[2], theme.panelStroke[3]);
        strokeWeight(1);
        rect(boxM + 1, boxY + 1, boxW - 2, boxH - 2, 11);
        noStroke();

        // ---- Accent: thin red vertical bar on left inside panel ----
        fill(theme.accent[0], theme.accent[1], theme.accent[2], 220);
        rect(boxM + boxP * 0.55, boxY + boxP, 3, boxH - boxP * 2, 2);

        // ---- Name tag (floating above panel, left side) ----
        if (line.speaker) {
            textSize(nmSize);
            textStyle(BOLD);
            const speakerDisplay = line.speaker;
            const nameW = textWidth(speakerDisplay) + boxP * 2.2;
            const tagH = nmSize * 2.0;
            const tagX = boxM + boxP * 0.5;
            const tagY = boxY - tagH + 2; // slight overlap onto panel

            // tag shadow
            fill(0, 0, 0, 80);
            rect(tagX + 2, tagY + 2, nameW, tagH, 8, 8, 0, 0);

            // tag body (dark, matches panel)
            fill(theme.panelFill[0], theme.panelFill[1], theme.panelFill[2], 235);
            rect(tagX, tagY, nameW, tagH, 8, 8, 0, 0);

            // accent underline on tag
            fill(theme.accent[0], theme.accent[1], theme.accent[2]);
            rect(tagX, tagY + tagH - 2, nameW, 2);

            // name text — italic for unknown "???"
            fill(theme.nameColor[0], theme.nameColor[1], theme.nameColor[2]);
            if (line.speaker === "???") {
                textStyle(ITALIC);
            } else {
                textStyle(BOLD);
            }
            textAlign(LEFT, CENTER);
            text(speakerDisplay, tagX + boxP * 1.1, tagY + tagH / 2);
            textAlign(LEFT, BASELINE);
        }

        // ---- Dialogue text ----
        const textX = boxM + boxP * 1.8; // leave room for the accent bar
        const textY = boxY + boxP + txtSize * 0.3;
        const textW = boxW - boxP * 2.8;
        const textH = boxH - boxP * 2;

        // subtle shadow for readability
        fill(0, 0, 0, 180 * fade);
        textSize(txtSize);
        textStyle(NORMAL);
        textLeading(txtSize * 1.55);
        text(displayText, textX + 1, textY + 1, textW, textH);

        // main text (fades in)
        fill(theme.textColor[0], theme.textColor[1], theme.textColor[2], 255 * fade);
        text(displayText, textX, textY, textW, textH);

        // ---- Progress indicator: line counter (bottom right of panel) ----
        textSize(metaSize);
        textStyle(NORMAL);
        textAlign(RIGHT, BASELINE);
        fill(theme.metaColor[0], theme.metaColor[1], theme.metaColor[2], theme.metaColor[3]);
        const progress = `${lineIndex + 1} / ${dialogue.length}`;
        text(progress, boxM + boxW - boxP, boxY + boxH - boxP * 0.6);
        textAlign(LEFT, BASELINE);

        // ---- Advance indicator: blinking ▼ when line is done typing ----
        if (!isTyping) {
            const blink = (sin(millis() * 0.005) + 1) / 2; // 0..1
            const arrowSize = txtSize * 0.55;
            const arrowX = boxM + boxW - boxP - arrowSize * 1.2;
            const arrowY = boxY + boxH - boxP * 1.9;

            fill(theme.accent[0], theme.accent[1], theme.accent[2], 150 + blink * 105);
            noStroke();
            triangle(
                arrowX, arrowY,
                arrowX + arrowSize, arrowY,
                arrowX + arrowSize / 2, arrowY + arrowSize * 0.7
            );
        }
    }


    this.startLine = function(index) {
        if (index >= dialogue.length) { isFinished = true; return; }
        charIndex = 0;
        displayText = "";
        isTyping = true;
        lineStartTime = millis();
    }

    this.drawFinished = function() {
        background(0);

        // Continue button — centered on the screen
        const { btnW, btnH, btnX, btnY } = this.getContinueButtonBounds();

        const hovering = mouseX > btnX && mouseX < btnX + btnW &&
                         mouseY > btnY && mouseY < btnY + btnH;

        // button shadow
        noStroke();
        fill(0, 0, 0, 120);
        rect(btnX + 2, btnY + 3, btnW, btnH, 8);

        // button body
        if (hovering) {
            fill(theme.accent[0], theme.accent[1], theme.accent[2]);
        } else {
            fill(theme.panelFill[0], theme.panelFill[1], theme.panelFill[2], 240);
        }
        rect(btnX, btnY, btnW, btnH, 8);

        // accent underline on button
        fill(theme.accent[0], theme.accent[1], theme.accent[2]);
        rect(btnX, btnY + btnH - 2, btnW, 2);

        // button text
        fill(255);
        textSize(16);
        textStyle(NORMAL);
        textAlign(CENTER, CENTER);
        text("Continue to next scene →", btnX + btnW / 2, btnY + btnH / 2);
        textAlign(LEFT, BASELINE);
    }

    this.mouseClicked = function() {
        if (isFinished) {
            const { btnW, btnH, btnX, btnY } = this.getContinueButtonBounds();

            if (mouseX > btnX && mouseX < btnX + btnW && mouseY > btnY && mouseY < btnY + btnH){
                this.sceneManager.showScene(chatbot);
            }
            return;
        }

        if (isTyping) {
            charIndex = dialogue[lineIndex].text.length;
            displayText = dialogue[lineIndex].text;
            isTyping = false;
        } else {
            lineIndex++;
            this.startLine(lineIndex)
        }

        
    }

}