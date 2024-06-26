const voice_container = document.getElementById('voice_container');
const voice_info_text = document.getElementById('voice_info_text');
var svg_path = document.getElementById('svg_path');
const svg = document.getElementById('svg');
const phase = document.getElementById('phase');
const current_word = document.getElementById('current_word');
const wait_red = "#FFAAAA"
const sleep_path = '<path id="svg_path" d="M20.026 17.001c-2.762 4.784-8.879 6.423-13.663 3.661A9.965 9.965 0 0 1 3.13 17.68a.75.75 0 0 1 .365-1.132c3.767-1.348 5.785-2.91 6.956-5.146 1.232-2.353 1.551-4.93.689-8.463a.75.75 0 0 1 .769-.927 9.961 9.961 0 0 1 4.457 1.327c4.784 2.762 6.423 8.879 3.66 13.662Z" fill="#ffffff"/>'
const mic_path = '<path id="svg_path" d="M18.25 11a.75.75 0 0 1 .743.648l.007.102v.5a6.75 6.75 0 0 1-6.249 6.732l-.001 2.268a.75.75 0 0 1-1.493.102l-.007-.102v-2.268a6.75 6.75 0 0 1-6.246-6.496L5 12.25v-.5a.75.75 0 0 1 1.493-.102l.007.102v.5a5.25 5.25 0 0 0 5.034 5.246l.216.004h.5a5.25 5.25 0 0 0 5.246-5.034l.004-.216v-.5a.75.75 0 0 1 .75-.75ZM12 2a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4Z" fill="#ffffff"/>'
const gen_path = '<path id="svg_path" d="M8.664 15.735c.245.173.537.265.836.264v-.004a1.442 1.442 0 0 0 1.327-.872l.613-1.864a2.872 2.872 0 0 1 1.817-1.812l1.778-.578a1.443 1.443 0 0 0-.052-2.74l-1.755-.57a2.876 2.876 0 0 1-1.822-1.823l-.578-1.777a1.446 1.446 0 0 0-2.732.022l-.583 1.792a2.877 2.877 0 0 1-1.77 1.786l-1.777.571a1.444 1.444 0 0 0 .017 2.734l1.754.569a2.887 2.887 0 0 1 1.822 1.826l.578 1.775c.099.283.283.528.527.7Zm7.667 5.047a1.123 1.123 0 0 1-.41-.549l-.328-1.007a1.293 1.293 0 0 0-.821-.823l-.991-.323A1.148 1.148 0 0 1 13 16.997a1.143 1.143 0 0 1 .771-1.08l1.006-.326a1.3 1.3 0 0 0 .8-.819l.324-.992a1.143 1.143 0 0 1 2.157-.021l.329 1.014a1.3 1.3 0 0 0 .82.816l.992.323a1.141 1.141 0 0 1 .039 2.165l-1.014.329a1.3 1.3 0 0 0-.818.822l-.322.989c-.078.23-.226.43-.425.57a1.14 1.14 0 0 1-1.328-.005Z" fill="#ffffff"/>'
const speak_path = '<path id="svg_path" d="M14.754 15a2.249 2.249 0 0 1 2.249 2.249v.918a2.75 2.75 0 0 1-.513 1.6C14.945 21.93 12.42 23 9 23c-3.421 0-5.944-1.072-7.486-3.236a2.75 2.75 0 0 1-.51-1.596v-.92A2.249 2.249 0 0 1 3.251 15h11.502Zm4.3-13.596a.75.75 0 0 1 1.023.279A12.693 12.693 0 0 1 21.75 8c0 2.254-.586 4.424-1.684 6.336a.75.75 0 1 1-1.3-.746A11.195 11.195 0 0 0 20.25 8c0-1.983-.513-3.89-1.475-5.573a.75.75 0 0 1 .279-1.023ZM9 3.004a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm6.588.396a.75.75 0 0 1 1.023.28A8.712 8.712 0 0 1 17.75 8c0 1.538-.398 3.02-1.144 4.328a.75.75 0 1 1-1.303-.743A7.214 7.214 0 0 0 16.25 8a7.213 7.213 0 0 0-.943-3.578.75.75 0 0 1 .281-1.022Z" fill="#ffffff"/>'
const gen_blue = "#AACCFF"
const speak_green = "#ACFFAA"
const wait_gray = "#DDDDDD"
var starting = false
var voice_num = 0
var messages = []
var end_ready = false


