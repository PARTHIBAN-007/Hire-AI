import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

function App() {
  // Stage management: "home" | "chat" | "evaluation"
  const [stage, setStage] = useState("home");

  // Home stage state
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [numQuestions, setNumQuestions] = useState(0);

  // Chat stage state
  const [messages, setMessages] = useState([]);
  const [iter, setIter] = useState(0);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);

  // Audio recording/transcription state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");

  // Evaluation stage state
  const [evaluationData, setEvaluationData] = useState([]);
  const [evalLoading, setEvalLoading] = useState(true);
  const [evalError, setEvalError] = useState(null);

  // Other constants and refs
  const predefinedRole = "Machine Learning Engineer";
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(new Audio());

  const availableTopics = [
    "Statistics",
    "Hypothesis Testing",
    "SQL",
    "Data Analysis",
    "Data Manipulation",
    "Feature Engineering",
    "Linear Regression",
    "Regularization",
    "Decision Tree",
    "Random Forest",
    "Supervised Learning",
    "Unsupervised Learning",
    "Neural Networks",
    "Natural Language Processing",
    "Transformers",
    "Large Language Model",
    "Retrieval Augmented Generation",
    "FineTuning",
  ];

  // Helper function to capitalize the first letter
  const capitalizeWords = (text) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  // ------------- HOME STAGE -------------
  const handleTopicClick = (topic) => {
    setSelectedTopics((prevTopics) =>
      prevTopics.includes(topic)
        ? prevTopics.filter((t) => t !== topic)
        : [...prevTopics, topic]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { role: predefinedRole, topics: selectedTopics };
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/config_question",
        data
      );
      if (response.status === 200) {
        setNumQuestions(response.data.numQuestions);
        setStage("chat");
        // Start conversation by fetching the first assistant message
        fetchMessage("", 0);
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setChatError("Error submitting form. Please try again.");
      setTimeout(() => {
        setChatError(null); // Clear the error after 5 seconds
      }, 5000);
    }
  };

  // ------------- CHAT STAGE -------------
  const fetchMessage = async (userResponse, currentIter) => {
    // Do not fetch if conversation is complete
    if (currentIter > numQuestions) return;
    setChatLoading(true);
    try {
      const res = await axios.post("http://127.0.0.1:8000/llm_question", {
        response: userResponse,
        iter: currentIter,
        topics: selectedTopics,
      });
      console.log(res);
      const message = res.data.response || "No response received";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: capitalizeWords(message) },
      ]);
      setIter(currentIter + 1);
      // Play audio for the assistant's message
      playAudio(message);
    } catch (err) {
      console.error("Error fetching message:", err);
      setChatError("There was an issue fetching the response.");
      setTimeout(() => {
        setChatError(null); // Clear the error after 5 seconds
      }, 5000);
    } finally {
      setChatLoading(false);
    }
  };

  const playAudio = (message) => {
    const msgToSpeech = new SpeechSynthesisUtterance(message);
    window.speechSynthesis.speak(msgToSpeech);
  };

  // Start audio recording using MediaRecorder API
  const startRecording = async () => {
    if (iter > numQuestions) return; // Prevent recording if interview is complete
    setIsRecording(true);
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setIsTranscribing(true);
        // Optionally, display a temporary "Transcribing..." message
        setMessages((prev) => [
          ...prev,
          { role: "system", text: "Transcribing..." },
        ]);
        uploadAudio(blob);
      };
      mediaRecorder.start();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setChatError("Microphone access denied or unavailable.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Upload audio for backend transcription
  const uploadAudio = async (blob) => {
    const formData = new FormData();
    formData.append("audio", blob, "audio.webm");
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/audio_to_text",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (!res.data || !res.data.text) {
        throw new Error("No transcription returned.");
      }
      const userText = capitalizeWords(res.data.text);
      setTranscribedText(userText);
      // Remove temporary "Transcribing..." message and append user's message
      setMessages((prev) =>
        prev.filter((msg) => msg.text !== "Transcribing...").concat({
          role: "user",
          text: userText,
        })
      );
      setIsTranscribing(false);
      // Fetch next assistant message based on the transcribed text
      fetchMessage(userText, iter);
    } catch (err) {
      console.error("Error processing audio:", err);
      setChatError("There was an issue processing the audio.");
      setIsTranscribing(false);
    }
  };

  // ------------- EVALUATION STAGE -------------
    useEffect(() => {
      if (stage === "evaluation") {
        const fetchEvaluationData = async () => {
          setEvalLoading(true);
          try {
            const response = await fetch("http://127.0.0.1:8000/evaluate_responses", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ iter: iter }), // Ensure correct iteration
            });

            const data = await response.json();
            console.log("Fetched evaluation data:", data); // Debugging step

            // Ensure correct key is accessed
            if (data && data.answers) {
              setEvaluationData(data.answers);
            } else {
              throw new Error("Invalid response structure");
            }
          } catch (error) {
            console.error("Error fetching evaluation data:", error);
            setEvalError("Error fetching evaluation data.");
          } finally {
            setEvalLoading(false);
          }
        };

        fetchEvaluationData();
      }
  }, [stage]);
  

  // ------------- RENDER -------------
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-10">
      {/* Display error messages (chat errors take precedence) */}
      {chatError && (
        <div className="mb-4 p-4 bg-red-600 text-red-100 rounded shadow-md">
          {chatError}
        </div>
      )}
      {stage === "home" && (
        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-5xl">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">
            HireAI
          </h1>
          {/* Centered Role */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Role</h2>
            <p className="text-gray-600">{predefinedRole}</p>
          </div>
          {/* Topics in 3 columns */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {availableTopics.map((topic) => (
              <div key={topic}>
                <button
                  onClick={() => handleTopicClick(topic)}
                  className={`px-4 py-2 border rounded transition duration-300 ${
                    selectedTopics.includes(topic)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-blue-400"
                  } w-full`}
                >
                  {topic}
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={handleSubmit}
            className="w-full bg-green-500 text-white py-3 rounded hover:bg-green-600 transition text-xl font-semibold"
          >
            Start Interview
          </button>
        </div>
      )}

      {stage === "chat" && (
        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-5xl">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">
            HireAI 
          </h1>
          <div className="h-[550px] overflow-y-auto border border-gray-300 rounded-lg p-6 bg-gray-50 w-full">
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-4 my-3 rounded-lg text-base font-medium max-w-2xl ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white ml-auto"
                      : msg.role === "system"
                      ? "bg-gray-200 text-gray-500 mx-auto italic"
                      : "bg-gray-300 text-gray-800 mr-auto"
                  }`}
                >
                  {msg.text}
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center">No messages yet...</p>
            )}
          </div>
          <div className="flex items-center mt-6 space-x-4 justify-center">
            {iter !== numQuestions + 1 && (
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`px-6 py-3 rounded-lg text-base font-medium transition ${
                  isRecording
                    ? "bg-red-500 text-white"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {isRecording ? "Stop Recording" : "Start Recording"}
              </button>
            )}
            {chatLoading && (
              <div className="flex justify-center items-center space-x-2">
                <div className="w-8 h-8 border-4 border-t-4 border-blue-500 rounded-full animate-spin"></div>
                <span className="text-gray-600">Loading...</span>
              </div>
            )}
          </div>
          {/* Show Report Evaluation button when conversation is complete */}
          {iter === numQuestions + 1 && (
            <div className="mt-6">
              <button
                onClick={() => setStage("evaluation")}
                className="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600 transition text-xl font-semibold"
              >
                Report Evaluation
              </button>
            </div>
          )}
        </div>
      )}

      {stage === "evaluation" && (
        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-5xl">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">
            HireAI Evaluation Report
          </h1>
          {evalLoading ? (
            <div className="flex justify-center items-center">
              <div className="w-8 h-8 border-4 border-t-4 border-blue-500 rounded-full animate-spin"></div>
              <span className="text-gray-600 ml-3">Loading Evaluation...</span>
            </div>
          ) : evalError ? (
            <div className="text-red-600">{evalError}</div>
          ) : (
            <div className="bg-white shadow-xl rounded-xl p-6 w-full ">
              
              {evaluationData.length > 0 ? (
                evaluationData.map((answer, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 p-5 rounded-lg shadow-md mb-6"
                  >
                    <h2 className="text-lg font-semibold text-indigo-600">
                      Question:
                    </h2>
                    <p className="mb-3 text-gray-600">
                      {answer.question || "No question available"}
                    </p>
                    <h3 className="text-md font-medium text-sky-600">
                      Response:
                    </h3>
                    <p className="mb-3 text-gray-500">
                      {answer.response || "No response provided"}
                    </p>
                    <h3 className="text-md font-medium text-yellow-600">
                      Accuracy:
                    </h3>
                    <p className="mb-3 text-gray-500">
                      {answer.accuracy || "Not available"}
                    </p>
                    <h3 className="text-md font-medium text-green-600">
                      Improvised Response:
                    </h3>
                    <p className="text-gray-500">
                      {answer.improvised_response || "No improvised response available"}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-center">
                  No evaluation data available.
                </div>
              )}
            </div>

          )}
        </div>
      )}
    </div>
  );
}

export default App;
