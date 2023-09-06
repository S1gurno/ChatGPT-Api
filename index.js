import ChatAPI from "../utils/ChatAPI.js";
import ContextOverflowError from "./errors/ContextOverflowError.js";
import getCurrentTime from "./getTime.js";

const Chat = new ChatAPI();
const messages = document.querySelector(".answers__list");
const form = document.querySelector(".input__form");
const input = form.querySelector(".input__form-input");
const button = form.querySelector("#sendButton");

let contextArray;

contextArray = JSON.parse(localStorage.getItem("contextArray"));
if (contextArray && contextArray.length > 0) {
    setTimeout(getMessage, 1000);
}
else {
    contextArray = [];
    makeInitialRequest();
}


function postMessage(msg) {
    messages.append(msg);
    messages.lastChild.scrollIntoView();
}

function createMessage(msg, isUser) {
    const template = document.querySelector(".template").cloneNode(true).content.querySelector(".answer__list-item");
    template.querySelector('.answer__text').innerText = msg;
    const { hour, min } = getCurrentTime();
    template.querySelector(".answer__time").textContent = `${hour}:${min}`;
    template.classList.add("answer__list-item");
    if (isUser) {
        template.classList.add("answer__list-item-user");
    }
    
    updateContext(msg, hour, min, isUser);

    return template;
}

function makeInitialRequest() {
    const { hour, min } = getCurrentTime();

    const botGreet = {
        message: "Hello",
        time: `${hour}:${min}`,
        isUser: false,
    }

    const botSettings = {
        message: "You are Ronaldo, answer like Ronaldo the football player",
        time: `${hour}:${min}`,
        isUser: false,
    }

    updateContext(botGreet.message, hour, min, botGreet.isUser)
    updateContext(botSettings.message, hour, min, botSettings.isUser)


    Chat.getAnswer(botGreet.message, botSettings.message)
        .then((res) => {
            if (!res) throw new Error('Не смог поприветствовать, что-то не так');
            postMessage(createMessage(res, isUser=false));
        })
        .catch(err => console.log(err))
}

function getMessage() {
    if (localStorage.getItem("contextArray").length > 0) {
        contextArray = JSON.parse(localStorage.getItem("contextArray"));
    }
    contextArray.map((item, index) => {
        if (index < 2) { return }; // Игноируем настроечные (первые 2) сообщения боту
        postMessage(createMessage(item.message, item.isUser));
    })
}

function updateContext(message, hour, min, isUser){
    if (contextArray.find((item) => item.message === message)){
        return
    }
    else{
        contextArray.push({
            message: msg,
            time: `${hour}:${min}`,
            isUser: isUser
        });
        localStorage.setItem("contextArray", JSON.stringify(contextArray));
    }
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value;
    if (!text) { return };

    const { hour, min } = getTime();
    const msg = {
        message: text,
        time: `${hour}:${min}`,
        isUser: true,
    }

    postMessage(createMessage(msg.message, msg.isUser))


    Chat.getAnswer(text, contextArray)
        .then((res) => {
            if (!res) {
                throw new Error(`Что-то не так с ответом от сервера, ${res}`);
            }
            input.value = ""
            postMessage(createMessage(res, false))

        })
        .catch(err => {
            if (err.status === 400) {
                alert('Your message is too long. There is a limit of symbols - max 4000.');
                if (contextArray.length > 2) {
                    contextArray.splice(0, 3);
                    localStorage.setItem("contextArray", JSON.stringify(contextArray));
                } 
                else {
                    contextArray.splice(0, 1);
                    localStorage.setItem("contextArray", JSON.stringify(contextArray));
                }
            }
            else if (err.status === 429){
                alert(err.message);
            }
            else if (err.status === 401){
                alert(err.message);
            }
        });
});

// const clear = form.querySelector("#clearButton");
form.addEventListener("reset", (event) => {
    console.log('Очистка: ', event);
    // event.preventDefault();
    // ДЗ: Починить кнопку очистки контекста
    console.log('Очистка: ', event);
    contextArray = [];
    localStorage.clear();
    messages.innerHTML = "";
    makeInitialRequest();
});


input.addEventListener('input', (event) => {
    if (event.target.value.length === 0) {
        button.classList.remove("input__form-button-color");
    } else {
        button.classList.add("input__form-button-color");
    }
})