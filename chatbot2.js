function chatbot2() {

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
    let conversationHistory = []; // array of "You: ..." / "Bot: ..." strings

    let myButton, myInput, myOutput;
    let myOutputText = "";
    let submitCount = 0;
    const UNLOCK_LIMIT = 3;

    let continueBtn;
    let warningEl;
    let headerEl;

    let vera;

    // --- VOICE ---
    let veraVoice;

    // --- TERMINAL THEME ---
    const MONO = '"Consolas", "Monaco", "Courier New", monospace';
    const SERIF = "Georgia, serif";
    const ACCENT = "#b83a8a";
    const ACCENT_DIM = "rgba(184,58,138,0.65)";
    const ACCENT_SOFT = "rgba(184,58,138,0.35)";
    const ACCENT_HOVER = "#d44ba0";
    const GREEN_CRT = "#9ef0a0";
    const PANEL_BG = "rgba(12,14,20,0.82)";
    const PANEL_BORDER = "rgba(184,58,138,0.35)";

    const timestamp = () => {
        const d = new Date();
        const pad = (n) => String(n).padStart(2, "0");
        return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };

    // Strip stage directions / brackets / html so Vera doesn't read them aloud
    this.cleanForSpeech = function(text) {
        return text
            .replace(/\*[^*]*\*/g, "")
            .replace(/\([^)]*\)/g, "")
            .replace(/\[[^\]]*\]/g, "")
            .replace(/<[^>]+>/g, "")
            .replace(/\s+/g, " ")
            .trim();
    }

    this.draw = function() {
        image(vera, 0, 0, width, height);
    }

    this.setup = async function() {

        // --- INIT VOICE ---
        veraVoice = new p5.Speech();
        veraVoice.setPitch(1.2);   // higher than James for contrast
        veraVoice.setRate(0.95);
        veraVoice.setVoice("Samantha");

        vera = loadImage("assets/Vera.png");
        const response = await fetch("prompt2.txt");
        systemPrompt = await response.text();

        // Reset history fresh on scene entry
        conversationHistory = [];

        // --- LAYOUT CONSTANTS ---
        const chatW = min(720, width - 60);
        const chatX = (width - chatW) / 2;
        const headerH = 44;
        const headerTop = 24;
        const outputTop = headerTop + headerH + 8;
        const inputRowH = 60;
        const inputRowY = height - inputRowH - 48;
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
        headerEl.elt.style.backgroundColor = PANEL_BG;
        headerEl.elt.style.border = `1px solid ${PANEL_BORDER}`;
        headerEl.elt.style.borderRadius = "8px";
        headerEl.elt.style.fontFamily = MONO;
        headerEl.elt.style.fontSize = "12px";
        headerEl.elt.style.letterSpacing = "1.5px";
        headerEl.elt.style.color = "rgba(240,236,230,0.75)";
        headerEl.elt.style.textTransform = "uppercase";
        headerEl.html(`
            <div style="display:flex;align-items:center;gap:10px;">
                <span class="status-dot-vera" style="
                    width:8px;height:8px;border-radius:50%;
                    background:${GREEN_CRT};
                    box-shadow:0 0 8px ${GREEN_CRT};
                    animation:pulseVera 1.8s ease-in-out infinite;
                "></span>
                <span>UPPER FLOOR · INTERROGATION LOG</span>
            </div>
            <div style="color:${ACCENT};font-weight:bold;">VERA</div>
        `);

        this.injectStylesOnce();

        // --- OUTPUT BOX ---
        myOutput = createElement("div", "");
        myOutput.position(chatX, outputTop);
        myOutput.elt.style.width = chatW + "px";
        myOutput.elt.style.height = outputH + "px";
        myOutput.elt.style.overflowY = "auto";
        myOutput.elt.style.padding = "18px 22px";
        myOutput.elt.style.backgroundColor = PANEL_BG;
        myOutput.elt.style.border = `1px solid ${PANEL_BORDER}`;
        myOutput.elt.style.borderRadius = "8px";
        myOutput.elt.style.boxSizing = "border-box";
        myOutput.elt.style.fontFamily = MONO;
        myOutput.elt.style.fontSize = "15px";
        myOutput.elt.style.lineHeight = "1.7";
        myOutput.elt.style.color = "rgba(240,236,230,0.92)";
        myOutput.elt.style.wordWrap = "break-word";
        myOutput.elt.style.backgroundImage = `
            linear-gradient(${PANEL_BG}, ${PANEL_BG}),
            repeating-linear-gradient(
                0deg,
                rgba(255,255,255,0.015) 0px,
                rgba(255,255,255,0.015) 1px,
                transparent 1px,
                transparent 3px
            )
        `;
        myOutput.html(`<div style="color:rgba(240,236,230,0.4);font-style:italic;">[${timestamp()}] vera is waiting. begin questioning...</div>`);

        // --- INPUT ROW ---
        const btnW = 120;
        const gap = 10;
        const inputW = chatW - btnW - gap;

        myInput = createInput("");
        myInput.position(chatX, inputRowY);
        myInput.size(inputW, inputRowH);
        myInput.elt.style.fontSize = "15px";
        myInput.elt.style.fontFamily = MONO;
        myInput.elt.style.border = `1px solid ${PANEL_BORDER}`;
        myInput.elt.style.borderRadius = "8px";
        myInput.elt.style.padding = "10px 18px 10px 36px";
        myInput.elt.style.outline = "none";
        myInput.elt.style.backgroundColor = PANEL_BG;
        myInput.elt.style.color = "rgba(240,236,230,0.95)";
        myInput.elt.style.boxSizing = "border-box";
        myInput.elt.style.height = inputRowH + "px";
        myInput.elt.style.caretColor = ACCENT;
        myInput.elt.addEventListener("focus", () => {
            myInput.elt.style.border = `1px solid ${ACCENT}`;
            myInput.elt.style.boxShadow = `0 0 0 3px rgba(184,58,138,0.15)`;
        });
        myInput.elt.addEventListener("blur", () => {
            myInput.elt.style.border = `1px solid ${PANEL_BORDER}`;
            myInput.elt.style.boxShadow = "none";
        });

        const promptGlyph = createElement("div", "&gt;");
        promptGlyph.position(chatX + 14, inputRowY + inputRowH / 2 - 10);
        promptGlyph.elt.style.fontFamily = MONO;
        promptGlyph.elt.style.fontSize = "16px";
        promptGlyph.elt.style.color = ACCENT;
        promptGlyph.elt.style.pointerEvents = "none";
        promptGlyph.elt.style.fontWeight = "bold";
        this._promptGlyph = promptGlyph;

        myButton = createButton("SEND");
        myButton.position(chatX + inputW + gap, inputRowY);
        myButton.size(btnW, inputRowH);
        myButton.mousePressed(() => this.chat());
        myButton.elt.style.fontSize = "13px";
        myButton.elt.style.fontFamily = MONO;
        myButton.elt.style.letterSpacing = "2px";
        myButton.elt.style.fontWeight = "bold";
        myButton.elt.style.backgroundColor = ACCENT;
        myButton.elt.style.color = "white";
        myButton.elt.style.border = "none";
        myButton.elt.style.borderRadius = "8px";
        myButton.elt.style.cursor = "pointer";
        myButton.elt.style.height = inputRowH + "px";
        myButton.elt.style.transition = "background-color 0.15s ease";
        myButton.elt.addEventListener("mouseenter", () => {
            if (!myButton.elt.disabled) myButton.elt.style.backgroundColor = ACCENT_HOVER;
        });
        myButton.elt.addEventListener("mouseleave", () => {
            if (!myButton.elt.disabled) myButton.elt.style.backgroundColor = ACCENT;
        });

        // --- CONTINUE BUTTON ---
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
            <div style="font-size:10px;letter-spacing:3px;opacity:0.7;margin-bottom:6px;">★  ★  ★</div>
            <div style="font-size:26px;letter-spacing:8px;font-family:${SERIF};">CONTINUE</div>
            <div style="font-size:10px;letter-spacing:3px;opacity:0.7;margin-top:6px;">★  ★  ★</div>
        `);
        continueBtn.elt.addEventListener("mouseenter", () => {
            continueBtn.elt.style.boxShadow = "0 8px 32px rgba(0,0,0,0.7), 0 0 50px rgba(255,215,100,0.7)";
        });
        continueBtn.elt.addEventListener("mouseleave", () => {
            continueBtn.elt.style.boxShadow = "0 6px 24px rgba(0,0,0,0.6), 0 0 30px rgba(255,200,80,0.4)";
        });
        continueBtn.mousePressed(() => {
            this.teardown();
            this.sceneManager.showScene(last_scene);
        });
        continueBtn.hide();

        // --- EXCHANGE COUNTER ---
        warningEl = createElement("p", "");
        warningEl.position(chatX, inputRowY + inputRowH + 8);
        warningEl.elt.style.width = chatW + "px";
        warningEl.elt.style.textAlign = "center";
        warningEl.elt.style.fontSize = "11px";
        warningEl.elt.style.fontFamily = MONO;
        warningEl.elt.style.letterSpacing = "1.5px";
        warningEl.elt.style.textTransform = "uppercase";
        warningEl.elt.style.color = "rgba(240,236,230,0.3)";
        warningEl.elt.style.margin = "0";
        warningEl.html(`// ${UNLOCK_LIMIT} exchanges to unlock passage`);
    }

    this.injectStylesOnce = function() {
        if (document.getElementById("chatbot-vera-styles")) return;
        const style = document.createElement("style");
        style.id = "chatbot-vera-styles";
        style.textContent = `
            @keyframes pulseVera {
                0%, 100% { opacity: 1;   box-shadow: 0 0 8px ${GREEN_CRT}; }
                50%      { opacity: 0.4; box-shadow: 0 0 2px ${GREEN_CRT}; }
            }
            @keyframes thinkingDotsVera {
                0%, 20%   { opacity: 0.2; }
                50%       { opacity: 1;   }
                80%, 100% { opacity: 0.2; }
            }
            .thinking-dot-vera {
                display: inline-block;
                animation: thinkingDotsVera 1.4s ease-in-out infinite;
            }
            .thinking-dot-vera:nth-child(2) { animation-delay: 0.2s; }
            .thinking-dot-vera:nth-child(3) { animation-delay: 0.4s; }
            @keyframes fadeInMsgVera {
                from { opacity: 0; transform: translateY(4px); }
                to   { opacity: 1; transform: translateY(0);   }
            }
            .msg-block-vera {
                animation: fadeInMsgVera 0.35s ease-out;
            }
        `;
        document.head.appendChild(style);
    }

    // Build the full prompt string Claude expects (system + running log + Bot:).
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

    this.formatVeraMessage = function(text) {
        return `<div class="msg-block-vera" style="margin-bottom:18px;">
            <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:4px;">
                <span style="color:rgba(240,236,230,0.35);font-size:11px;">[${timestamp()}]</span>
                <span style="color:${ACCENT};font-weight:bold;font-size:12px;letter-spacing:2px;">◆ VERA</span>
            </div>
            <div style="color:rgba(240,236,230,0.95);padding-left:14px;border-left:2px solid ${PANEL_BORDER};">${text}</div>
        </div>`;
    }

    this.formatUserMessage = function(text) {
        return `<div class="msg-block-vera" style="margin-bottom:14px;">
            <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:4px;">
                <span style="color:rgba(240,236,230,0.35);font-size:11px;">[${timestamp()}]</span>
                <span style="color:#f97583;font-weight:bold;font-size:12px;letter-spacing:2px;">&gt; YOU</span>
            </div>
            <div style="color:rgba(240,236,230,0.75);padding-left:14px;border-left:2px solid rgba(249,117,131,0.25);">${text}</div>
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

    this.updateWarning = function() {
        if (!warningEl) return;
        const remaining = Math.max(0, UNLOCK_LIMIT - submitCount);
        if (remaining > 0) {
            warningEl.html(`// ${remaining} exchange${remaining !== 1 ? "s" : ""} until passage unlocks`);
            warningEl.elt.style.color = "rgba(240,236,230,0.3)";
        } else {
            warningEl.html(`// passage unlocked — proceed when ready`);
            warningEl.elt.style.color = ACCENT;
        }
    }

    this.chat = function() {
        const inputValue = this.limitWords(myInput.value());
        if (!inputValue || inputValue.length <= 0) {
            myInput.elt.style.border = `1px solid ${ACCENT}`;
            setTimeout(() => {
                myInput.elt.style.border = `1px solid ${PANEL_BORDER}`;
            }, 600);
            return;
        }

        submitCount++;
        this.updateWarning();
        if (submitCount >= UNLOCK_LIMIT && continueBtn) {
            continueBtn.show();
        }

        myButton.elt.disabled = true;
        myButton.elt.textContent = "...";
        myButton.elt.style.backgroundColor = ACCENT_DIM;

        // Push user line into running log
        conversationHistory.push("You: " + inputValue);
        myInput.value("");

        const typingId = "vera-typing";
        myOutputText += `<div id="${typingId}" style="color:rgba(240,236,230,0.4);margin-bottom:14px;font-size:13px;letter-spacing:1px;">
            <span style="color:${ACCENT};font-weight:bold;">◆</span> vera is thinking<span class="thinking-dot-vera">.</span><span class="thinking-dot-vera">.</span><span class="thinking-dot-vera">.</span>
        </div>`;
        myOutput.html(myOutputText);
        myOutput.elt.scrollTop = myOutput.elt.scrollHeight;

        // Build prompt from full history
        const fullPrompt = this.buildPrompt();

        options.body = JSON.stringify({
            model: "anthropic/claude-4.5-sonnet",
            input: {
                prompt: fullPrompt,
                max_tokens: 1024,
                temperature: 0.8
            }
        });

        fetch(url, options)
            .then((response) => response.json())
            .then((response) => {
                console.log(response);

                myOutputText = myOutputText.replace(
                    new RegExp(`<div id="${typingId}"[\\s\\S]*?</div>\\s*`), ""
                );

                if (response.output) {
                    let generatedResponse = response.output.join("").trim();

                    // Strip "Bot:" echoes and hallucinated "You:" turns
                    generatedResponse = generatedResponse.replace(/^Bot:\s*/i, "");
                    const youIdx = generatedResponse.indexOf("\nYou:");
                    if (youIdx !== -1) {
                        generatedResponse = generatedResponse.slice(0, youIdx).trim();
                    }

                    conversationHistory.push("Bot: " + generatedResponse);

                    myOutputText += this.formatUserMessage(inputValue);
                    myOutputText += this.formatVeraMessage(generatedResponse);
                    myOutput.html(myOutputText);
                    myOutput.elt.scrollTop = myOutput.elt.scrollHeight;

                    // Speak it — re-apply settings each time so they stick
                    veraVoice.setPitch(1.2);
                    veraVoice.setRate(0.95);
                    veraVoice.setVoice("Samantha");
                    veraVoice.speak(this.cleanForSpeech(generatedResponse));
                } else {
                    myOutputText += `<div style="margin-bottom:16px;color:rgba(240,236,230,0.4);font-style:italic;">[${timestamp()}] signal lost. try again.</div>`;
                    myOutput.html(myOutputText);
                }

                myButton.elt.disabled = false;
                myButton.elt.textContent = "SEND";
                myButton.elt.style.backgroundColor = ACCENT;
                myInput.elt.focus();
            })
            .catch(() => {
                myOutputText += `<div style="margin-bottom:16px;color:rgba(240,236,230,0.4);font-style:italic;">[${timestamp()}] connection wavers. try again.</div>`;
                myOutput.html(myOutputText);
                myButton.elt.disabled = false;
                myButton.elt.textContent = "SEND";
                myButton.elt.style.backgroundColor = ACCENT;
            });
    }

    this.teardown = function() {
        if (myInput) myInput.remove();
        if (myButton) myButton.remove();
        if (myOutput) myOutput.remove();
        if (continueBtn) continueBtn.remove();
        if (warningEl) warningEl.remove();
        if (headerEl) headerEl.remove();
        if (this._promptGlyph) this._promptGlyph.remove();
    }

}