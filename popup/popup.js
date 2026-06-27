// Data Elements
const titleElement = document.getElementById("title")
const chapterElement = document.getElementById("chapter")
const languageElement = document.getElementById("language")
const linkDropdownElement = document.getElementById("linkDropdown")

//Button Elements
const startButton = document.getElementById("startButton")
const stopButton = document.getElementById("stopButton")

//Span Listeners
const running = document.getElementById("running")
const stopped = document.getElementById("stopped")

//Status Buttons
const hideElement = function(elem) {
    elem.style.display = 'none'
}

const showElement = function(elem) {
    elem.style.display = ''
}

const disableElement = function(elem) {
    elem.disabled = true
}

const enableElement = function(elem) {
    elem.disabled = false
}

const handleOnStopState = function() {
    //Spans
    showElement(stopped)
    hideElement(running)
    //Button
    disableElement(stopButton)
    enableElement(startButton)
}

const handleOnStartState = function() {
    //Spans
    showElement(running)
    hideElement(stopped)
    //Button
    disableElement(startButton)
    enableElement(stopButton)
}


startButton.onclick = function() {
    handleOnStartState();
    findLinks().then(setLinks)

    const prefs = {
        title: titleElement.value,
        chapter: chapterElement.value,
        language: languageElement.value
    }
    console.log("passed")
    chrome.runtime.sendMessage({ event: 'onStart', prefs})
}

stopButton.onclick = function() {
    handleOnStopState();
    chrome.runtime.sendMessage({ event: 'onStop'})
}


chrome.storage.local.get(["title", "chapter", "language", "isRunning"], (result) => {
    const {title, chapter, language, isRunning} = result;

    if (title) {
        titleElement.value = title
    }
    if (chapter) {
        chapterElement.value = chapter
    }
    if (language) {
        languageElement.value = language
    }
    if (isRunning) {
        handleOnStartState();
    }   
    else {
        handleOnStopState();
    }
})

//AI Operation
findLinks = function() {
    const title = titleElement.value
    const chapter = chapterElement.value
    const language = languageElement.value

    const promptText = `I need 5 links to 
    a manga named ${title} on chapter ${chapter} in ${language}.
    CRITICAL INSTRUCTIONS:
    Also make sure that the links are valid and that they go actual websites.
    See if you can find any links to places like Mangadex, Asura Scans, or Comix.to since they are reliable.
    Output ONLY the raw URLS, all on one line, each seperated by a space.
    Do not include any titles, summaries, or bullet points.
    Do not include any introductory sentences (e.g., 'Here are your links').
    Do not include any concluding sentences.
    Your entire response must consist solely of the web addresses.
    `

     return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            { type: "ASK_GEMINI", prompt: promptText },
            (response) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                    return;
                }

                resolve(response.text.split(" "));
            }
        );
    });
}

const setLinks = function(links) {

    linkDropdownElement.innerHTML = ""
    let defSelect = document.createElement("option")
    defSelect.innerHTML = "Select a Link"
    linkDropdownElement.appendChild(defSelect)


    console.log(links)
    console.log(typeof links)
    links.forEach(link => {
        let optionElement = document.createElement("option")
        optionElement.value = link
        optionElement.innerHTML = "Link"
        linkDropdownElement.appendChild(optionElement)
    })
    handleOnStopState();
    chrome.runtime.sendMessage({ event: 'onStop'})
}
