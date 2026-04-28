function last_scene() {
    const dialogue = [
        { speaker: "Mike", text: "Where else could I have gone?" },
        { speaker: "Mike", text: "I had no chance of changing: the train, the people, nor me." },
        { speaker: "Mike", text: "Why has fortune punished me?" },
        { speaker: "Mike", text: "I do not know." },
        { speaker: "", text: "The wall is indeed closing in." },
        { speaker: "", text: "And he shall remain on the Inferno for the rest of his life." },
        { speaker: "", text: "Will elderliness and ill meet him first, or will the Wall arrive sooner?" },
        { speaker: "", text: "We shall never know." },

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
        bgImages[0] = loadImage("assets/inferno.jpg")
        
        textFont("Georgia");
        this.startLine(lineIndex);
        
    }



    let bgImages = []


    this.getSceneIndex = function(idx) {
        return 0;
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

        

        
    }

}

