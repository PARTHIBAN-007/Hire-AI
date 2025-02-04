from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import io
import json
from pydub import AudioSegment
import speech_recognition as sr
from pydantic import BaseModel
from typing import List

app = FastAPI()
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/audio_to_text")
async def audio_to_text(audio: UploadFile = File(...)):
    print("audio")
    try:
        audio_data = await audio.read()

        audio = AudioSegment.from_file(io.BytesIO(audio_data))
        audio = audio.set_channels(1).set_frame_rate(16000)  
        audio_wav = io.BytesIO()
        audio.export(audio_wav, format="wav")
        audio_wav.seek(0)

        recognizer = sr.Recognizer()
        with sr.AudioFile(audio_wav) as source:
            audio_recording = recognizer.record(source)

        text = recognizer.recognize_google(audio_recording)
        return {"text": text}

    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})
    
from llm import LLM_interviewer 
llm_instance = None
class UserPreferences(BaseModel):
    role: str
    topics: List[str]

@app.post("/config_question")
async def config_question(user_preferences: UserPreferences):
    role = user_preferences.role
    topics = user_preferences.topics
    global llm_instance
    llm_instance = LLM_interviewer(role,topics)
    llm_instance.llm_initialize()
    llm_instance.prompt_format()
    llm_instance.llm_config()
    return {"role":llm_instance.role, "topics": llm_instance.topics,"numQuestions":llm_instance.NQuestions}

class UserResponse(BaseModel):
    response : str
    iter : int

@app.post("/llm_question")
async def llm_question(user_response : UserResponse):
    print(user_response.iter)
    if user_response.iter==0:
        print("Welcome")
        prompt = llm_instance.llm_welcome_prompt_format()
        print(prompt)
        response = llm_instance.llm_qn_generate(prompt)
        llm_instance.LLMQuestions.append(response)
        return JSONResponse(content=json.loads(response))
    elif user_response.iter>0 and user_response.iter<=llm_instance.CommunicationQns:
        print("Communication")
        llm_instance.UserResponses.append(user_response.response)
        previous_question , answer_to_previous_answer = llm_instance.responses()
        print(previous_question , answer_to_previous_answer)
        prompt = llm_instance.llm_intro_prompt_format(previous_question,answer_to_previous_answer)
        print(prompt)
        response = llm_instance.llm_qn_generate(prompt)
        llm_instance.LLMQuestions.append(response)
        return JSONResponse(content=json.loads(response))
    elif user_response.iter>llm_instance.CommunicationQns and user_response.iter<llm_instance.NQuestions : 
        print("Questions")
        llm_instance.UserResponses.append(user_response.response)
        previous_question , answer_to_previous_answer = llm_instance.responses()
        difficulty = llm_instance.level()
        topic = llm_instance.interview_topic(user_response.iter)
        prompt = llm_instance.llm_qn_prompt_format(previous_question,answer_to_previous_answer,topic,difficulty)
        print(prompt)
        response = llm_instance.llm_qn_generate(prompt)
        llm_instance.LLMQuestions.append(response)
        return JSONResponse(content=json.loads(response))
    else:
        llm_instance.UserResponses.append(user_response.response)
        previous_question , answer_to_previous_answer = llm_instance.responses()
        print(previous_question , answer_to_previous_answer)
        prompt = llm_instance.llm_conclusion_prompt_format(previous_question,answer_to_previous_answer)
        response = llm_instance.llm_qn_generate(prompt)
        print(response)
        return JSONResponse(content=json.loads(response))

class Evaluator(BaseModel):
    iter : int


@app.post("/evaluate_responses")
async def evaluate_responses(evaluator : Evaluator):
    print(evaluator.iter)
    prompt = llm_instance.evaluator_prompt_format()
    print(prompt)
    response = llm_instance.llm_qn_generate(prompt)
    print(response)
    return JSONResponse(content=json.loads(response))


        



        




