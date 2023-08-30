import ChatAPI from "../utils/ChatAPI.js";
import getCurrentTime from "./getTime.js";
// import { setErrorModal } from "./modalWindow.js";


const Chat = new ChatAPI();
const button = document.querySelector(".input__form-button");
const input = document.querySelector(".input__form-input");
const form = document.querySelector(".input__form");
const messages = document.querySelector(".answers__list");
const clear = document.querySelector(".clear__button");
let contextArray;

contextArray = JSON.parse(localStorage.getItem("contextArray"));
if (contextArray) {
    getMessage();
}
else {
    contextArray = [];
    makeInitialRequest();
}


function postMessage(msg, isUser = false) {
    if (isUser) {
        msg.classList.add("answer__list-item-user");
    }
    messages.append(msg);
}

function createMessage(msg) {
    const template = document.querySelector(".template").cloneNode(true).content.querySelector(".answer__list-item");
    template.querySelector('.answer__text').innerText = msg;
    const { hour, min } = getCurrentTime();
    template.querySelector(".answer__time").textContent = `${hour}:${min}`;
    template.classList.add("answer__list-item");

    updateArray(msg, hour, min)

    return template;
}

function makeInitialRequest() {
    console.log("Запуск initial request");
    const { hour, min } = getCurrentTime();

    const botGreet = {
        message: "Hello",
        time: `${hour}:${min}`
    }

    const botSettings = {
        message: "You are Ronaldo, answer like Ronaldo the football player",
        time: `${hour}:${min}`
    }

    contextArray.push(botGreet)
    contextArray.push(botSettings)

    Chat.getAnswer(botGreet.message, botSettings.message)
        .then((res) => {
            if (!res) throw new Error('Не смог поприветствовать, что-то не так');
            postMessage(createMessage(res));
            const { hour, min } = getCurrentTime();
            
            updateArray(msg, hour, min)
            
        })
        .catch(err => console.log(err))
}

function getMessage() {
    if (localStorage.getItem("contextArray").length > 0)
        contextArray = JSON.parse(localStorage.getItem("contextArray"));
    contextArray.map((item, index) => {
        if (index === 0) { return };
        if (index % 2 === 0) {
            postMessage(createMessage(item.message), false);
        }
        else {
            postMessage(createMessage(item.message), true);
        }

    })
}

function updateArray(msg, hour, min) {
    if (!contextArray.find((item) => {
        console.log(item);
        return item.message === msg;
    })) {
        contextArray.push({
            message: msg,
            time: `${hour}:${min}`,
        });
        localStorage.setItem("contextArray", JSON.stringify(contextArray));
    
    }
}


form.addEventListener("submit", (event) => {
    event.preventDefault()
    const text = input.value;

    postMessage(createMessage(text), true)

    Chat.getAnswer(text, contextArray)
        .then((res) => {
            if (!res) {
                throw new Error(`Что-то не так с ответом от сервера, ${res}`);
            }
            input.value = ""

            console.log('Chatbot res from getAnswer function: ', res);
            postMessage(createMessage(res))
        })
        .catch(err => {
            console.log(err);
            alert('Your message is too long. There is a limit of symbols - max 4000.');
            if (contextArray.length > 2) {
                contextArray.splice(0, 3);
                localStorage.setItem("contextArray", JSON.stringify(contextArray));
            }
            else {
                contextArray.splice(0, 1);
                localStorage.setItem("contextArray", JSON.stringify(contextArray));

            }
        });
})


clear.addEventListener("click", (event) => {
    contextArray = [];
    localStorage.clear()
    messages.innerHTML = "";
    makeInitialRequest()
})

input.addEventListener("focus", (event) => {
    form.classList.add("input__form-white")
})
input.addEventListener("blur", (event) => {
    form.classList.remove("input__form-white")
})
input.addEventListener('input', (event) => {
    if (event.target.value.length === 0) {
        button.classList.remove("input__form-button-color");
    } else {
        button.classList.add("input__form-button-color");
    }
})

// setErrorModal(429, "Too many requests")