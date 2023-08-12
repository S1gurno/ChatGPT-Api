import { Configuration, CreateImageRequestResponseFormatEnum, OpenAIApi } from "openai";
import { key } from "../utils/config.js";


class ChatAPI {
    constructor() {
        this.model = "gpt-3.5-turbo";
        this.configuration = new Configuration({
            apiKey: key,
        });
        this.openai = new OpenAIApi(this.configuration);
    }

    async getAIResponse(text, context) {
        const res = await this.openai.createChatCompletion({
            model: this.model,
            messages: [
                {
                    role: "system",
                    content: context,
                },
                {
                    role: "user",
                    content: text,
                }
            ],
        });
        if (!res) {
            console.log('Что-то не так с запросом к серверу:', err?.error, err?.message);
            return;
        }

        // console.log('res: ', res);
        return res;
    }

    async getAnswer(text, context) {
        if (text && context) {
            const answer = await this.getAIResponse(text, this.__arrayToString(context));

            if (!answer) {
                console.log('Что-то пошло не так.', answer);
                return;
            }
            return answer.data.choices[0].message.content;
        }
    }

    __arrayToString(array) {
        if (Array.isArray(array)) {
            return array.join(" ");
        } else {
            return array;
        }
    }
}

// ChatApi = new ChatAPI()

export default ChatAPI;
