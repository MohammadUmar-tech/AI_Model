import express from "express";
import dotenv from "dotenv";

import { GoogleGenAI } from "@google/genai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import {ChatGroq} from "@langchain/groq"
import { Annotation, StateGraph } from "@langchain/langgraph";
dotenv.config();

const app = express();
app.use(
  express.urlencoded({
    extended: false,
  }),
);
app.use(express.json());

//without the langchain

// const ai = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY,
// });
// app.post("/ai", async (req, res) => {
//   const { input } = req.body;
//   const response = await ai.models.generateContent({
//     model: "gemini-2.5-flash",
//     contents: [
//       {
//         role: "model",
//         parts: [{ text: "You are an ai assitance and Your name is Ali. If you do not know the answer then do not give the incorrect answer" }],
//       },
//       {
//         role: "user",
//         parts: [{ text: input }],
//       },
//     ],
//   });
//   return res.status(200).json({ msg: `${response.text}`});
// });

// with the llangchain


const llm=new ChatGroq({
    model:"openai/gpt-oss-120b",
    temperature:0.7,
    maxTokens:100,
    maxRetries:2
})



const State=Annotation.Root({
    prompt:Annotation,
    aiMsg:Annotation
})

const callLlM=async(state)=>{
    console.log("State is",state)
       const response=await llm.invoke([
        [
            'system',
            "You are an ai ai assistance and Your name is Sara.If you don't know the answer please do not give the answer"
        ],
        [
            "human", state.prompt
        ]
    ])

    return {aiMsg:response.content}

}

const graph=new StateGraph(State)
.addNode('agent',callLlM)
.addEdge('__start__','agent')
.addEdge('agent','__end__')
.compile()



app.use('/ai',async(req,res)=>{
    const {input}=req.body
    const response= await graph.invoke({prompt:input})
    console.log("Response form the graph",response)
    return res.status(200).json({"ai :" : response})

})

app.use(express.json());
app.listen(process.env.PORT, () => {
  console.log(`Server started at port: ${process.env.PORT}`);
});
// the sdk api has many version but the official version of the that is currently availabe is the api.interaction version given below is the interaction version but the we are going to use the ai.models version
//   const interaction = await ai.interactions.create({
//     model: "gemini-2.5-flash",
//     system_instruction: "You are an AI assistant and your name is Ali.",
//     input: [
//       {
//         type: "text",
//         text: input,
//       },
//     ],
//   });
