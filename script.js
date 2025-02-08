const message_container = document.getElementById("message-container");
const close_button = document.getElementById("close_button");
const send_button = document.getElementById("send_button");
const input = document.getElementById("user-input");
const welcome = document.getElementById("welcome");
const clear_button = document.getElementById("clear");
const past_chats = document.getElementById("past_chats")
const clear_chats = document.getElementById("clear_chats")
const thinkingEnabled = document.getElementById("thinkingEnabled")



var current_chat_id, chat_id, chats,current_chat;
var PDF_content = ""
var thinking = false;
var fileName = ""
let running = false;
let message_id = 0;
let called = false;
let messages = [];
let model = null;
const ai_guide = document.getElementById('ai_guide');

thinkingEnabled.addEventListener("click", () => {
    thinkingEnabled.classList.toggle("thinkingEnabledActive")
    if(thinkingEnabled.classList.contains("thinkingEnabledActive")){
        thinking = true
    }else{
        thinking = false
    }
})

const getNews = async () => {
    try {
        const response = await fetch('https://api.booogle.app/api');
        const data = await response.json();
        return data; // Return the data
    } catch (error) {
        console.error(error); // Log any errors
        throw error; // Re-throw the error for further handling
    }
};

const getSearch = async (query) => {
    try {
        const response = await fetch(`https://api.booogle.app/search?q=${query}`);
        const data = await response.json();
        return data; // Return the data
    } catch (error) {
        console.error(error); // Log any errors
        throw error; // Re-throw the error for further handling
    }
}


const google_bot = () => {
    return /Googlebot|Googlebot-Mobile|Googlebot-Image|AdsBot-Google/i.test(navigator.userAgent);
}

const url_find = (text) => {
    return text.match(urlPattern);
}


const scrollToBottom = () => {
    message_container.scrollTop = message_container.scrollHeight;
}
const clear = () => {
    new_chat()
    reset_chat_window()
    update_history()
}

document.addEventListener("DOMContentLoaded", async () => {
    try{
        var capabilities = await ai.languageModel.capabilities();
    }catch{
        console.error("No AI")
        window.location.href = "/error.html"
    }
    if (capabilities.available == "no" || capabilities.available == "after-download")window.location.href = "/error.html"
    load_model()
})


clear_button.addEventListener("click", clear);

document.getElementById('fileInput').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file.type !== 'application/pdf') {
        alert('Please select a PDF file.');
        return;
    }
    fileName = file.name
    document.getElementById('file_title').innerText = file.name
    document.getElementById('file_holding').style.display = "flex"
    document.getElementById("user-input").focus()
    const fileReader = new FileReader();
    fileReader.onload = function() {
        const typedArray = new Uint8Array(this.result);

        pdfjsLib.getDocument(typedArray).promise.then(function(pdf) {
            let textContent = '';

            const numPages = pdf.numPages;
            const textPromises = [];

            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                textPromises.push(pdf.getPage(pageNum).then(function(page) {
                    return page.getTextContent().then(function(text) {
                        return text.items.map(item => item.str).join(' ');
                    });
                }));
            }

            Promise.all(textPromises).then(function(pagesText) {
                textContent = pagesText.join(' ');
                PDF_content = textContent
            });
        });
    };

    fileReader.readAsArrayBuffer(file);
});

document.getElementById('upload_button').addEventListener('click', function () {
    document.getElementById('fileInput').click();
});

const removeDuplicate = (originalText, newText) => {
    const index = newText.indexOf(originalText);
    if (index !== -1) {
        return newText.substring(index + originalText.length);
    }
    return newText;
};

const start_chat = () => {
    welcome.style.display = "none"
}
input.addEventListener("input", () => {
    called = false

    if (input.value == "" || running == true) {
        send_button.disabled = true
    } else {
        send_button.disabled = false
    }

})
input.addEventListener("keyup", (event) => {
    if (event.keyCode === 13) {
        if (send_button.disabled == false) {
            event.preventDefault();
            sendMessage(document.getElementById('user-input').value)
        }
    } else if ((event.keyCode === 8 && called == true) || (event.keyCode === 8 && input.value == "")) {
        called = false
    }
});
const sendMessage = (prompt) => {
    if (prompt == "") {
        return
    }
    send_button.disabled = true
    start_chat()
    let userInput = prompt
    appendMessage(userInput, 'user');
    document.getElementById("user-input").value = "";
    scrollToBottom()
    //get_answer()
    ai_call(userInput, messages)

}

let modal
let model_new_chat

