import os
from dotenv import load_dotenv
import google.generativeai as genai
import random
load_dotenv()

llm_instance = None
class LLM_interviewer():
    def __init__(self,Role = "Machine Learning",Topics = ["Linear Regression","Neural Network"]):
        self.role = Role
        self.topics = Topics
        self.NTQuestions = 2 #No of Questions on Each Topics
        self.NTopics = len(Topics)
        self.CommunicationQns = 2 #No of Questions on Communcations(Relevant to user answers and previous Questions)
        self.NQuestions = self.NTQuestions * self.NTopics + self.CommunicationQns + 1
        self.LLMQuestions = []
        self.difficulty = ["Easy","Medium","Hard"]
        self.UserResponses = []
        
    
    def llm_initialize(self):
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        
        if not gemini_api_key:
            print("Error: GEMINI_API_KEY not found in environment variables!")
            return
        try:
            genai.configure(api_key=gemini_api_key)
            print("Gemini API configured successfully!")
        except Exception as e:
            print(f"Error while configuring Gemini API: {e}")
  
    def prompt_format(self):
        self.welcome_prompt = '''you are an AI assistant designed to ask Questions about an aspirant for the {role}.
        Ask questions about their introduction and the recent project that they worked and also ask questions about their profile
        Example output 1 :
        response - Great to have you here! Can you share your journey into data science and a project where you applied machine learning to solve a problem?
        Example Output 2 :
        response - Excited to meet you! Can you tell us about your experience with AI/ML and share a model you have developed or improved?
        ask only one question which should ask the background 
        return the response in lowercase format 
        output format : 
        response -
        
        '''
        self.intro_prompt = '''you are an AI assistant designed to ask Questions about an aspirant for the {role}.
        previous question : {previous_question}
        user response : {user_response}       
        if the user's is present ask questions relevant to the user' answers and Provide feedback to the user's previous answers and 
        if the user answer is off the topic kindly say feedback in a kind tone like "You are getting off the topic Let's Get into next Question"
        output format : 
        response - "That's great! Can you tell me more about the specific tools or algorithms you used in that project? How did you optimize the model?
        Example:
        response - "That sounds like a solid system! How did you optimize database queries and API performance?"
        
        Note : Don't ask the Examples to the user . Use it as only reference
        Ask Relevant Questions with relevant to the previous user answer and question
        if the user answer is off the topic kindly say feedback in a kind tone like "You are getting off the topic Let's Get into next Question"
        if the user answer is irrelevant 
        Example Response :
        response - "I appreciate that, but can you focus a bit more on your experience in machine learning and your recent projects?"
        return the response in lowercase format
        Ask Only One Question at a time
        ''' 

        self.interview_qn_format = '''You are an AI assistant designed to perform question generation for a mock interview of a {role}.
        Kindly generate questions on {question_topics} with the difficulty level {difficulty}
        Only return the next question when prompted. Generate the  question now.
        Consider the response and the memory of the previous question if it is present.
        previous_question = {previous_question}
        answer_to_previous_question = {user_response}
        Example Output 1 :
        response - "That is a solid use of machine learning! Your feature engineering strategy seems well thought out.How did you determine which features were most impactful, and did you try any alternative approaches?"
        Example output 2 :   
        response - "Great explanation of how you hadd apply linear regression! Your focus on feature selection is key.In your opinion, how do you determine which variables are most influential in the model? Have you encountered any multicollinearity in your projects, and how did you address it?"
        If the answer_to_previous_question is not present  or irrelevant to the question provide feedback in a nice tone.
        if its irrelevant to the topic kindly say feedback in a tone like "You are getting off the topic Let's Get into next Question"
        Example output 1 : 
        response -"It seems like there might have been a bit of confusion about the application of linear regression in this context. Let refocus on how you would use linear regression specifically for predicting housing prices.Can you share how you had approach selecting features and what variables you would consider for the model?"    
        Example Output 2 :
        response - "It looks like there may have been a misunderstanding of the question. In linear regression, we typically interpret the coefficients as the impact each predictor has on the target variable.Could you give an example of how you'd interpret a coefficient in the context of a real-world dataset?"
        Note : 
        Ask Relevant Question to the topic
        return the response in lowercase format
        '''   

        self.conclusion_prompt = '''
        You are an AI assistant designed to perform question generation for a mock interview of a {role}.
        you have completed the interview with the interviewer for that role and on the following topics : {topics}
        previous_question = {previous_question}
        answer_to_previous_question = {user_response}
        Provide a feedback(response) to the previous question as a message to the user about their performance 
        and their participation in the interview
        Example Output :
        response - Strong technical grasp of ML and hypothesis testing, with solid problem-solving skills; work on refining communication and advancing statistical knowledge
        return the response in lowercase 
        '''

        self.evaluation_prompt = '''
        You are an AI Evaluator.you have to evaluate the response of an user to the questions
        Provide the improvised response from the perspective of an interviewee and provide it in a simple tone.
        role : {role}
        topics : {topics}
        questions : {llm_questions}
        answers : {user_responses}
        Ouput Format :
        answers :
            -question 
            -response
            -accuracy
            -improvised_response

        Example Response :
        -question : How do you improve text classification accuracy in a sentiment analysis model?
        -response :  I would preprocess the text by removing stopwords, stemming, and using TF-IDF for feature extraction, then train a logistic regression model.
        -accuracy : 85%
        -improvised_response :To improve accuracy, I would clean the text by removing stopwords, use TF-IDF for feature extraction, and try more advanced models like BERT. I’d also fine-tune the model and check its performance using metrics like accuracy and F1-score.
        '''

    def llm_config(self):
        self.model = genai.GenerativeModel(
                model_name='gemini-1.5-flash',
                generation_config={"response_mime_type":"application/json"}
                              )
 
    def llm_welcome_prompt_format(self):
        prompt = self.welcome_prompt.format(
            role = self.role
        )
        return prompt
       
    def llm_intro_prompt_format(self,previous_question=None,user_response=None):
        prompt = self.intro_prompt.format(
            role = self.role,
            previous_question =previous_question,
            user_response = user_response
            )
        
        return prompt
    
    
    def llm_qn_prompt_format(self, previous_question=None, user_response=None, question_topics=None, difficulty=None):
        prompt = self.interview_qn_format.format(
            role=self.role,
            previous_question=previous_question,
            user_response=user_response,
            question_topics=question_topics,
            difficulty=difficulty
        )
        return prompt
    def llm_conclusion_prompt_format(self,previous_question,user_response):
        prompt = self.conclusion_prompt.format(
            role = self.role,
            topics = self.topics,
            previous_question = previous_question,
            user_response = user_response     
        )
        return prompt
    
    def evaluator_prompt_format(self):
        prompt = self.evaluation_prompt.format(
            role = self.role,
            topics = self.topics,
            llm_questions = self.LLMQuestions,
            user_responses = self.UserResponses
        )
        return prompt

    
    def llm_qn_generate(self,prompt):
        response = self.model.generate_content(prompt)
        return response.text
    
    def responses(self):
        if len(self.LLMQuestions)==0:
            previous_question = None
            answer_to_previous_question = None
            return previous_question , answer_to_previous_question
        else:
            previous_question = self.LLMQuestions[-1]
            answer_to_previous_question = self.UserResponses[-1]
            return previous_question , answer_to_previous_question
        
    def level(self):
        ind = random.randint(0,2)
        difficulty = self.difficulty[ind]
        return difficulty
    
    def interview_topic(self,iter):
        ind = (iter-self.CommunicationQns-1)//self.NTQuestions
        print(iter,self.CommunicationQns , self.NTQuestions , ind ,len(self.topics))
        return self.topics[ind]
      

    

        

        
        