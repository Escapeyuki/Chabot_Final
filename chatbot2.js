function chatbot2() {

    // It uses ITP/IMA's proxy server to send API calls to Replicate for accessing models, for usage limits and authentication, read the documentation here: https://itp-ima-replicate-proxy.web.app/

    // It uses p5.js for the chat interface.
    // Language model: gpt-4o-mini
    // With session memory added.

    // This is the url to itp/ima's proxy server, it contains the API key
    // It's publically accessible, with usage limits 

    const url = "https://itp-ima-replicate-proxy.web.app/api/create_n_get";
    let authToken = "";

    let options = {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`, // optional
        },
    };

    let systemPrompt;
    let conversationHistory = [];

    let myButton, myInput, myOutput; //interface variables
    let myOutputText = "";
    let submitCount = 0;
    const UNLOCK_LIMIT = 6;

    let continueBtn;

    //testing preload function, if there is a bug, put the loadstring into the setup function
    // this.preload = function() {
    //     systemPrompt = loadString("prompt.txt")
    // }
    let james;

    this.draw = function() {
        image(james, 0, 0, width, height)
        //  
    }

    this.setup = async function() {
        james = loadImage("assets/Vera.png")
        const response = await fetch("prompt2.txt");
        systemPrompt = await response.text();

        //the first message in the conversation history is a System Prompt for the chatbot
        conversationHistory = [
            {
            role: "system",
            content: systemPrompt //change the prompt from an array to a string using join
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
        myOutput.html('<span style="color:#aaa;font-style:italic;">Vera is waiting...</span>');

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
            this.sceneManager.showScene(last_scene);
        });
        continueBtn.hide(); // hidden until 6 inputs
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

    this.chat = function() {
        const inputValue = this.limitWords(myInput.value());
        if (!inputValue || inputValue.length<= 0){
            return;
        }

        submitCount++;
        if (submitCount >= UNLOCK_LIMIT && continueBtn) {
            continueBtn.show();
        }

        conversationHistory.push({ role: "user", content: inputValue });

        options.body = JSON.stringify({
            model: "openai/gpt-4o-mini",  // find the name of the model you want to use on Replicate
            input: {
            messages: conversationHistory,
            temperature: 0.8, //(0 - 2) controls randomness. Lower temperature  = less random replies. 
            max_tokens: 50, //one token ~= 4 English characters. note that you should also instruct the model to answer in less than 50 tokens in the system prompt to avoid the response being cut off
            top_p: 1, //(0-1): controls diversity through sampling. 0.5 means half of the probable vocabulary is considered.
            frequency_penalty: 0, //(0-2): How much to penalize new tokens based on their existing frequency in the text so far. Decreases repetition.
            presence_penalty: 0.8, //(0-2): How much to penalize new tokens based on whether they appear in the text so far. Increases new topics.
            stop: [], //Up to four sequences where the API will stop generating further tokens.
            }
        });

        fetch(url, options) //fetch is JavaScript's built in method for making API calls
            .then((response) => {
            return response.json(); //turn received data into JSON
            })
            .then((response) => {
            console.log(response);

            if (response.output) {
                let generatedResponse = response.output.join("");

                //add the bot's message to the conversation history
                conversationHistory.push({ role: "assistant", content: generatedResponse });

                myOutputText +=
                `<div style="margin-bottom:10px;">
                   <span style="color:#f97583;font-weight:bold;font-size:13px;letter-spacing:1px;text-transform:uppercase;">You</span>
                   <div style="margin-top:2px;color:#ddd;">${inputValue}</div>
                 </div>
                 <div style="margin-bottom:16px;">
                   <span style="color:#cc2f44;font-weight:bold;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Vera</span>
                   <div style="margin-top:2px;">${generatedResponse}</div>
                 </div>`;
                myOutput.html(myOutputText);
                myOutput.elt.scrollTop = myOutput.elt.scrollHeight;
                myInput.value(""); //clear the input field
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