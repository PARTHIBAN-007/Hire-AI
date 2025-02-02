import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [iter, setIter] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcribedText, setTranscribedText] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const { topics, numQuestions, role } = location.state || {
    topics: [],
    numQuestions: 3,
    role: "Machine Learning Engineer",
  };

  useEffect(() => {
    if (numQuestions > 0 && topics.length > 0) {
      fetchMessage("", 0);
    }
  }, [numQuestions, topics]);

  const capitalizeWords = (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const fetchMessage = async (responseText, iteration) => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/llm_question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          response: responseText,
          iter: iteration,
          topics,
        }),
      });
      const data = await res.json();
      const message = capitalizeWords(data.response || "No response received");
      setMessages((prev) => [...prev, { role: "assistant", text: message }]);
      setIter(iteration + 1);
      if (iteration === numQuestions + 1) {
        setTimeout(() => navigate("/evaluation_page"), 10000);
      }
      speakText(message);
    } catch (error) {
      console.error("Error fetching message:", error);
      setError("There was an issue fetching the response.");
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  const startRecording = async () => {
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
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(audioBlob);
        setIsTranscribing(true);
        setMessages((prev) => [...prev, { role: "system", text: "Transcribing..." }]);
        uploadAudio(audioBlob);
      };

      mediaRecorder.start();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setError("Microphone access denied or unavailable.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadAudio = async (audioBlob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "audio.webm");

    try {
      const res = await fetch("http://127.0.0.1:8000/audio_to_text", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      let transcribedText = capitalizeWords(data.text);
      setTranscribedText(transcribedText);

      setMessages((prev) =>
        prev
          .filter((msg) => msg.text !== "Transcribing...")
          .concat({ role: "user", text: transcribedText })
      );

      setIsTranscribing(false);

      fetchMessage(transcribedText, iter);
    } catch (error) {
      console.error("Error uploading audio:", error);
      setError("There was an issue processing the audio.");
      setIsTranscribing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-10">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-5xl">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Chat Interface</h1>
        
        <div className="h-[550px] overflow-y-auto border border-gray-300 rounded-lg p-6 bg-gray-50 w-full">
          {messages.map((msg, index) => (
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
          ))}
        </div>

        <div className="flex items-center mt-6 space-x-4 justify-center">
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
          {loading && <span className="text-gray-600 text-base">Loading...</span>}
          {error && <span className="text-red-500 text-base">{error}</span>}
        </div>
      </div>
    </div>
  );
}
