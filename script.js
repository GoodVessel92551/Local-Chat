


const message_container = document.getElementById("message-container");
const close_button = document.getElementById("close_button");
const send_button = document.getElementById("send_button");
const input = document.getElementById("user-input");
const welcome = document.getElementById("welcome");
const logo = document.getElementById("logo");
const clear_button = document.getElementById("clear_button");

let message_id = 0;
let called = false;
let messages = [];
let model = null;
const ai_guide = document.getElementById('ai_guide');
console.log(ai_guide)


window.addEventListener("load", async () => {
    const hasAI = window.ai != null;
    
    const hasNano =
        (hasAI && (await window.ai.canCreateTextSession())) === "readily";
    
    if (!hasNano) {
        ai_guide.showModal();
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
    if (input.value == "") {
        send_button.disabled = true
    } else {
        send_button.disabled = false
    }

})
input.addEventListener("keyup", (event) => {
    if (event.keyCode === 13) {
        event.preventDefault();
        sendMessage(document.getElementById('user-input').value)
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
    let tokens = 0;
    let startTime = new Date();
    const prompt = input.value;
    console.log(`You are local chat. Please respond following the conversation below without cutting off early. ${messages.map((message) => `${message.role}: ${message.content}`).join("\n")}\n user: ${userInput.trim()}\n assistant:`)
    const stream = model.promptStreaming(`You are local chat. Please respond following the conversation below without cutting off early. ${messages.map((message) => `${message.role}: ${message.content}`).join("\n")}\n user: ${userInput.trim()}\n assistant:`);
    messages.push({ "role": "user", "content": prompt });
    let total = ""
    let title = document.createElement("div");
    let icon = document.createElement("span");
    let name_type = document.createElement("type");
    let p = document.createElement("p");
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
        background-color: none !important;
        border: 1px solid none !important;
        margin-left: 40px !important;
        font-family: "Manrope", sans-serif !important;
    }

    .markdown-body > pre {
        background-color: #252729;
        border-radius: 16px;
    }
    `;

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
    messageDiv.appendChild(p);
    messageDiv.appendChild(zeroMd)
    messageContainer.appendChild(messageDiv);
    icon.classList.add("modal")
    icon.innerHTML = '<svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8.664 15.735c.245.173.537.265.836.264v-.004a1.442 1.442 0 0 0 1.327-.872l.613-1.864a2.872 2.872 0 0 1 1.817-1.812l1.778-.578a1.443 1.443 0 0 0-.052-2.74l-1.755-.57a2.876 2.876 0 0 1-1.822-1.823l-.578-1.777a1.446 1.446 0 0 0-2.732.022l-.583 1.792a2.877 2.877 0 0 1-1.77 1.786l-1.777.571a1.444 1.444 0 0 0 .017 2.734l1.754.569a2.887 2.887 0 0 1 1.822 1.826l.578 1.775c.099.283.283.528.527.7Zm7.667 5.047a1.123 1.123 0 0 1-.41-.549l-.328-1.007a1.293 1.293 0 0 0-.821-.823l-.991-.323A1.148 1.148 0 0 1 13 16.997a1.143 1.143 0 0 1 .771-1.08l1.006-.326a1.3 1.3 0 0 0 .8-.819l.324-.992a1.143 1.143 0 0 1 2.157-.021l.329 1.014a1.3 1.3 0 0 0 .82.816l.992.323a1.141 1.141 0 0 1 .039 2.165l-1.014.329a1.3 1.3 0 0 0-.818.822l-.322.989c-.078.23-.226.43-.425.57a1.14 1.14 0 0 1-1.328-.005Z" fill="#ffffff"/></svg>';
    name_type.innerHTML = "Local Chat";

    for await (const response of stream) {
        script.textContent = response;
        tokens += 1;
        total = response;
        scrollToBottom()
    }
    messages.push({ "role": "assistant", "content": total });
    let endTime = new Date();
    let timeTaken = endTime - startTime;
    let tokens_sec = tokens / (timeTaken / 1000);
    speed.style.display = "block";
    speed.textContent = `${timeTaken} ms`;
    console.log(`Tokens: ${tokens}`);
    document.getElementById("speed").innerText = tokens_sec.toFixed(2) + " tok/s"
    if (timeTaken != undefined) {
        document.getElementById("time_speed").innerText = (timeTaken / 1000) + " sec"
        document.getElementById("time_speed").style.display = "block"
    }
}

const getDomainFromUrl = (url) => {
    return null
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