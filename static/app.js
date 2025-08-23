document.addEventListener("DOMContentLoaded", () => {
  const messagesDiv = document.getElementById("messages");
  const chatForm = document.getElementById("chatForm");
  const userInput = document.getElementById("userInput");
  const graphMeta = document.getElementById("graphMeta");
  const typingIndicator = document.getElementById("typingIndicator");
  const graphCanvas = document.getElementById("graphCanvas");

  if (!graphCanvas) return;
  const graphCtx = graphCanvas.getContext("2d");

  // --- Graph Setup (Chart.js) ---
  const style = getComputedStyle(document.body);
  const textColor = style.getPropertyValue('--text').trim();
  const gridColor = style.getPropertyValue('--border').trim();
  const accentColor = style.getPropertyValue('--accent').trim();

  let scatter = new Chart(graphCtx, {
    type: "scatter",
    data: {
      datasets: [{
        label: "Vector Embeddings",
        data: [],
        pointRadius: 1,
        pointBackgroundColor: accentColor,
        pointBorderColor: accentColor
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: textColor, font: { family: "'Inter', sans-serif" } } }
      },
      scales: {
        x: { ticks: { color: textColor }, grid: { color: gridColor } },
        y: { ticks: { color: textColor }, grid: { color: gridColor } }
      }
    }
  });

  // --- UI Helper Functions ---

  function addMessage({ text, role }) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `msg ${role}`;

    const avatar = document.createElement("div");
    avatar.className = "avatar";

    const content = document.createElement("div");
    content.className = "content";
    content.textContent = text;

    msgDiv.appendChild(avatar);
    msgDiv.appendChild(content);

    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

function updateGraph(graphData) {
    // Check if graphData is a valid array with at least two elements
    if (!Array.isArray(graphData) || graphData.length < 2) {
        console.error("Invalid graph data received. Expected an array.", graphData);
        graphMeta.textContent = "Graph data unavailable.";
        // Clear previous data if the new data is invalid
        scatter.data.datasets[0].data = [];
        scatter.update();
        return;
    }

    // Unpack the array by index:
    // graphData[0] is the list of vector points (extracted_data)
    // graphData[1] is the category string
    const points = graphData[0];
    const category = graphData[1];

    // Ensure points is also an array before proceeding
    if (!Array.isArray(points)) {
        console.error("Points data is not an array.", points);
        graphMeta.textContent = "Invalid points format.";
        return;
    }

    scatter.data.datasets[0].data = points.map(p => ({ x: p[0], y: p[1] }));
    scatter.update();
    graphMeta.textContent = `${category} • ${points.length} points`;
  }



  // --- Core API Fetch Function (FIXED) ---

  async function getApiResponse(message) {
    try {
      const response = await fetch("/api", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: message })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // The backend returns a single JSON with both keys
      return await response.json();

    } catch (error) {
      console.error("Failed to fetch from API:", error);
      // Return an object with an error message to display in the chat
      return {
        response: "Sorry, I couldn't connect to the server. Please try again later.",
        graph_plot: null // Ensure graph_plot is null on error
      };
    }
  }


  // --- Event Listener ---

  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (!text) return;

    addMessage({ text, role: "user" });
    userInput.value = "";
    typingIndicator.style.display = 'flex';
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    // Call the single, combined API function
    const apiData = await getApiResponse(text);

    typingIndicator.style.display = 'none';

    // Use the 'response' and 'graph_plot' keys from the returned object
    addMessage({ text: apiData.response, role: "bot" });
    updateGraph(apiData.graph_plot);
  });

  userInput.focus();
});