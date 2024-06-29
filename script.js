const message_container = document.getElementById("message-container");
const close_button = document.getElementById("close_button");
const send_button = document.getElementById("send_button");
const input = document.getElementById("user-input");
const welcome = document.getElementById("welcome");
const clear_button = document.getElementById("clear");
const past_chats = document.getElementById("past_chats")
const clear_chats = document.getElementById("clear_chats")

var current_chat_id, chat_id, chats,current_chat;
var PDF_content = ""
var fileName = ""
let running = false;
let message_id = 0;
let called = false;
let messages = [];
let model = null;
const ai_guide = document.getElementById('ai_guide');

const url_find = (text) => {
    return text.match(urlPattern);
}

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

const scrollToBottom = () => {
    message_container.scrollTop = message_container.scrollHeight;
}
const clear = () => {
    new_chat()
    reset_chat_window()
    update_history()
}

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

const ai_call = async (userInput, messages) => {
    document.getElementById('file_holding').style.display = "none"
    running = true;
    let tokens = 0;
    let startTime = new Date();
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
    position.classList.add("genning");
    position.innerHTML = `<svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8.664 15.735c.245.173.537.265.836.264v-.004a1.442 1.442 0 0 0 1.327-.872l.613-1.864a2.872 2.872 0 0 1 1.817-1.812l1.778-.578a1.443 1.443 0 0 0-.052-2.74l-1.755-.57a2.876 2.876 0 0 1-1.822-1.823l-.578-1.777a1.446 1.446 0 0 0-2.732.022l-.583 1.792a2.877 2.877 0 0 1-1.77 1.786l-1.777.571a1.444 1.444 0 0 0 .017 2.734l1.754.569a2.887 2.887 0 0 1 1.822 1.826l.578 1.775c.099.283.283.528.527.7Zm-.374-4.25a4.054 4.054 0 0 0-.363-.413h.003a4.394 4.394 0 0 0-1.72-1.063l-1.6-.508 1.611-.524a4.4 4.4 0 0 0 1.69-1.065 4.448 4.448 0 0 0 1.041-1.708l.515-1.582.516 1.587a4.374 4.374 0 0 0 2.781 2.773l1.62.522-1.59.515a4.379 4.379 0 0 0-2.774 2.775l-.515 1.582-.515-1.585a4.368 4.368 0 0 0-.7-1.306Zm8.041 9.297a1.123 1.123 0 0 1-.41-.549l-.328-1.007a1.293 1.293 0 0 0-.821-.823l-.991-.323A1.148 1.148 0 0 1 13 16.997a1.143 1.143 0 0 1 .771-1.08l1.006-.326a1.3 1.3 0 0 0 .8-.819l.324-.992a1.143 1.143 0 0 1 2.157-.021l.329 1.014a1.3 1.3 0 0 0 .82.816l.992.323a1.141 1.141 0 0 1 .039 2.165l-1.014.329a1.3 1.3 0 0 0-.818.822l-.322.989c-.078.23-.226.43-.425.57a1.14 1.14 0 0 1-1.328-.005Zm-1.03-3.783A2.789 2.789 0 0 1 17 18.708a2.794 2.794 0 0 1 1.7-1.7 2.813 2.813 0 0 1-1.718-1.708A2.806 2.806 0 0 1 15.3 17Z" fill="#ffffff"/></svg>Generating`
    var stream
    if (PDF_content == "") {
        stream = model.promptStreaming(`Please respond as concise as possible to the conversation below. ${messages.map((message) => `${message.role}: ${message.content}`).join("\n")}\n user: ${userInput.trim()}\n assistant:`);
    }else{
        stream = model.promptStreaming(`Please respond as concise as possible to the conversation below with the help of this pdf:${PDF_content.substring(0, 3000)}. ${messages.map((message) => `${message.role}: ${message.content}`).join("\n")}\n user: ${userInput.trim()}\n assistant:`);
    }
    const generate = async () => {
        for await (const response of stream) {
            script.textContent = response;
            tokens += 1;
            total = response;
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
    messages.push({ "role": "user", "content": userInput });
    messages.push({ "role": "assistant", "content": total });
    var history = JSON.parse(localStorage.getItem("history"))
    history["chats"][history.current_chat_id] = messages
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

const appendMessage_ai = (message) => {
    let title = document.createElement("div");
    let icon = document.createElement("span");
    let name_type = document.createElement("type");
    let p = document.createElement("p");
    var position = document.createElement("span");
    var link = document.createElement("link");
    var link2 = document.createElement("link");
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
}

const load_messages = () => {
    if (localStorage.getItem("history") != null) {
        var history = JSON.parse(localStorage.getItem("history"));
        current_chat_id = history.current_chat_id;
        chat_id = history.chat_id;
        chats = history.chats;
        current_chat = chats[current_chat_id];
        if ((current_chat != undefined) && (Object.keys(current_chat).length != 0)){
            messages = current_chat;
            welcome.style.display = "none"
            current_chat.forEach(element => {
                if (element.role == "user") {
                    appendMessage(element.content, "user");
                } else {
                    appendMessage_ai(element.content);
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
            history_title.innerText = chats[element][0].content.substring(0, 40);
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
    welcome.style.display = "block"
    load_messages()
}

clear_chats.addEventListener("click", () => {
    var history = {
        "current_chat_id":0,
        "chat_id":0,
        "chats":{}
    }
    localStorage.setItem("history", JSON.stringify(history))
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