const load_model = async () => {
    console.log(messages)
    if(messages.length == 0){
        model_new_chat = true
    }else{
        model_new_chat = false
    }
    model = await ai.languageModel.create({
        systemPrompt: "Your name is Local Chat and you a AI that runs local respond to the user correctly and informatively but stay concise. NOTE: you do not have access to update info and time you cant use APIs and you are only a chatbot",
        monitor(m) {
            m.addEventListener("downloadprogress", e => {
              console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
            });
          }
    });
    thinking_model = await ai.languageModel.create({
        systemPrompt: "Think aloud about what the user is asking without answering the question come up with possible ways that would help you answer the question do stuff step by step if needed. Explore multiple different answers and branches and think which one is the best. NOTE: you do not have access to update info and time you cant use APIs and you can only chat with the user you can not search stuff and the use can not see the message that you make it is only here to help you later",
    });
}

const ai_call = async (userInput, messages) => {
    document.getElementById('file_holding').style.display = "none"
    running = true;
    let tokens = 0;
    const prompt = input.value;
    var message = prompt
    let total = ""
    let title = document.createElement("div");
    let icon = document.createElement("span");
    let name_type = document.createElement("type");
    let p = document.createElement("p");
    var position = document.createElement("span");
    var link = document.createElement("link");
    var link2 = document.createElement("link");
    var newsReports = document.createElement("div");
    var searchReports = document.createElement("div");
    newsReports.classList.add("newsReports");
    searchReports.classList.add("searchReports");
    link.rel = "stylesheet";
    link2.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/github-markdown-css@5/github-markdown-dark.min.css";
    link2.href = "https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11/styles/github-dark.min.css";
    position.id = "position_"+message_id
    position.classList.add("position")
    const zeroMd = document.createElement('zero-md');
    const template = document.createElement('template');
    template.setAttribute('data-append', '');
    const style = document.createElement('style');
    style.textContent = `
    .markdown-body {
        padding: 0px !important;
        box-sizing: border-box !important;
        border-radius: 16px !important;
        height: auto !important;
        width: auto !important;
        background-color: transparent  !important;
        border: 1px solid transparent  !important;
        margin-left: 40px !important;
        font-family: "League Spartan", system-ui !important;
    }

    .markdown-body > pre {
        background-color: #252729;
        border-radius: 16px;
    }
    .markdown-body code:not(pre > code) {
        background-color: #252729;
        border-radius: 16px;
        color:#e7b9a2;
    }
    `;
    template.content.appendChild(link);
    template.content.appendChild(link2);
    template.content.appendChild(style);

    const script = document.createElement('script');
    script.setAttribute('type', 'text/markdown');
    script.setAttribute('id', 'output');

    zeroMd.appendChild(template);
    zeroMd.appendChild(script);

    p.id = "message_" + message_id
    message_id++
    let messageDiv = document.createElement("div");
    messageDiv.classList.add("message");
    let messageContainer = document.getElementById("message-container");
    title.appendChild(icon);
    title.appendChild(name_type);
    messageDiv.appendChild(title);
    messageDiv.appendChild(position);
    messageDiv.appendChild(p);
    messageDiv.appendChild(zeroMd);
    messageContainer.appendChild(messageDiv);
    icon.classList.add("modal");
    icon.innerHTML = '<svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8.664 15.735c.245.173.537.265.836.264v-.004a1.442 1.442 0 0 0 1.327-.872l.613-1.864a2.872 2.872 0 0 1 1.817-1.812l1.778-.578a1.443 1.443 0 0 0-.052-2.74l-1.755-.57a2.876 2.876 0 0 1-1.822-1.823l-.578-1.777a1.446 1.446 0 0 0-2.732.022l-.583 1.792a2.877 2.877 0 0 1-1.77 1.786l-1.777.571a1.444 1.444 0 0 0 .017 2.734l1.754.569a2.887 2.887 0 0 1 1.822 1.826l.578 1.775c.099.283.283.528.527.7Zm7.667 5.047a1.123 1.123 0 0 1-.41-.549l-.328-1.007a1.293 1.293 0 0 0-.821-.823l-.991-.323A1.148 1.148 0 0 1 13 16.997a1.143 1.143 0 0 1 .771-1.08l1.006-.326a1.3 1.3 0 0 0 .8-.819l.324-.992a1.143 1.143 0 0 1 2.157-.021l.329 1.014a1.3 1.3 0 0 0 .82.816l.992.323a1.141 1.141 0 0 1 .039 2.165l-1.014.329a1.3 1.3 0 0 0-.818.822l-.322.989c-.078.23-.226.43-.425.57a1.14 1.14 0 0 1-1.328-.005Z" fill="#ffffff"/></svg>';
    name_type.innerHTML = "Local Chat";
    var stream
    let thought = "";
    if(thinking){
        position.classList.add("thinking");
        position.innerHTML = '<svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7.152 3.012c.832-.648 1.92-1.006 3-1.006.647 0 1.17.222 1.567.575.108.095.203.198.288.304.084-.106.18-.209.287-.304.396-.353.92-.575 1.566-.575 1.082 0 2.17.358 3.001 1.006.647.503 1.154 1.198 1.353 2.037.42.07.794.284 1.096.567.48.451.822 1.103 1.038 1.774.218.681.328 1.446.295 2.181-.017.376-.072.76-.178 1.127l.066.03c.37.174.67.447.894.81.425.685.575 1.671.575 2.928 0 1.445-.552 2.426-1.262 3.035a3.447 3.447 0 0 1-1.27.69 5.172 5.172 0 0 1-1.019 2.137c-.723.904-1.846 1.668-3.357 1.668-1.21 0-2.163-.67-2.775-1.31a5.358 5.358 0 0 1-.31-.357 5.36 5.36 0 0 1-.31.356c-.613.642-1.566 1.311-2.776 1.311-1.51 0-2.634-.764-3.357-1.668a5.171 5.171 0 0 1-1.019-2.137 3.447 3.447 0 0 1-1.27-.69c-.71-.61-1.262-1.59-1.262-3.035 0-1.257.15-2.243.575-2.928a2.096 2.096 0 0 1 .96-.84 4.892 4.892 0 0 1-.177-1.127c-.033-.735.076-1.5.295-2.181.215-.67.557-1.323 1.038-1.774a2.122 2.122 0 0 1 1.095-.567c.199-.84.706-1.534 1.353-2.037Zm.921 1.183c-.545.425-.865.991-.865 1.643a.75.75 0 0 1-.987.711c-.138-.046-.282-.035-.491.161-.231.217-.467.61-.636 1.138a4.843 4.843 0 0 0-.225 1.656c.025.556.157 1.018.366 1.33a.752.752 0 0 1 .083.166H6.4a2.85 2.85 0 0 1 2.842 2.642 2 2 0 1 1-1.507.01A1.35 1.35 0 0 0 6.4 12.5H3.8a.7.7 0 0 1-.025 0c-.15.348-.262.949-.262 1.966 0 1.021.372 1.581.74 1.897.402.345.845.435.973.435a.75.75 0 0 1 .75.75c0 .42.232 1.183.76 1.843.509.637 1.233 1.105 2.185 1.105.637 0 1.224-.358 1.69-.846.226-.238.402-.485.518-.685a1.8 1.8 0 0 0 .116-.233l.005-.014V9.25h-.895a2 2 0 1 1 0-1.5h.895V5.212l-.002-.057a3.053 3.053 0 0 0-.18-.904c-.09-.238-.207-.426-.346-.55-.123-.11-.292-.195-.57-.195-.765 0-1.525.258-2.079.69ZM12.763 17v1.718l.005.014c.02.053.058.132.116.233.116.2.292.447.518.685.466.488 1.053.846 1.69.846.953 0 1.676-.468 2.185-1.105.528-.66.76-1.424.76-1.843a.75.75 0 0 1 .75-.75c.128 0 .57-.09.974-.435.367-.316.739-.876.739-1.897 0-1.208-.158-1.83-.349-2.137a.6.6 0 0 0-.26-.245c-.102-.048-.253-.084-.488-.084a.75.75 0 0 1-.625-1.166c.209-.313.341-.774.366-1.33a4.844 4.844 0 0 0-.225-1.656c-.17-.528-.404-.92-.636-1.138-.208-.196-.353-.207-.49-.161a.75.75 0 0 1-.988-.711c0-.652-.32-1.218-.865-1.643-.554-.431-1.313-.69-2.08-.69-.277 0-.446.087-.569.196-.139.124-.255.312-.345.55a3.053 3.053 0 0 0-.18.904 2.056 2.056 0 0 0-.003.057V15.5h.637a1.35 1.35 0 0 0 1.35-1.35v-1.795a2 2 0 1 1 1.5 0v1.795A2.85 2.85 0 0 1 13.4 17h-.637ZM8.5 8a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1ZM8 15.5a.5.5 0 1 0 1 0 .5.5 0 0 0-1 0Zm7-5a.5.5 0 1 0 1 0 .5.5 0 0 0-1 0Z" fill="#ffffff"/></svg>Thinking'
        thought = "You have reasoned the users question use it to help answer:" + await thinking_model.prompt(userInput.trim());
        console.log(thought)
    }
    let startTime = new Date();
    var newsdata,searchData
    if (PDF_content == "" && model_new_chat && !userInput.toLowerCase().includes("news") && !userInput.toLowerCase().includes("?")) {
        console.log("1")
        stream = model.promptStreaming(userInput.trim());
    }else if (userInput.toLowerCase().includes("news") && model_new_chat) {
        position.classList.add("searching");
        position.innerHTML = '<svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10 2.75a7.25 7.25 0 0 1 5.63 11.819l4.9 4.9a.75.75 0 0 1-.976 1.134l-.084-.073-4.901-4.9A7.25 7.25 0 1 1 10 2.75Zm0 1.5a5.75 5.75 0 1 0 0 11.5 5.75 5.75 0 0 0 0-11.5Z" fill="#ffffff"/></svg>Searching'
        await getNews().then(data => {
            newsdata = data
            stream = model.promptStreaming(`Latest News Reports make sure to only use data given to you and also make sure that you dont mix reports but you can report on multiple at a time do not use links: ${JSON.stringify(data)}\n\n${userInput.trim()}`);
        }).catch(error => {
            console.log("Error fetching news:", error);
        });
    }else if (userInput.toLowerCase().includes("news") && !model_new_chat) {
        position.classList.add("searching");
        position.innerHTML = '<svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10 2.75a7.25 7.25 0 0 1 5.63 11.819l4.9 4.9a.75.75 0 0 1-.976 1.134l-.084-.073-4.901-4.9A7.25 7.25 0 1 1 10 2.75Zm0 1.5a5.75 5.75 0 1 0 0 11.5 5.75 5.75 0 0 0 0-11.5Z" fill="#ffffff"/></svg>Searching'
        await getNews(userInput.trim()).then(data => {
            newsdata = data
            stream = model.promptStreaming(`Latest News Reports make sure to only use data given to you and also make sure that you dont mix reports but you can report on multiple at a time do not use links: ${JSON.stringify(data)}. ${messages.map((message) => `${message.role}: ${message.content}`).join("\n")}\n user: ${userInput.trim()}\n assistant:`);
        }).catch(error => {
            console.log("Error fetching news:", error);
        });
    }
    else if(PDF_content != "" && model_new_chat){
        console.log("2")
        stream = model.promptStreaming(`${PDF_content.substring(0, 3000)}\n\n${userInput.trim()}`);
    }else if(PDF_content == "" && model_new_chat){
        stream = model.promptStreaming(`${thought}\n\n ${messages.map((message) => `${message.role}: ${message.content}`).join("\n")}\n user: ${userInput.trim()}\n assistant:`);
    }else{
        stream = model.promptStreaming(`${thought}\n\n ${PDF_content.substring(0, 3000)}. ${messages.map((message) => `${message.role}: ${message.content}`).join("\n")}\n user: ${userInput.trim()}\n assistant:`);
    }
    position.classList.remove("thinking");
    position.classList.add("genning");
    position.innerHTML = `<svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8.664 15.735c.245.173.537.265.836.264v-.004a1.442 1.442 0 0 0 1.327-.872l.613-1.864a2.872 2.872 0 0 1 1.817-1.812l1.778-.578a1.443 1.443 0 0 0-.052-2.74l-1.755-.57a2.876 2.876 0 0 1-1.822-1.823l-.578-1.777a1.446 1.446 0 0 0-2.732.022l-.583 1.792a2.877 2.877 0 0 1-1.77 1.786l-1.777.571a1.444 1.444 0 0 0 .017 2.734l1.754.569a2.887 2.887 0 0 1 1.822 1.826l.578 1.775c.099.283.283.528.527.7Zm-.374-4.25a4.054 4.054 0 0 0-.363-.413h.003a4.394 4.394 0 0 0-1.72-1.063l-1.6-.508 1.611-.524a4.4 4.4 0 0 0 1.69-1.065 4.448 4.448 0 0 0 1.041-1.708l.515-1.582.516 1.587a4.374 4.374 0 0 0 2.781 2.773l1.62.522-1.59.515a4.379 4.379 0 0 0-2.774 2.775l-.515 1.582-.515-1.585a4.368 4.368 0 0 0-.7-1.306Zm8.041 9.297a1.123 1.123 0 0 1-.41-.549l-.328-1.007a1.293 1.293 0 0 0-.821-.823l-.991-.323A1.148 1.148 0 0 1 13 16.997a1.143 1.143 0 0 1 .771-1.08l1.006-.326a1.3 1.3 0 0 0 .8-.819l.324-.992a1.143 1.143 0 0 1 2.157-.021l.329 1.014a1.3 1.3 0 0 0 .82.816l.992.323a1.141 1.141 0 0 1 .039 2.165l-1.014.329a1.3 1.3 0 0 0-.818.822l-.322.989c-.078.23-.226.43-.425.57a1.14 1.14 0 0 1-1.328-.005Zm-1.03-3.783A2.789 2.789 0 0 1 17 18.708a2.794 2.794 0 0 1 1.7-1.7 2.813 2.813 0 0 1-1.718-1.708A2.806 2.806 0 0 1 15.3 17Z" fill="#ffffff"/></svg>Generating`
    const generate = async () => {
        for await (const response of stream) {
            script.textContent += response;
            tokens += 1;
            total += response;
            var current_time = new Date();
            var current_time_taken = current_time - startTime;
            if (current_time_taken != undefined) {
                document.getElementById("time_speed").innerText = (current_time_taken / 1000).toFixed(2) + " sec";
                document.getElementById("time_speed").style.display = "block";
            }
            let tokens_sec = tokens / (current_time_taken / 1000);
            speed.style.display = "block";
            document.getElementById("speed").innerText = tokens_sec.toFixed(2) + " tok/s";
            scrollToBottom()
        }
    }
    await generate();
    if (newsdata != undefined) {
        var newsContainerTitle = document.createElement("strong");
        var newsContainer = document.createElement("div");
        newsContainerTitle.innerHTML = "News Reports <span>Beta</span>";
        newsContainerTitle.classList.add("newsContainerTitle");
        newsContainer.classList.add("newsContainer");
        newsContainer.appendChild(newsContainerTitle);
        messageContainer.appendChild(newsContainer);
        var rendedSources = []
        async function renderNews() {
            for (const element of newsdata.Latest) {
                if (rendedSources.includes(element.title)) {
                    continue;
                }
                rendedSources.push(element.title);
                var newsReport = document.createElement("a");
                newsReport.classList.add("newsReport");
                var newsImage = document.createElement("img");
                var newsTitle = document.createElement("p");
                console.log(element.image_link);
                if (element.image_link == null) {
                    newsImage.src = "/images/placeholder.png";
                } else {
                    newsImage.src = element.image_link;
                }
                newsTitle.innerText = element.title;
                newsReport.href = element.news_link;
                newsReport.target = "_blank";
                newsReport.appendChild(newsImage);
                newsReport.appendChild(newsTitle);
                newsReports.appendChild(newsReport);
        
                // Wait for 1 second before processing the next element
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        
            newsContainer.appendChild(newsReports);
        }
        
        renderNews();
    
        newsContainer.appendChild(newsReports);
    }else if(searchData != undefined){
        var searchContainerTitle = document.createElement("strong");
        var searchContainer = document.createElement("div");
        searchContainerTitle.innerHTML = "Sources <span>Beta</span>";
        searchContainerTitle.classList.add("searchContainerTitle");
        searchContainer.classList.add("searchContainer");
        searchContainer.appendChild(searchContainerTitle);
        messageContainer.appendChild(searchContainer);
        var rendedSources = []
        async function renderSearch() {
            for (const element of searchData) {
                if (rendedSources.includes(element.title)|| element.content == null) {
                    continue;
                }
                rendedSources.push(element.title);
                var searchReport = document.createElement("a");
                searchReport.classList.add("newsReport");
                var searchTitle = document.createElement("p");
                searchTitle.innerText = element.title;
                searchReport.href = element.link;
                searchReport.target = "_blank";
                searchReport.appendChild(searchTitle);
                searchReports.appendChild(searchReport);
        
                // Wait for 1 second before processing the next element
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        
            searchContainer.appendChild(searchReports);
        }
        
        renderSearch();
    }
    messages.push({ "role": "user", "content": userInput });
    messages.push({ "role": "assistant", "content": total });
    var extra = ""
    if (PDF_content != "") {
        extra = {"pdf":PDF_content,"file_name":fileName}
    }else if(userInput.toLowerCase().includes("news")){
        extra = {"news":newsdata}
    }
    var history = JSON.parse(localStorage.getItem("history"))
    history["chats"][history.current_chat_id] = {"messages":messages,"extra":extra}
    localStorage.setItem("history", JSON.stringify(history))
    update_history()

    position.innerHTML = `<svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4.53 12.97a.75.75 0 0 0-1.06 1.06l4.5 4.5a.75.75 0 0 0 1.06 0l11-11a.75.75 0 0 0-1.06-1.06L8.5 16.94l-3.97-3.97Z" fill="#ffffff"/></svg>Complete`
    position.classList.remove("genning");
    position.classList.add("done");
    let endTime = new Date();
    let timeTaken = endTime - startTime;
    let tokens_sec = tokens / (timeTaken / 1000);
    speed.style.display = "block";
    speed.textContent = `${timeTaken} ms`;
    running = false;
    if (input.value == "") {
        send_button.disabled = true
    }else{
        send_button.disabled = false
    }
    document.getElementById("speed").innerText = tokens_sec.toFixed(2) + " tok/s";
    if (timeTaken != undefined) {
        document.getElementById("time_speed").innerText = (timeTaken / 1000).toFixed(2) + " sec";
        document.getElementById("time_speed").style.display = "block";
    }
}

const getDomainFromUrl = (url) => {
    return null;
}

function appendMessage(message, role) {
    let messageContainer = document.getElementById("message-container");
    let messageDiv = document.createElement("div");
    let title = document.createElement("div");
    let icon = document.createElement("span");
    let type = document.createElement("type");
    let p = document.createElement("p");
    icon.classList.add("user_icon");
    icon.innerHTML = '<svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.754 14a2.249 2.249 0 0 1 2.25 2.249v.918a2.75 2.75 0 0 1-.513 1.599C17.945 20.929 15.42 22 12 22c-3.422 0-5.945-1.072-7.487-3.237a2.75 2.75 0 0 1-.51-1.595v-.92a2.249 2.249 0 0 1 2.249-2.25h11.501ZM12 2.004a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z" fill="#ffffff"/></svg>';
    type.innerHTML = "You";
    title.appendChild(icon);
    title.appendChild(type);
    messageDiv.appendChild(title);
    messageDiv.appendChild(p);
    if (PDF_content != "") {
        var span = document.createElement("span");
        span.classList.add("file_message")
        var pdf_icon = document.createElement("span");
        pdf_icon.classList.add("file_icon");
        var pfd_title = document.createElement("strong");
        var file_text = document.createElement("span");
        file_text.classList.add("file_text")
        pfd_title.innerText = fileName
        pdf_icon.innerHTML = '<svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7.503 13.002a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 1 0v-.5H8.5a1.5 1.5 0 0 0 0-3h-.997Zm.997 2h-.497v-1H8.5a.5.5 0 1 1 0 1ZM14.998 13.501a.5.5 0 0 1 .5-.499h1.505a.5.5 0 1 1 0 1h-1.006l-.001 1.002h1.007a.5.5 0 0 1 0 1h-1.007l.002.497a.5.5 0 0 1-1 .002l-.003-.998v-.002l.003-2.002ZM11.5 13.002a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h.498a2 2 0 0 0 0-4H11.5Zm.5 3v-2a1 1 0 0 1 0 2Z" fill="#ffffff"/><path d="M20 20v-1.164c.591-.281 1-.884 1-1.582V12.75c0-.698-.409-1.3-1-1.582v-1.34a2 2 0 0 0-.586-1.414l-5.829-5.828a.491.491 0 0 0-.049-.04.63.63 0 0 1-.036-.03 2.072 2.072 0 0 0-.219-.18.652.652 0 0 0-.08-.044l-.048-.024-.05-.029c-.054-.031-.109-.063-.166-.087a1.977 1.977 0 0 0-.624-.138c-.02-.001-.04-.004-.059-.007A.605.605 0 0 0 12.172 2H6a2 2 0 0 0-2 2v7.168c-.591.281-1 .884-1 1.582v4.504c0 .698.409 1.3 1 1.582V20a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2Zm-2 .5H6a.5.5 0 0 1-.5-.5v-.996h13V20a.5.5 0 0 1-.5.5Zm.5-10.5v1h-13V4a.5.5 0 0 1 .5-.5h6V8a2 2 0 0 0 2 2h4.5Zm-1.122-1.5H14a.5.5 0 0 1-.5-.5V4.621L17.378 8.5Zm-12.628 4h14.5a.25.25 0 0 1 .25.25v4.504a.25.25 0 0 1-.25.25H4.75a.25.25 0 0 1-.25-.25V12.75a.25.25 0 0 1 .25-.25Z" fill="#ffffff"/></svg>'
        span.appendChild(pdf_icon);
        file_text.appendChild(pfd_title);
        span.appendChild(file_text);
        messageDiv.appendChild(span);
    }
    p.textContent = message;
    messageDiv.classList.add("message");
    messageContainer.appendChild(messageDiv);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

const fileReader = new FileReader();
fileReader.onload = function() {
    const typedArray = new Uint8Array(this.result);

    pdfjsLib.getDocument(typedArray).promise.then(function(pdf) {
        let textContent = '';

        const numPages = pdf.numPages;
        const textPromises = [];

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            textPromises.push(pdf.getPage(pageNum).then(function(page) {
                return page.getTextContent().then(function(text) {
                    return text.items.map(item => item.str).join(' ');
                });
            }));
        }

        Promise.all(textPromises).then(function(pagesText) {
            textContent = pagesText.join(' ');
            document.getElementById('textContent').textContent = textContent;
        });
    });
};

const appendMessage_ai = (message,extra,humanMessage) => {
    let title = document.createElement("div");
    let icon = document.createElement("span");
    let name_type = document.createElement("type");
    let p = document.createElement("p");
    var position = document.createElement("span");
    var link = document.createElement("link");
    var link2 = document.createElement("link");
    var newsReports = document.createElement("div");
    newsReports.classList.add("newsReports");
    link.rel = "stylesheet";
    link2.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/github-markdown-css@5/github-markdown-dark.min.css";
    link2.href = "https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11/styles/github-dark.min.css";
    position.id = "position_"+message_id
    position.classList.add("position")
    const zeroMd = document.createElement('zero-md');
    const template = document.createElement('template');
    template.setAttribute('data-append', '');
    const style = document.createElement('style');
    style.textContent = `
    .markdown-body {
        padding: 0px !important;
        box-sizing: border-box !important;
        border-radius: 16px !important;
        height: auto !important;
        width: auto !important;
        background-color: transparent  !important;
        border: 1px solid transparent  !important;
        margin-left: 40px !important;
        font-family: "Manrope", sans-serif !important;
    }

    .markdown-body > pre {
        background-color: #252729;
        border-radius: 16px;
    }
    .markdown-body code:not(pre > code) {
        background-color: #252729;
        border-radius: 16px;
        color:#e7b9a2;
    }
    `;
    template.content.appendChild(link);
    template.content.appendChild(link2);
    template.content.appendChild(style);
    const script = document.createElement('script');
    script.setAttribute('type', 'text/markdown');
    script.setAttribute('id', 'output');

    zeroMd.appendChild(template);
    zeroMd.appendChild(script);
    script.textContent = message;
    p.id = "message_" + message_id
    message_id++
    let messageDiv = document.createElement("div");
    messageDiv.classList.add("message");
    let messageContainer = document.getElementById("message-container");
    title.appendChild(icon);
    title.appendChild(name_type);
    messageDiv.appendChild(title);
    messageDiv.appendChild(position);
    messageDiv.appendChild(p);
    messageDiv.appendChild(zeroMd);
    messageContainer.appendChild(messageDiv);
    icon.classList.add("modal");
    icon.innerHTML = '<svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8.664 15.735c.245.173.537.265.836.264v-.004a1.442 1.442 0 0 0 1.327-.872l.613-1.864a2.872 2.872 0 0 1 1.817-1.812l1.778-.578a1.443 1.443 0 0 0-.052-2.74l-1.755-.57a2.876 2.876 0 0 1-1.822-1.823l-.578-1.777a1.446 1.446 0 0 0-2.732.022l-.583 1.792a2.877 2.877 0 0 1-1.77 1.786l-1.777.571a1.444 1.444 0 0 0 .017 2.734l1.754.569a2.887 2.887 0 0 1 1.822 1.826l.578 1.775c.099.283.283.528.527.7Zm7.667 5.047a1.123 1.123 0 0 1-.41-.549l-.328-1.007a1.293 1.293 0 0 0-.821-.823l-.991-.323A1.148 1.148 0 0 1 13 16.997a1.143 1.143 0 0 1 .771-1.08l1.006-.326a1.3 1.3 0 0 0 .8-.819l.324-.992a1.143 1.143 0 0 1 2.157-.021l.329 1.014a1.3 1.3 0 0 0 .82.816l.992.323a1.141 1.141 0 0 1 .039 2.165l-1.014.329a1.3 1.3 0 0 0-.818.822l-.322.989c-.078.23-.226.43-.425.57a1.14 1.14 0 0 1-1.328-.005Z" fill="#ffffff"/></svg>';
    name_type.innerHTML = "Local Chat";
    position.innerHTML = `<svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4.53 12.97a.75.75 0 0 0-1.06 1.06l4.5 4.5a.75.75 0 0 0 1.06 0l11-11a.75.75 0 0 0-1.06-1.06L8.5 16.94l-3.97-3.97Z" fill="#ffffff"/></svg>Complete`
    position.classList.remove("genning");
    position.classList.add("done");
    if(humanMessage.toLowerCase().includes("news")){
        var newsContainerTitle = document.createElement("strong");
        var newsContainer = document.createElement("div");
        newsContainerTitle.innerHTML = "News Reports <span>Beta</span>";
        newsContainerTitle.classList.add("newsContainerTitle");
        newsContainer.classList.add("newsContainer");
        newsContainer.appendChild(newsContainerTitle);
        messageContainer.appendChild(newsContainer);

        var newsdata = extra["news"]
        if (newsdata != undefined) {
            var rendedSources = []
            newsdata.Latest.forEach(element => {
                if (rendedSources.includes(element.title)) {
                    return
                }
                rendedSources.push(element.title)
                var newsReport = document.createElement("a");
                newsReport.classList.add("newsReport");
                var newsImage = document.createElement("img");
                var newsTitle = document.createElement("p");
                console.log(element.image_link)
                if (element.image_link == null) {
                    newsImage.src = "/images/placeholder.png";
                }else{
                    newsImage.src = element.image_link;
                }
                newsTitle.innerText = element.title;
                newsReport.href = element.news_link;
                newsReport.target = "_blank";
                newsReport.appendChild(newsImage);
                newsReport.appendChild(newsTitle);
                newsReports.appendChild(newsReport);
                
            });
        
            newsContainer.appendChild(newsReports);
        }
    }
}

const load_messages = () => {
    if (localStorage.getItem("history") != null) {
        var history = JSON.parse(localStorage.getItem("history"));
        current_chat_id = history.current_chat_id;
        chat_id = history.chat_id;
        chats = history.chats;
        current_chat = chats[current_chat_id];
        extra = current_chat.extra
        if ((current_chat != undefined) && (Object.keys(current_chat).length != 0)){
            messages = current_chat.messages;
            welcome.style.display = "none"
            var lastUserMessage = ""
            current_chat.messages.forEach(element => {
                if (element.role == "user") {
                    lastUserMessage = element.content
                    appendMessage(element.content, "user");

                } else {
                    appendMessage_ai(element.content,extra,lastUserMessage);
                }
            });
        }
        update_history()
    }else{
        var history_format = {
            "current_chat_id":0,
            "chat_id":0,
            "chats":{}
        }
        localStorage.setItem("history", JSON.stringify(history_format));
        new_chat()
        update_history()
    }
}

const update_history = () => {
    past_chats.innerHTML = ""
    var history = JSON.parse(localStorage.getItem("history"));
    var deleting = false
    current_chat_id = history.current_chat_id;
    chat_id = history.chat_id;
    chats = history.chats;
    Object.keys(chats).forEach(element => {
        var history_element = document.createElement("div");
        history_element.classList.add("history_element");
        if (element == current_chat_id) {
            history_element.classList.add("current_chat")
        }
        var history_title = document.createElement("span");
        var delete_button = document.createElement("button");

        delete_button.innerHTML = '<svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 1.75a3.25 3.25 0 0 1 3.245 3.066L15.25 5h5.25a.75.75 0 0 1 .102 1.493L20.5 6.5h-.796l-1.28 13.02a2.75 2.75 0 0 1-2.561 2.474l-.176.006H8.313a2.75 2.75 0 0 1-2.714-2.307l-.023-.174L4.295 6.5H3.5a.75.75 0 0 1-.743-.648L2.75 5.75a.75.75 0 0 1 .648-.743L3.5 5h5.25A3.25 3.25 0 0 1 12 1.75Zm6.197 4.75H5.802l1.267 12.872a1.25 1.25 0 0 0 1.117 1.122l.127.006h7.374c.6 0 1.109-.425 1.225-1.002l.02-.126L18.196 6.5ZM13.75 9.25a.75.75 0 0 1 .743.648L14.5 10v7a.75.75 0 0 1-1.493.102L13 17v-7a.75.75 0 0 1 .75-.75Zm-3.5 0a.75.75 0 0 1 .743.648L11 10v7a.75.75 0 0 1-1.493.102L9.5 17v-7a.75.75 0 0 1 .75-.75Zm1.75-6a1.75 1.75 0 0 0-1.744 1.606L10.25 5h3.5A1.75 1.75 0 0 0 12 3.25Z" fill="#ffffff"/></svg>'
        if (Object.keys(chats[element]).length != 0){
            console.log(chats[element].messages[0].content)
            history_title.innerText = chats[element].messages[0].content.substring(0, 40);
        }else{
            history_title.innerText = "New Chat"
        }
        
        delete_button.addEventListener("click", () => {
            deleting = true
            delete chats[element];
            localStorage.setItem("history", JSON.stringify(history));
            if (element == current_chat_id) {
                new_chat()
            }
            reset_chat_window()
            update_history()
        })
        history_element.addEventListener("click", (e) => {
            if (!deleting) {
                history = JSON.parse(localStorage.getItem("history"));
                history.current_chat_id = element;
                localStorage.setItem("history", JSON.stringify(history));
                reset_chat_window()
            }
        })
        history_element.appendChild(history_title);
        history_element.appendChild(delete_button);
        past_chats.appendChild(history_element);

    })
}

const reset_chat_window = () => {
    input.focus()
    message_container.innerHTML = ""
    messages = []
    welcome.style.display = "flex"
    load_messages()
    load_model()
}

clear_chats.addEventListener("click", () => {
    var history = {
        "current_chat_id":0,
        "chat_id":0,
        "chats":{}
    }
    localStorage.setItem("history", JSON.stringify(history))
    new_chat()
    reset_chat_window()
    update_history()
})

const new_chat = () => {
    var history = JSON.parse(localStorage.getItem("history"))
    chat_id = history.chat_id + 1;
    history.chat_id = chat_id;
    history.current_chat_id = history.chat_id;
    history["chats"][chat_id] = {}
    console.log(history)
    localStorage.setItem("history", JSON.stringify(history))
    console.log(JSON.parse(localStorage.getItem("history")))
    return
}



load_messages()


function extractUsefulText(url) {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then(response => response.text())
        .then(html => {
          // Create a DOM element to parse the HTML
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
  
          // Select elements that likely contain useful text (adjust selectors as needed)
          const textElements = doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, span');
  
          // Extract text from selected elements and filter out unwanted content
          const extractedText = Array.from(textElements)
            .map(element => element.textContent)
            .filter(text => {
              // Add your filtering criteria here, e.g., remove stop words, punctuation, etc.
              return text.trim() !== '';
            });
  
          resolve(extractedText.join(' '));
        })
        .catch(error => {
          reject(error);
        });
    });
  }