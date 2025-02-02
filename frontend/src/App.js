import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function App() {
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [numQuestions, setNumQuestions] = useState(0); // Track number of questions
  const predefinedRole = "Machine Learning Engineer";
  const navigate = useNavigate();

  const availableTopics = [
    "Linear Regression",
    "Gradient Descent",
    "Data Analysis",
    "Data Manipulation",
    "Transformers",
    "Random Forest",
    "Decision Tree",
    "Deep Learning",
    "Statistics",
    "Regularization",
    "Neural Networks",
    "Hypothesis Testing",
    "Natural Language Processing",
    "Large Language Model",
  ];

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
      // Send the selected topics to the backend to get the number of questions
      const response = await axios.post("http://127.0.0.1:8000/config_question", data, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 200) {
        // Get the number of questions from the backend response
        const fetchedNumQuestions = response.data.numQuestions;
        setNumQuestions(fetchedNumQuestions);

        console.log("Fetched numQuestions:", fetchedNumQuestions);

        // Navigate to the chat page and pass topics and numQuestions in the state
        navigate("/chat", {
          state: { role: predefinedRole, topics: selectedTopics, numQuestions: fetchedNumQuestions },
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <div className="w-full max-w-md p-6 bg-gray-800 shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold text-center mb-6">AI Mock Interviewer</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 font-medium mb-2">Role</label>
            <input
              type="text"
              value={predefinedRole}
              readOnly
              className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white"
            />
          </div>
          <div>
            <label className="block text-gray-300 font-medium mb-2">Select Topics</label>
            <div className="grid grid-cols-2 gap-3">
              {availableTopics.map((topic) => (
                <div
                  key={topic}
                  onClick={() => handleTopicClick(topic)}
                  className={`px-4 py-2 border rounded-lg cursor-pointer text-center ${
                    selectedTopics.includes(topic)
                      ? "border-blue-500 bg-blue-700"
                      : "border-gray-600 hover:border-blue-400"
                  }`}
                >
                  {topic}
                </div>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-medium py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
