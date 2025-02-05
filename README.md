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
Create a .env file and setup up your Gemini API Key:
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



## Contributing

We welcome contributors! Whether you want to add new tutorials, improve existing code, or report issues, your contributions make this community thrive. Here’s how to get involved:
- **Fork the repository.**
- **Create a new branch for your contribution.**
- **Submit a Pull Request and describe the improvements.**

