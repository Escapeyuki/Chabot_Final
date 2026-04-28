function mid_chatbot() {

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
    let headerEl;
    let cassian;

    let cassianVoice;

    // --- BAD END LOGIC (only triggered by accepting the invitation) ---
    let isBadEnd = false;
    let badEndOpacity = 0;
    let isFadingToBadEnd = false;

    // --- INVITATION / BRANCH LOGIC ---
    let cassianInvited = false;     // becomes true when [INVITATION_MADE] is seen
    let branchResolved = false;     // becomes true once user has answered yes/no
    let userAcceptedInvitation = false; // true = bad end path, false = continue path

    const YES_PATTERN = /\b(yes|yeah|sure|okay|ok|alright|let's|lets|i will|i do|absolutely|fine|of course|sounds good|agreed|stay|i'll stay|ill stay|i want to|i'd love|id love)\b/i;
    const NO_PATTERN  = /\b(no|nope|never|refuse|won't|wont|don't|dont|not staying|i won't|i don't|leave|decline|pass)\b/i;

    // --- UPPER FLOOR THEME ---
    const SERIF = "Georgia, 'Times New Roman', serif";
    const MONO  = '"Consolas", "Monaco", "Courier New", monospace';
    const GOLD       = "#d4af37";
    const GOLD_BRIGHT= "#ffd86b";
    const GOLD_DIM   = "rgba(212,175,55,0.55)";
    const VELVET     = "rgba(28,12,18,0.88)";
    const VELVET_BORDER = "rgba(212,175,55,0.4)";
    const CREAM      = "rgba(248,240,220,0.95)";

    const timestamp = () => {
        const d = new Date();
        const pad = (n) => String(n).padStart(2, "0");
        return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };

    this.draw = function() {
        if (isFadingToBadEnd || isBadEnd) {
            if (cassian) image(cassian, 0, 0, width, height);
            badEndOpacity = min(badEndOpacity + 0.005, 1);
            fill(0, badEndOpacity * 255);
            noStroke();
            rect(0, 0, width, height);

            if (badEndOpacity > 0.85) {
                fill(255, map(badEndOpacity, 0.85, 1, 0, 255));
                textAlign(CENTER, CENTER);
                textSize(48);
                textStyle(NORMAL);
                textFont("Georgia");
                text("bad end", width / 2, height / 2);
                textAlign(LEFT, BASELINE);
            }
            if (badEndOpacity >= 1) isBadEnd = true;
            return;
        }
        if (cassian) image(cassian, 0, 0, width, height);
    }

    this.setup = async function() {

        cassianVoice = new p5.Speech();
        cassianVoice.setPitch(0.7);
        cassianVoice.setRate(0.9);
        cassianVoice.setVoice("Alice")

        cassian = loadImage("assets/gold_bar.png");
        const response = await fetch("mid_prompt.txt");
        systemPrompt = await response.text();

        conversationHistory = [];

        // --- LAYOUT CONSTANTS ---
        const chatW = min(720, width - 60);
        const chatX = (width - chatW) / 2;
        const headerH = 44;
        const headerTop = 24;
        const outputTop = headerTop + headerH + 8;
        const inputRowH = 60;
        const inputRowY = height - inputRowH - 30;
        const outputH = inputRowY - outputTop - 16;

        // --- HEADER BAR ---
        headerEl = createElement("div", "");
        headerEl.position(chatX, headerTop);
        headerEl.elt.style.width = chatW + "px";
        headerEl.elt.style.height = headerH + "px";
        headerEl.elt.style.boxSizing = "border-box";
        headerEl.elt.style.padding = "0 16px";
        headerEl.elt.style.display = "flex";
        headerEl.elt.style.alignItems = "center";
        headerEl.elt.style.justifyContent = "space-between";
        headerEl.elt.style.backgroundColor = VELVET;
        headerEl.elt.style.border = `1px solid ${VELVET_BORDER}`;
        headerEl.elt.style.borderRadius = "8px";
        headerEl.elt.style.fontFamily = SERIF;
        headerEl.elt.style.fontSize = "13px";
        headerEl.elt.style.letterSpacing = "3px";
        headerEl.elt.style.color = "rgba(248,240,220,0.75)";
        headerEl.elt.style.textTransform = "uppercase";
        headerEl.html(`
            <div style="display:flex;align-items:center;gap:10px;">
                <span class="cassian-dot" style="
                    width:8px;height:8px;border-radius:50%;
                    background:${GOLD_BRIGHT};
                    box-shadow:0 0 10px ${GOLD_BRIGHT};
                    animation:cassianPulse 2.4s ease-in-out infinite;
                "></span>
                <span style="font-style:italic;">The Inferno · Upper Floor</span>
            </div>
            <div style="color:${GOLD_BRIGHT};font-weight:bold;letter-spacing:4px;">CASSIAN</div>
        `);

        this.injectStylesOnce();

        // --- OUTPUT BOX ---
        myOutput = createElement("div", "");
        myOutput.position(chatX, outputTop);
        myOutput.elt.style.width = chatW + "px";
        myOutput.elt.style.height = outputH + "px";
        myOutput.elt.style.overflowY = "auto";
        myOutput.elt.style.padding = "20px 24px";
        myOutput.elt.style.backgroundColor = VELVET;
        myOutput.elt.style.border = `1px solid ${VELVET_BORDER}`;
        myOutput.elt.style.borderRadius = "8px";
        myOutput.elt.style.boxSizing = "border-box";
        myOutput.elt.style.fontFamily = SERIF;
        myOutput.elt.style.fontSize = "16px";
        myOutput.elt.style.lineHeight = "1.7";
        myOutput.elt.style.color = CREAM;
        myOutput.elt.style.wordWrap = "break-word";
        myOutput.elt.style.boxShadow = "inset 0 0 60px rgba(212,175,55,0.06)";
        myOutput.html(`<div style="color:rgba(248,240,220,0.45);font-style:italic;">[${timestamp()}] you step into the lounge. someone is already watching you...</div>`);

        // --- INPUT ROW ---
        const btnW = 120;
        const gap = 10;
        const inputW = chatW - btnW - gap;

        myInput = createInput("");
        myInput.position(chatX, inputRowY);
        myInput.size(inputW, inputRowH);
        myInput.elt.style.fontSize = "16px";
        myInput.elt.style.fontFamily = SERIF;
        myInput.elt.style.fontStyle = "italic";
        myInput.elt.style.border = `1px solid ${VELVET_BORDER}`;
        myInput.elt.style.borderRadius = "8px";
        myInput.elt.style.padding = "10px 18px 10px 36px";
        myInput.elt.style.outline = "none";
        myInput.elt.style.backgroundColor = VELVET;
        myInput.elt.style.color = CREAM;
        myInput.elt.style.boxSizing = "border-box";
        myInput.elt.style.height = inputRowH + "px";
        myInput.elt.style.caretColor = GOLD_BRIGHT;
        myInput.elt.addEventListener("focus", () => {
            myInput.elt.style.border = `1px solid ${GOLD_BRIGHT}`;
            myInput.elt.style.boxShadow = `0 0 0 3px rgba(255,216,107,0.18)`;
        });
        myInput.elt.addEventListener("blur", () => {
            myInput.elt.style.border = `1px solid ${VELVET_BORDER}`;
            myInput.elt.style.boxShadow = "none";
        });

        const promptGlyph = createElement("div", "&#x223F;");
        promptGlyph.position(chatX + 14, inputRowY + inputRowH / 2 - 12);
        promptGlyph.elt.style.fontFamily = SERIF;
        promptGlyph.elt.style.fontSize = "20px";
        promptGlyph.elt.style.color = GOLD_BRIGHT;
        promptGlyph.elt.style.pointerEvents = "none";
        this._promptGlyph = promptGlyph;

        myButton = createButton("REPLY");
        myButton.position(chatX + inputW + gap, inputRowY);
        myButton.size(btnW, inputRowH);
        myButton.mousePressed(() => this.chat());
        myButton.elt.style.fontSize = "13px";
        myButton.elt.style.fontFamily = SERIF;
        myButton.elt.style.letterSpacing = "4px";
        myButton.elt.style.fontWeight = "bold";
        myButton.elt.style.background = `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_BRIGHT} 50%, ${GOLD} 100%)`;
        myButton.elt.style.color = "#3a2a08";
        myButton.elt.style.border = "none";
        myButton.elt.style.borderRadius = "8px";
        myButton.elt.style.cursor = "pointer";
        myButton.elt.style.height = inputRowH + "px";
        myButton.elt.style.transition = "filter 0.15s ease";
        myButton.elt.style.boxShadow = "0 4px 14px rgba(212,175,55,0.3)";
        myButton.elt.addEventListener("mouseenter", () => {
            if (!myButton.elt.disabled) myButton.elt.style.filter = "brightness(1.12)";
        });
        myButton.elt.addEventListener("mouseleave", () => {
            myButton.elt.style.filter = "brightness(1)";
        });

        // --- CONTINUE BUTTON (revealed only on graceful decline) ---
        continueBtn = createDiv("");
        continueBtn.position(width - 240, 30);
        continueBtn.size(210, 90);
        continueBtn.elt.style.cursor = "pointer";
        continueBtn.elt.style.fontFamily = SERIF;
        continueBtn.elt.style.color = "#3a2a08";
        continueBtn.elt.style.borderRadius = "6px";
        continueBtn.elt.style.padding = "14px 18px";
        continueBtn.elt.style.boxSizing = "border-box";
        continueBtn.elt.style.textAlign = "center";
        continueBtn.elt.style.letterSpacing = "4px";
        continueBtn.elt.style.fontWeight = "bold";
        continueBtn.elt.style.boxShadow = "0 6px 24px rgba(0,0,0,0.6), 0 0 30px rgba(255,200,80,0.4)";
        continueBtn.elt.style.border = "1px dashed rgba(80,55,10,0.5)";
        continueBtn.elt.style.background = `
            linear-gradient(
                100deg,
                rgba(255,255,255,0) 30%,
                rgba(255,255,255,0.65) 50%,
                rgba(255,255,255,0) 70%
            ),
            linear-gradient(135deg, #b8860b 0%, #ffd86b 25%, #fff4b8 50%, #ffd86b 75%, #b8860b 100%)
        `;
        continueBtn.elt.style.backgroundSize = "200% 100%, 100% 100%";
        continueBtn.elt.style.backgroundRepeat = "no-repeat";
        continueBtn.elt.style.animation = "ticketArrive 0.9s ease-out, ticketShine 2.6s linear infinite 0.9s, ticketFloat 3s ease-in-out infinite 1s";
        continueBtn.html(`
            <div style="font-size:10px;letter-spacing:3px;opacity:0.7;margin-bottom:6px;">&#x2726;  &#x2726;  &#x2726;</div>
            <div style="font-size:22px;letter-spacing:6px;font-family:${SERIF};">CONTINUE</div>
            <div style="font-size:10px;letter-spacing:3px;opacity:0.7;margin-top:6px;">&#x2726;  &#x2726;  &#x2726;</div>
        `);
        continueBtn.elt.addEventListener("mouseenter", () => {
            continueBtn.elt.style.boxShadow = "0 8px 32px rgba(0,0,0,0.7), 0 0 50px rgba(255,215,100,0.7)";
        });
        continueBtn.elt.addEventListener("mouseleave", () => {
            continueBtn.elt.style.boxShadow = "0 6px 24px rgba(0,0,0,0.6), 0 0 30px rgba(255,200,80,0.4)";
        });
        continueBtn.mousePressed(() => {
            this.teardown();
            this.sceneManager.showScene(chatbot2);
            
        });
        continueBtn.hide();

        this.sendOpeningMessage();
    }

    this.injectStylesOnce = function() {
        if (document.getElementById("cassian-styles")) return;
        const style = document.createElement("style");
        style.id = "cassian-styles";
        style.textContent = `
            @keyframes cassianPulse {
                0%, 100% { opacity: 1;   box-shadow: 0 0 10px ${GOLD_BRIGHT}; }
                50%      { opacity: 0.5; box-shadow: 0 0 3px  ${GOLD_BRIGHT}; }
            }
            @keyframes thinkingDots {
                0%, 20%   { opacity: 0.2; }
                50%       { opacity: 1;   }
                80%, 100% { opacity: 0.2; }
            }
            .cassian-dot-anim {
                display: inline-block;
                animation: thinkingDots 1.4s ease-in-out infinite;
            }
            .cassian-dot-anim:nth-child(2) { animation-delay: 0.2s; }
            .cassian-dot-anim:nth-child(3) { animation-delay: 0.4s; }
            @keyframes fadeInMsg {
                from { opacity: 0; transform: translateY(4px); }
                to   { opacity: 1; transform: translateY(0);   }
            }
            .msg-block {
                animation: fadeInMsg 0.4s ease-out;
            }
            @keyframes ticketArrive {
                from { opacity: 0; transform: translateY(-20px) rotate(-3deg); }
                to   { opacity: 1; transform: translateY(0) rotate(0); }
            }
            @keyframes ticketShine {
                0%   { background-position: -100% 0, 0 0; }
                100% { background-position:  200% 0, 0 0; }
            }
            @keyframes ticketFloat {
                0%, 100% { transform: translateY(0); }
                50%      { transform: translateY(-4px); }
            }
        `;
        document.head.appendChild(style);
    }

    this.buildPrompt = function(extraUserLine) {
        const parts = [systemPrompt.trim()];
        if (conversationHistory.length > 0) {
            parts.push(conversationHistory.join("\n"));
        }
        if (extraUserLine) {
            parts.push(extraUserLine);
        }
        parts.push("Bot:");
        return parts.join("\n\n");
    }

    this.sendOpeningMessage = function() {
        myButton.elt.disabled = true;
        myButton.elt.textContent = "...";

        const openingTrigger = "You: (The player has just walked into the grand lounge. Deliver your flamboyant Stage 1 greeting now.)";
        const openingPrompt = this.buildPrompt(openingTrigger);

        const openingBody = JSON.stringify({
            model: "anthropic/claude-4.5-sonnet",
            input: {
                prompt: openingPrompt,
                max_tokens: 1024,
                temperature: 0.9
            }
        });

        fetch(url, { ...options, body: openingBody })
            .then(r => r.json())
            .then(response => {
                if (response.output) {
                    let opening = response.output.join("").trim();
                    opening = opening.replace(/^Bot:\s*/i, "");
                    conversationHistory.push("Bot: " + opening);
                    myOutputText += this.formatCassianMessage(opening);
                    myOutput.html(myOutputText);
                    myOutput.elt.scrollTop = myOutput.elt.scrollHeight;

                    cassianVoice.setPitch(0.7);
                    cassianVoice.setRate(0.9);
                    cassianVoice.setVoice("Alice")
                    cassianVoice.speak(opening);
                }
                myButton.elt.disabled = false;
                myButton.elt.textContent = "REPLY";
            })
            .catch(() => {
                myOutput.html(`<div style="color:rgba(248,240,220,0.45);font-style:italic;">[${timestamp()}] the music falters for a moment. try again...</div>`);
                myButton.elt.disabled = false;
                myButton.elt.textContent = "REPLY";
            });
    }

    this.formatCassianMessage = function(text) {
        return `<div class="msg-block" style="margin-bottom:20px;">
            <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:6px;">
                <span style="color:rgba(248,240,220,0.4);font-size:11px;font-family:${MONO};">[${timestamp()}]</span>
                <span style="color:${GOLD_BRIGHT};font-weight:bold;font-size:13px;letter-spacing:4px;font-style:italic;">&#x273F; CASSIAN</span>
            </div>
            <div style="color:${CREAM};padding-left:16px;border-left:2px solid ${GOLD_DIM};">${text}</div>
        </div>`;
    }

    this.formatUserMessage = function(text) {
        return `<div class="msg-block" style="margin-bottom:16px;">
            <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:4px;">
                <span style="color:rgba(248,240,220,0.4);font-size:11px;font-family:${MONO};">[${timestamp()}]</span>
                <span style="color:rgba(248,240,220,0.7);font-weight:bold;font-size:12px;letter-spacing:3px;">&mdash; YOU</span>
            </div>
            <div style="color:rgba(248,240,220,0.78);padding-left:16px;border-left:2px solid rgba(248,240,220,0.2);font-style:italic;">${text}</div>
        </div>`;
    }

    this.keyPressed = function() {
        if (keyCode === ENTER) {
            this.chat();
        }
    }

    this.limitWords = function(text) {
        let words = text.trim().split(/\s+/);
        return words.slice(0, 50).join(" ");
    }

    this.triggerBadEnd = function() {
        isFadingToBadEnd = true;
        if (myInput) myInput.hide();
        if (myButton) myButton.hide();
        if (myOutput) myOutput.hide();
        if (continueBtn) continueBtn.hide();
        if (headerEl) headerEl.hide();
        if (this._promptGlyph) this._promptGlyph.hide();
    }

    this.chat = function() {
        const inputValue = this.limitWords(myInput.value());
        if (!inputValue || inputValue.length <= 0) {
            myInput.elt.style.border = `1px solid ${GOLD_BRIGHT}`;
            setTimeout(() => {
                myInput.elt.style.border = `1px solid ${VELVET_BORDER}`;
            }, 600);
            return;
        }

        // --- BRANCH RESOLUTION ---
        // After Cassian extends the invitation, the user's NEXT message is their answer.
        if (cassianInvited && !branchResolved) {
            const saidYes = YES_PATTERN.test(inputValue);
            const saidNo  = NO_PATTERN.test(inputValue);

            if (saidYes && !saidNo) {
                branchResolved = true;
                userAcceptedInvitation = true;
            } else if (saidNo && !saidYes) {
                branchResolved = true;
                userAcceptedInvitation = false;
            }
            // If ambiguous, let Cassian press for a clearer answer naturally.
        }

        myButton.elt.disabled = true;
        myButton.elt.textContent = "...";
        myButton.elt.style.filter = "brightness(0.7)";

        conversationHistory.push("You: " + inputValue);
        myInput.value("");

        const typingId = "cassian-typing";
        myOutputText += `<div id="${typingId}" style="color:rgba(248,240,220,0.5);margin-bottom:14px;font-size:14px;font-style:italic;letter-spacing:1px;">
            <span style="color:${GOLD_BRIGHT};">&#x273F;</span> cassian swirls her glass<span class="cassian-dot-anim">.</span><span class="cassian-dot-anim">.</span><span class="cassian-dot-anim">.</span>
        </div>`;
        myOutput.html(myOutputText);
        myOutput.elt.scrollTop = myOutput.elt.scrollHeight;

        const fullPrompt = this.buildPrompt();

        options.body = JSON.stringify({
            model: "anthropic/claude-4.5-sonnet",
            input: {
                prompt: fullPrompt,
                max_tokens: 1024,
                temperature: 0.85
            }
        });

        fetch(url, options)
            .then(r => r.json())
            .then(response => {
                myOutputText = myOutputText.replace(
                    new RegExp(`<div id="${typingId}"[\\s\\S]*?</div>\\s*`), ""
                );

                if (response.output) {
                    let generatedResponse = response.output.join("").trim();

                    generatedResponse = generatedResponse.replace(/^Bot:\s*/i, "");

                    const youIdx = generatedResponse.indexOf("\nYou:");
                    if (youIdx !== -1) {
                        generatedResponse = generatedResponse.slice(0, youIdx).trim();
                    }

                    // --- TAG HANDLING ---
                    let triggerBadEndAfter = false;
                    let revealContinueAfter = false;

                    if (generatedResponse.includes("[INVITATION_MADE]")) {
                        cassianInvited = true;
                        generatedResponse = generatedResponse.replace("[INVITATION_MADE]", "").trim();
                    }
                    if (generatedResponse.includes("[BAD_END]")) {
                        triggerBadEndAfter = true;
                        generatedResponse = generatedResponse.replace("[BAD_END]", "").trim();
                    }
                    if (generatedResponse.includes("[CONTINUE]")) {
                        revealContinueAfter = true;
                        generatedResponse = generatedResponse.replace("[CONTINUE]", "").trim();
                    }

                    // Safety net: if branch was resolved client-side but Claude forgot
                    // its tag, infer from our state.
                    if (branchResolved && !triggerBadEndAfter && !revealContinueAfter) {
                        if (userAcceptedInvitation) triggerBadEndAfter = true;
                        else revealContinueAfter = true;
                    }

                    conversationHistory.push("Bot: " + generatedResponse);

                    myOutputText += this.formatUserMessage(inputValue);
                    myOutputText += this.formatCassianMessage(generatedResponse);
                    myOutput.html(myOutputText);
                    myOutput.elt.scrollTop = myOutput.elt.scrollHeight;

                    if (triggerBadEndAfter) {
                        // Brief pause so user can read the seductive farewell, then fade.
                        setTimeout(() => this.triggerBadEnd(), 2200);
                    } else if (revealContinueAfter) {
                        continueBtn.show();
                    }

                    cassianVoice.setPitch(0.7);
                    cassianVoice.setRate(0.9);
                    cassianVoice.setVoice("Alice")
                    cassianVoice.speak(generatedResponse)

                } else {
                    myOutputText += `<div style="margin-bottom:16px;color:rgba(248,240,220,0.45);font-style:italic;">[${timestamp()}] the chandelier flickers. try again.</div>`;
                    myOutput.html(myOutputText);
                }

                myButton.elt.disabled = false;
                myButton.elt.textContent = "REPLY";
                myButton.elt.style.filter = "brightness(1)";
                myInput.elt.focus();
            })
            .catch(() => {
                myOutputText += `<div style="margin-bottom:16px;color:rgba(248,240,220,0.45);font-style:italic;">[${timestamp()}] the music swells, drowning out the signal. try again.</div>`;
                myOutput.html(myOutputText);
                myButton.elt.disabled = false;
                myButton.elt.textContent = "REPLY";
                myButton.elt.style.filter = "brightness(1)";
            });
    }

    this.teardown = function() {
        if (myInput) myInput.remove();
        if (myButton) myButton.remove();
        if (myOutput) myOutput.remove();
        if (continueBtn) continueBtn.remove();
        if (headerEl) headerEl.remove();
        if (this._promptGlyph) this._promptGlyph.remove();
    }

}