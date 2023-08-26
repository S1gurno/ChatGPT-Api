import ChatAPI from "../utils/ChatAPI.js";
import ContextOverflowError from "./errors/ContextOverflowError.js";
import getCurrentTime from "./getTime.js";

const Chat = new ChatAPI();
const input = document.querySelector(".input__form-input");
const form = document.querySelector(".input__form");
const messages = document.querySelector(".answers__list");
const button = document.querySelector("#sendButton");
const clear = document.querySelector("#clearButton");

let contextArray;

contextArray = JSON.parse(localStorage.getItem("contextArray"));
if (contextArray && contextArray.length > 0) {
    setTimeout(getMessage, 1000);
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
    messages.lastChild.scrollIntoView();
}

function createMessage(msg) {
    const template = document.querySelector(".template").cloneNode(true).content.querySelector(".answer__list-item");
    template.querySelector('.answer__text').innerText = msg;
    const { hour, min } = getCurrentTime();
    template.querySelector(".answer__time").textContent = `${hour}:${min}`;
    template.classList.add("answer__list-item");

    contextArray.push({
        message: msg,
        time: `${hour}:${min}`,
    });

    return template;
}

function makeInitialRequest() {
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
            contextArray.push({
                message: res,
                time: `${hour}:${min}`
            })
        })
        .catch(err => console.log(err))
}

function getMessage() {
    if (localStorage.getItem("contextArray").length > 0)
        contextArray = JSON.parse(localStorage.getItem("contextArray"));
    contextArray.map((item, index) => {
        if (index === 0 || index === 1) { return };
        if (index % 2 !== 0) {
            postMessage(createMessage(item.message), false);
        }
        else {
            postMessage(createMessage(item.message), true);
        }
    })
}


form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value;
    if (!text) { return };

    postMessage(createMessage(text), true)
    localStorage.setItem("contextArray", JSON.stringify(contextArray));


    Chat.getAnswer(text, contextArray)
        .then((res) => {
            console.log('res: ', res);
            if (!res) {
                throw new Error(`Что-то не так с ответом от сервера, ${res}`);
            }
            input.value = ""
            postMessage(createMessage(res))
            localStorage.setItem("contextArray", JSON.stringify(contextArray));

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


clear.addEventListener("click", (event) => {
    event.preventDefault();
    // console.log('Очистка: ', event);
    contextArray = [];
    localStorage.clear();
    messages.innerHTML = "";
    makeInitialRequest()
});


input.addEventListener('input', (event) => {
    if (event.target.value.length === 0) {
        button.classList.remove("input__form-button-color");
    } else {
        button.classList.add("input__form-button-color");
    }
})