import { GoogleGenAI } from "https://esm.sh/@google/genai";

//Gemini API Setup
const API_KEY = ""
const ai = new GoogleGenAI({ apiKey:API_KEY})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "ASK_GEMINI") {
        // Call the Gemini API asynchronously 
        generateAIResponse(message.prompt)
        .then(text => sendResponse({ text }))
        .catch(err => sendResponse({ error: err.message }));
        
        return true; // Keeps the message channel open for async response
    }
});

async function generateAIResponse(userInput) {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userInput
    });
    
    return response.text;
}


chrome.runtime.onMessage.addListener(data => {
    const {event, prefs} = data

    switch (data.event) {
        case 'onStop':
            handleOnStop();
            break;
        case 'onStart':
            handleOnStart(prefs);
            break;
        default:
            break;
    }
})

const handleOnStop = function() {
    setRunningStatus(false);
}

const handleOnStart = function(prefs) {
    setRunningStatus(true);

    chrome.storage.local.set(prefs)
}

const setRunningStatus = function(isRunning) {
    chrome.storage.local.set({isRunning})
}
