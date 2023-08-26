import { Configuration, CreateImageRequestResponseFormatEnum, OpenAIApi } from "openai";
import AuthError from "../scripts/errors/AuthError.js";
import ContextOverflowError from "../scripts/errors/ContextOverflowError.js";
import RequestOverflowError from "../scripts/errors/RequestOverflow.js";
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
        return this.openai.createChatCompletion({
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
        })
            .then((res) => {
                console.log('res: ', res);
                if (res) {
                    return res;
                }
            })
            .catch((err) => {
                console.debug("error: ", err.response);
                return err.response;
            })
    }

    async getAnswer(text, context) {
        if (text && context) {
            const answer = await this.getAIResponse(text, this.__arrayToString(context));
            
            if (answer.status == 429){
                throw new RequestOverflowError("Exceeded the amount of requests per minute");
            }
            else if(answer.status == 401){
                throw new AuthError("You need a token from the API");
            }
            else if(answer.status == 400){
                throw new ContextOverflowError("Exceeded the token limit. 4097 tokens allowed");
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
