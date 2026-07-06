import express from 'express';
import dotenv from 'dotenv';
// Ensure you have installed: npm install @google/genai
import { GoogleGenAI } from '@google/genai'; 

dotenv.config();

const app = express();
app.use(express.urlencoded({
    extended:false
}))
app.use(express.json())
const ai = new GoogleGenAI({
    apiKey:process.env.GEMINI_API_KEY
});



app.post('/ai',async(req,res)=>{
    const {input}=req.body
   
   const response=await ai.interactions.create({
     model: "gemini-3.5-flash",
    input: input,
   })
   return res.status(200).json({msg:`${response.output_text}`})

})

app.use(express.json());
app.listen(process.env.PORT, () => {
    console.log(`Server started at port: ${process.env.PORT}`);
});