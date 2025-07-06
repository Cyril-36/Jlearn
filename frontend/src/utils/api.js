// frontend/src/utils/api.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Fetch all challenges
export const fetchChallenges = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/challenges`);
    if (!res.ok) throw new Error(`Error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("❌ Failed to fetch challenges:", error);
    return [];
  }
};

// Submit solution
export const submitSolution = async (challengeId, code) => {
  try {
    const res = await fetch(`${API_BASE_URL}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ challengeId, code }),
    });
    return await res.json();
  } catch (error) {
    console.error("❌ Submission error:", error);
    return { success: false, error: error.message };
  }
};
