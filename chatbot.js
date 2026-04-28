function chatbot() {

    const url = "https://itp-ima-replicate-proxy.web.app/api/create_n_get";
    let authToken = "";

    let options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`,
        },
    };

    let systemPrompt;
    let conversationHistory = [];

    let myButton, myInput, myOutput;
    let myOutputText = "";

    let continueBtn;

    let james;

    // --- BAD END LOGIC ---
    let submitCount = 0;
    const BAD_END_LIMIT = 9;
    let isBadEnd = false;
    // ---------------------

    this.draw = function() {
        if (isBadEnd) {
            // Draw black screen with "bad end" text
            background(0);
            fill(255);
            noStroke();
            textAlign(CENTER, CENTER);
            textSize(48);
            textStyle(NORMAL);
            textFont("Georgia");
            text("bad end", width / 2, height / 2);
            textAlign(LEFT, BASELINE);
            return;
        }
        image(james, 0, 0, width, height);
    }

    this.setup = async function() {
        james = loadImage("assets/james.png")
        const response = await fetch("prompt.txt");
        systemPrompt = await response.text();

        conversationHistory = [
            {
                role: "system",
                content: systemPrompt
            },
        ];

        // --- OUTPUT BOX (scrollable, top-left) ---
        myOutput = createElement("div", "");
        myOutput.position(30, 30);
        myOutput.elt.style.width = "480px";
        myOutput.elt.style.height = "calc(100vh - 160px)";
        myOutput.elt.style.overflowY = "auto";
        myOutput.elt.style.padding = "14px 16px";
        myOutput.elt.style.backgroundColor = "rgba(0,0,0,0.55)";
        myOutput.elt.style.border = "1px solid rgba(255,255,255,0.2)";
        myOutput.elt.style.borderRadius = "8px";
        myOutput.elt.style.boxSizing = "border-box";
        myOutput.elt.style.fontFamily = "Georgia, serif";
        myOutput.elt.style.fontSize = "16px";
        myOutput.elt.style.lineHeight = "1.7";
        myOutput.elt.style.color = "white";
        myOutput.elt.style.wordWrap = "break-word";
        myOutput.html('<span style="color:#aaa;font-style:italic;">James is waiting...</span>');

        // --- INPUT ROW (pinned to bottom-left) ---
        myInput = createInput("");
        myInput.position(30, height - 60);
        myInput.size(360);
        myInput.elt.style.fontSize = "16px";
        myInput.elt.style.fontFamily = "Georgia, serif";
        myInput.elt.style.border = "1px solid rgba(255,255,255,0.4)";
        myInput.elt.style.borderRadius = "6px";
        myInput.elt.style.padding = "8px 12px";
        myInput.elt.style.outline = "none";
        myInput.elt.style.backgroundColor = "rgba(0,0,0,0.55)";
        myInput.elt.style.color = "white";
        myInput.elt.style.boxSizing = "border-box";

        myButton = createButton("Send");
        myButton.position(400, height - 60);
        myButton.size(110, 38);
        myButton.mousePressed(() => this.chat());
        myButton.elt.style.fontSize = "15px";
        myButton.elt.style.fontFamily = "Georgia, serif";
        myButton.elt.style.backgroundColor = "#cc2f44";
        myButton.elt.style.color = "white";
        myButton.elt.style.border = "none";
        myButton.elt.style.borderRadius = "6px";
        myButton.elt.style.cursor = "pointer";

        continueBtn = createButton("Continue when you obtained enough information →");
        continueBtn.position(width - 260, height - 88);
        continueBtn.size(220, 48);
        continueBtn.elt.style.fontSize = "16px";
        continueBtn.elt.style.backgroundColor = "#cc2f44";
        continueBtn.elt.style.color = "white";
        continueBtn.elt.style.border = "none";
        continueBtn.elt.style.borderRadius = "8px";
        continueBtn.elt.style.cursor = "pointer";
        continueBtn.mousePressed(() => {
            if (myInput) myInput.remove();
            if (myButton) myButton.remove();
            if (myOutput) myOutput.remove();
            if (continueBtn) continueBtn.remove();
            this.sceneManager.showScene(chatbot2);
        });
    }

    this.keyPressed = function() {
        if (keyCode === ENTER) {
            this.chat();
        }
    }

    this.limitWords = function(text) {
        let words = text.trim().split(/\s+/);
        return words.slice(0, 50).join(" ")
    }

    this.triggerBadEnd = function() {
        isBadEnd = true;
        // Hide all DOM elements so only the canvas shows
        if (myInput) myInput.hide();
        if (myButton) myButton.hide();
        if (myOutput) myOutput.hide();
        if (continueBtn) continueBtn.hide();
    }

    this.chat = function() {
        const inputValue = this.limitWords(myInput.value());
        if (!inputValue || inputValue.length <= 0) {
            return;
        }

        // --- Increment counter and check for bad end ---
        submitCount++;
        if (submitCount >= BAD_END_LIMIT) {
            this.triggerBadEnd();
            return;
        }
        // -----------------------------------------------

        conversationHistory.push({ role: "user", content: inputValue });

        options.body = JSON.stringify({
            model: "openai/gpt-4o-mini",
            input: {
                messages: conversationHistory,
                temperature: 0.8,
                max_tokens: 50,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0.8,
                stop: [],
            }
        });

        fetch(url, options)
            .then((response) => {
                return response.json();
            })
            .then((response) => {
                console.log(response)

                if (response.output) {
                    let generatedResponse = response.output.join("");

                    conversationHistory.push({ role: "assistant", content: generatedResponse });

                    myOutputText +=
                        `<div style="margin-bottom:10px;">
                           <span style="color:#f97583;font-weight:bold;font-size:13px;letter-spacing:1px;text-transform:uppercase;">You</span>
                           <div style="margin-top:2px;color:#ddd;">${inputValue}</div>
                         </div>
                         <div style="margin-bottom:16px;">
                           <span style="color:#cc2f44;font-weight:bold;font-size:13px;letter-spacing:1px;text-transform:uppercase;">James</span>
                           <div style="margin-top:2px;">${generatedResponse}</div>
                         </div>`;
                    myOutput.html(myOutputText);
                    myOutput.elt.scrollTop = myOutput.elt.scrollHeight;
                    myInput.value("");
                }
            });
    }

    this.teardown = function() {
        if (myInput) myInput.remove();
        if (myButton) myButton.remove();
        if (myOutput) myOutput.remove();
        if (continueBtn) continueBtn.remove();
    }

}