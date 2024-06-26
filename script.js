const message_container = document.getElementById("message-container");
const close_button = document.getElementById("close_button");
const send_button = document.getElementById("send_button");
const input = document.getElementById("user-input");
const welcome = document.getElementById("welcome");
const logo = document.getElementById("logo");
const clear_button = document.getElementById("clear_button");



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
    window.location.reload();
}

clear_button.addEventListener("click", clear);


const removeDuplicate = (originalText, newText) => {
    const index = newText.indexOf(originalText);
    if (index !== -1) {
        return newText.substring(index + originalText.length);
    }
    return newText;
};

const start_chat = () => {
    welcome.style.display = "none"
    logo.style.display = "flex"
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
    running = true;
    let tokens = 0;
    let startTime = new Date();
    const prompt = input.value;
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

    // Create the template element
    const template = document.createElement('template');
    template.setAttribute('data-append', '');

    // Create the style element
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
    const stream = model.promptStreaming(`Please respond as concise as possible to the conversation below. ${messages.map((message) => `${message.role}: ${message.content}`).join("\n")}\n user: ${userInput.trim()}\n assistant:`);
    const generate = async () => {
        for await (const response of stream) {
            script.textContent = response;
            tokens += 1;
            total = response;
            scrollToBottom()
        }
    }
    await generate();
    messages.push({ "role": "user", "content": prompt });
    messages.push({ "role": "assistant", "content": total });
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
    p.textContent = message;
    messageDiv.classList.add("message");
    messageContainer.appendChild(messageDiv);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}