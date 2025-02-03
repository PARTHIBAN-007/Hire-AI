import { useState, useEffect } from "react";

export default function EvaluationPage() {
  const [evaluationData, setEvaluationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvaluationData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/evaluate_responses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ iter: 0 }), // Send iter value as expected by backend
        });
        const data = await response.json();  // Parse the response as JSON
        console.log("Fetched response:", data);  // Log the response data

        // Update the state with the fetched data
        setEvaluationData(data.answers || []);
      } catch (error) {
        console.error("Error fetching response:", error);  // Handle any errors
        setError("Error fetching evaluation data.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchEvaluationData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-gray-500">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="bg-white shadow-xl rounded-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">Evaluation Report</h1>

        {evaluationData.length > 0 ? (
          evaluationData.map((answer, index) => (
            <div key={index} className="bg-gray-100 p-5 rounded-lg shadow-md mb-6">
              <h2 className="text-lg font-semibold text-indigo-600">Question:</h2>
              <p className="mb-3 text-gray-600">{answer.question || "No question available"}</p>

              <h3 className="text-md font-medium text-green-600">Response:</h3>
              <p className="mb-3 text-gray-500">{answer.response || "No response provided"}</p>

              <h3 className="text-md font-medium text-blue-600">Accuracy:</h3>
              <p className="mb-3 text-gray-500">{answer.accuracy || "Not available"}</p>

              <h3 className="text-md font-medium text-purple-600">Improvised Response:</h3>
              <p className="text-gray-500">{answer.improvised_response }</p>
            </div>
          ))
        ) : (
          <div className="text-gray-500">No evaluation data available.</div>
        )}
      </div>
    </div>
  );
}
