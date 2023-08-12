import getCurrentTime from "./getTime.js";

export default function makeInitialRequest() {
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

    localStorage.setItem("contextArray", JSON.stringify(contextArray))

    Chat.getAnswer(botGreet.message, botSettings.message)
        .then((res) => {
            if (!res) throw new Error('Не смог поприветствовать, что-то не так');
            postMessage(createMessage(res));
            const { hour, min } = getCurrentTime();
            contextArray.push({
                message: res,
                time: `${hour}:${min}`
            })
            localStorage.setItem("contextArray", JSON.stringify(contextArray));
        })
        .catch(err => console.log(err))
}

// makeInitialRequest()