current_word.style.opacity = "1";

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
    phase.style.opacity = "1"
    voice_container.style.borderColor = wait_gray;
    voice_info_text.innerText = "Sleeping";
    svg.innerHTML = sleep_path;
    document.getElementById('svg_path').style.fill = wait_gray;
    voice_info_text.style.color = wait_gray;
}

const recording = () => {
    phase.style.opacity = "0"
    voice_container.style.borderColor = wait_red;
    voice_info_text.innerText = "Waiting";
    svg.innerHTML = mic_path;
    document.getElementById('svg_path').style.fill = wait_red;
    voice_info_text.style.color = wait_red;
}

const generate = () => {
    voice_container.style.borderColor = gen_blue;
    voice_info_text.innerText = "Generating";
    svg.innerHTML = gen_path;
    document.getElementById('svg_path').style.fill = gen_blue;
    voice_info_text.style.color = gen_blue;
}

const speak = () => {
    voice_container.style.borderColor = speak_green;
    voice_info_text.innerText = "Speaking";
    svg.innerHTML = speak_path;
    document.getElementById('svg_path').style.fill = speak_green;
    voice_info_text.style.color = speak_green;
}

const generate_ai = async (text) => {
    current_word.innerText = ""
    let total = ""
    const stream = model.promptStreaming(`Please respond in one or two sentences to the conversation below. ${messages.map((message) => `${message.role}: ${message.content}`).join("\n")}\n user: ${text.trim()}\n assistant:`);
    for await (const response of stream) {
        total = response;
    }
    messages.push({ "role": "user", "content": text });
    messages.push({ "role": "assistant", "content": total });
    voice(total)
}

const record = () => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        if (!recognition) {
            console.log('Speech recognition is not available');
        } else if (!('ontouchstart' in window)) {
            const recognition_2 = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition_2.lang = 'en-US';
            recognition_2.interimResults = false;
            recognition_2.maxAlternatives = 1;
            let lastResult = '';
            setTimeout(() => {
                end_ready = true;
            }, 200);
            
            recognition_2.onresult = (event) => {
                end_ready = false;
                const currentSpokenText = event.results[0][0].transcript;
                lastResult = currentSpokenText.replace(" full stop",".").replace(" question mark","?").replace(" exclamation mark","!").replace("full stop",".").replace("question mark","?").replace("exclamation mark","!");
                lastResult = lastResult.split(/(?<=\.|\?|\!)\s/);
                lastResult = lastResult.map(lastResult => lastResult.charAt(0).toUpperCase() + lastResult.slice(1));
                lastResult = lastResult.join(" ");
                generate();
                generate_ai(lastResult);
            };
            
            recognition_2.onend = () => {
                if (end_ready) {
                    console.log("end");
                    end_ready = false;
                    assistant();
                }
            };
            
            recognition_2.start();
        }
    }
};



const voice = (text) => {
    speak()
    starting = false;
    if ('speechSynthesis' in window) {
        console.log("text");
        var chunks = text.match(/[^.!?\n]+[.!?\n]/g);
        if (chunks === null) {
            chunks = [text];
        }
        console.log(chunks);
        const utterance = new SpeechSynthesisUtterance();

        const playNextChunk = (index) => {
            if (index >= chunks.length) {
                current_word.style.opacity = "0";
                recording();
                record();

                return;
            }

            utterance.text = chunks[index];
            speechSynthesis.speak(utterance);

            utterance.onboundary = (event) => {
                if (event.name === 'word') {
                    current_word.style.opacity = "1";
                    const currentWord = utterance.text.substring(event.charIndex, event.charIndex + event.charLength);
                    current_word.innerText += " "+currentWord;
                }
            };

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
    messages = []
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    let recognizedText = "";
    wait()
    recognition.onresult = function(event) {
        const result = event.results[event.results.length - 1][0].transcript;
        console.log(result)
        if (result.toLowerCase().includes("local chat")) {
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