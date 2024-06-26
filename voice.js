const voice_container = document.getElementById('voice_container');
const voice_info_text = document.getElementById('voice_info_text');
const svg_path = document.getElementById('svg_path');
const wait_red = "#FFAAAA"
const gen_blue = "#AACCFF"
const speak_green = "#ACFFAA"
const wait_gray = "#DDDDDD"
var starting = false
var voice_num = 0


window.addEventListener("load", async () => {
    const hasAI = window.ai != null;
    
    const hasNano =
        (hasAI && (await window.ai.canCreateTextSession())) === "readily";
    
    if (!hasNano) {
        window.location.href = "/guide.html"
        return;
    }
    model = await window.ai.createTextSession();
})

const wait = () => {
    voice_container.style.borderColor = wait_gray;
    voice_info_text.innerText = "Waiting";
    svg_path.style.fill = wait_gray;
    voice_info_text.style.color = wait_gray;
}

const recording = () => {
    voice_container.style.borderColor = wait_red;
    voice_info_text.innerText = "Listening";
    svg_path.style.fill = wait_red;
    voice_info_text.style.color = wait_red;
}

const generate = () => {
    voice_container.style.borderColor = gen_blue;
    voice_info_text.innerText = "Generating";
    svg_path.style.fill = gen_blue;
    voice_info_text.style.color = gen_blue;
}

const speak = () => {
    voice_container.style.borderColor = speak_green;
    voice_info_text.innerText = "Speaking";
    svg_path.style.fill = speak_green;
    voice_info_text.style.color = speak_green;
}

const generate_ai = async (text) => {
    let total = ""
    const stream = model.promptStreaming(`Respond to this in one sentence: ${text}`);
    for await (const response of stream) {
        total = response;
    }
    voice(total)
}

const record = () => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        if (!recognition) {
            console.log('Speech recognition is not available');
        } else if (!('ontouchstart' in window)) {
                const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
                recognition.lang = 'en-US';
                recognition.interimResults = false;
                recognition.maxAlternatives = 1;
                let lastResult = '';
                recognition.onresult = () => {
                    lastResult = event.results[0][0].transcript;
                    lastResult = lastResult.replace(" full stop",".").replace(" question mark","?").replace(" exclamation mark","!").replace("full stop",".").replace("question mark","?").replace("exclamation mark","!");
                    lastResult = lastResult.split(/(?<=\.|\?|\!)\s/);
                    lastResult = lastResult.map(lastResult => lastResult.charAt(0).toUpperCase() + lastResult.slice(1));
                    lastResult = lastResult.join(" ");
                    generate()
                    generate_ai(lastResult)
                };
                recognition.onend = () => {
                }
                recognition.start();
        }
    }
}

const voice = (text) => {
    speak()
    starting = false;
    if ('speechSynthesis' in window) {
        console.log("text")
        const maxChunkLength = 200;
        const chunks = text.match(/[^.!?\n]+[.!?\n]/g);
        if (chunks === null) {
            chunks = [text];
        }
        console.log(chunks)
        const utterance = new SpeechSynthesisUtterance();
        const playNextChunk = (index) => {
            if (index >= chunks.length) {
                assistant();
                return;
            }
            utterance.text = chunks[index];
            speechSynthesis.speak(utterance);
            utterance.onend = () => {
                playNextChunk(index + 1);
            };
        };
    playNextChunk(0);
    } else {
        console.log("Speech synthesis not available.");
    }
};

const assistant = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    let recognizedText = "";
    wait()
    recognition.onresult = function(event) {
        const result = event.results[event.results.length - 1][0].transcript;
        console.log(result)
        if (result.replace(/\s+/g, '').startsWith("Phoenix")) {
            recognition.stop()
            recording()
            console.log("Starting")
            starting = true
            record()
      }
    
      else {
        recognizedText += result;
      }
    }
    recognition.onend = function() {
        if(!starting){
            assistant()
        }
    }
    recognition.start();
}

assistant()