# HireAI - AI Mock Interviewer

HireAI is a web-based mock interview application designed to help individuals prepare for technical interviews in various domains of machine learning and data science. The application provides an interactive interface where users can select topics, engage in AI-powered conversations, and receive personalized evaluations based on their responses.

## Features

- **Topic Selection**: Select multiple topics from a list of predefined categories (e.g., Linear Regression, Deep Learning, NLP).
- **AI Mock Interview**: Engage in a mock interview session where the AI generates interview questions based on the selected topics.
- **Speech-to-Text**: Record audio responses, which are transcribed into text for further interaction with the AI.
- **Evaluation**: Receive an evaluation report based on the answers provided during the interview, including accuracy and improvements.

## Technologies Used

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Python (FastAPI)
- **LLM** : Gemini-1.5-flash


## Prerequisites

Before running the project, make sure you have the following installed on your system:

- **Node.js**: [Download Node.js](https://nodejs.org/)
- **React**: This project uses React, which requires Node.js to run.
- **Python**: For the backend API server (if running locally).

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/PARTHIBAN-007/Hire-AI
cd Hire-AI
```

2. Install Frontend Dependencies
Navigate to the frontend directory and install the required dependencies:
```bash
cd frontend
npm install
```
3. Run the React Development Server
After the installation is complete, start the React development server:
```bash
npm start
```
This will run the app on http://localhost:3000.

4. Backend Setup 
To run the backend locally, you'll need a Python environment set up. The backend may use Flask or FastAPI for API requests.

Navigate to the backend directory:
```bash
cd backend
```
create a .env file and setup up your Gemini API Key:
```bash
GEMINI_API_KEY = ""
```
Install the required Python dependencies:
```bash

pip install -r requirements.txt
```
Start the backend server:
```bash
uvicorn main:app --reload
```
The backend API will be running at http://localhost:8000.

5. Testing the Application
Once both the frontend and backend are running, open your browser and go to http://localhost:3000 to interact with the application.

# How It Works

The **HIre_AI** mock interview platform is designed to guide users through a simulated interview process with AI-generated questions. Here's a detailed breakdown of how it works:

## 1. Topic Selection Page

- **Select Topics**: Users can choose multiple topics (e.g., "Linear Regression", "Deep Learning", etc.) by clicking on the respective buttons.
- **Deselect Topics**: If users want to remove a topic, they can click the selected button again to deselect it.
- **Start Interview**: Once topics are selected, users can click the **"Start Interview"** button to begin the mock interview session.

## 2. AI Mock Interview

- **Question Generation**: Based on the selected topics, the AI generates a series of questions for the mock interview. 
- **Speech Input**: By speaking responses using the integrated speech-to-text feature.
- **AI Interaction**: The AI processes the user’s answer and proceeds to the next question until the interview session is complete.

## 3. Speech-to-Text Integration

- **Voice Recording**: Users can record their voice responses using the app's integrated speech-to-text feature.
- **Transcription**: The recorded audio is sent to the backend for transcription using a speech-to-text service.
- **AI Interaction**: The transcribed text is then used to interact with the AI for the next part of the interview.

## 4. Evaluation

- **Report Evaluation**: After the interview is completed, users can click the **"Report Evaluation"** button to generate a feedback report on their performance.
- **Evaluation Contents**:
  - **Accuracy of Responses**: The AI evaluates the correctness of the user’s answers.
  - **Suggestions for Improvement**: Provides tips on how users can improve their responses.
  - **Score**: Users are given a score based on the quality and relevance of their responses during the interview.

## Contributing

We welcome contributors! Whether you want to add new tutorials, improve existing code, or report issues, your contributions make this community thrive. Here’s how to get involved:
- **Fork the repository.**
- **Create a new branch for your contribution.**
- **Submit a Pull Request and describe the improvements.**

