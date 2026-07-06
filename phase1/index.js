//The whole code is written BY Me
// import express from "express";
// import dotenv from "dotenv";
// import { GoogleGenAI } from "@google/genai";
// import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
// import {ChatGroq} from "@langchain/groq"
// import { Annotation, MessagesAnnotation, StateGraph } from "@langchain/langgraph";
// import { ToolNode } from "@langchain/langgraph/prebuilt";
// import { TavilySearch } from "@langchain/tavily";



// dotenv.config();

// const app = express();

// app.use(express.json());

// //without the langchain
// // const ai = new GoogleGenAI({
// //   apiKey: process.env.GEMINI_API_KEY,
// // });
// // app.post("/ai", async (req, res) => {
// //   const { input } = req.body;
// //   const response = await ai.models.generateContent({
// //     model: "gemini-2.5-flash",
// //     contents: [
// //       {
// //         role: "model",
// //         parts: [{ text: "You are an ai assitance and Your name is Ali. If you do not know the answer then do not give the incorrect answer" }],
// //       },
// //       {
// //         role: "user",
// //         parts: [{ text: input }],
// //       },
// //     ],
// //   });
// //   return res.status(200).json({ msg: `${response.text}`});
// // });

// // with the llangchain



// const tool = new TavilySearch({
//     maxResults: 5,
//     topic: "general",
// });




// const tools=[tool];
// const toolNode=new ToolNode(tools)



// const llm=new ChatGroq({
//     model:"openai/gpt-oss-120b",
//     temperature:0.7,
//     maxTokens:100,
//     maxRetries:2
// }).bindTools(tools)

// // const State=Annotation.Root({
// //     prompt:Annotation,
// //     aiMsg:Annotation
// // })



// const callLlM=async(state)=>{
//     console.log("State is",state)
//        const response=await llm.invoke([
//      ['system', `You are Jarvis AI assistant

// Use conversation memory first.

// Only use tools when the answer requires
// external real-time information like:
// weather, news, web search, stock prices etc.

// Do NOT call tools for simple conversation,
// memory-based questions, greetings,
// or personal context`],
//         ...state.messages
//     ])
//     return {messages:[response]}
// }
// const shouldContinue=async (state)=>{
//     const lastMessage=state.messages[state.messages.length-1]
//     if(lastMessage.tool_calls.length > 0){
//         return "tools"
//     }
//     else{
//         return '__end__'
//     }
// }
// const graph=new StateGraph(MessagesAnnotation)
// .addNode('agent',callLlM)
// .addNode('tools',toolNode)
// .addEdge('__start__','agent')
// .addEdge('tools','agent')
// .addConditionalEdges('agent',shouldContinue)
// .compile()

// app.post('/ai',async(req,res)=>{
//     const {input}=req.body
//     const response= await graph.invoke({messages:[
//         {role:'user',
//         content:input
//         }
//     ]})
//     console.log("Response form the graph",response)
//     return res.status(200).json({"ai :" : response})

// })


// app.listen(process.env.PORT, () => {
//   console.log(`Server started at port: ${process.env.PORT}`);
// });
// // the sdk api has many version but the official version of the that is currently availabe is the api.interaction version given below is the interaction version but the we are going to use the ai.models version
// //   const interaction = await ai.interactions.create({
// //     model: "gemini-2.5-flash",
// //     system_instruction: "You are an AI assistant and your name is Ali.",
// //     input: [
// //       {
// //         type: "text",
// //         text: input,
// //       },
// //     ],
// //   });


//Code From Virtual Code
import express from "express"
import dotenv from "dotenv"
import { GoogleGenAI } from "@google/genai"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { ChatGroq } from "@langchain/groq"
import { Annotation, MemorySaver, MessagesAnnotation, StateGraph } from "@langchain/langgraph"
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { TavilySearch } from "@langchain/tavily";
dotenv.config()
const app = express()

app.use(express.json())

//without Langchain

// const ai = new GoogleGenAI({
//     apiKey: process.env.GEMINI_API_KEY
// })

// app.post("/ai", async (req, res) => {
//     const { input } = req.body
//     const response = await ai.models.generateContent({
//         model: "gemini-3.5-flash",
//         contents: [
//             {
//                 role: "system",
//                 parts: [{ text: "you are a assistant and your name is jarvis.if you don't know the answer then don't give incorrect answer" }]
//             },
//             {
//                 role: "user",
//                 parts: [{ text: input }]
//             }
//         ]
//     })

//     return res.status(200).json({ "ai:": response.text })
// })

//with langchain


const tool = new TavilySearch({
    maxResults: 5,
    topic: "general",
});




const tools = [tool]
const toolNode = new ToolNode(tools)

const llm = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    maxTokens: 100,
    maxRetries: 2
}).bindTools(tools)



const callLLM = async (state) => {
    console.log("state:", state)

    const response = await llm.invoke([
        {
            role: "system",
            content: `You are Jarvis AI assistant

Use conversation memory first.

Only use tools when the answer requires
external real-time information like:
weather, news, web search, stock prices etc.

Do NOT call tools for simple conversation,
memory-based questions, greetings,
or personal context`
        },
        ...state.messages
    ])

    return { messages: [response] }
}

const shouldContinue = async (state) => {
    const lastMessage = state.messages[state.messages.length - 1]
    if (lastMessage.tool_calls.length > 0) {
        return "tools"
    } else {
        return "__end__"
    }
}


const graph = new StateGraph(MessagesAnnotation)
    .addNode("agent", callLLM)
    .addNode("tools", toolNode)
    .addEdge("__start__", "agent")
    .addEdge("tools", "agent")
    .addConditionalEdges("agent", shouldContinue)
    .compile()




app.post("/ai", async (req, res) => {
    const { input } = req.body

    const response = await graph.invoke(
        {
            messages: [
                {
                    role: "user",
                    content: input
                }
            ]
        },
        { configurable: { thread_id: "user123" } }

    )
    console.log(response.messages)

    return res.status(200).json({ "ai:": response.messages[response.messages.length - 1].content })
})




app.get("/", (req, res) => {
    return res.json({ message: "hello from level4" })
})


app.listen(process.env.PORT, () => {
    console.log(`Server started at PORT :${process.env.PORT}`)
})