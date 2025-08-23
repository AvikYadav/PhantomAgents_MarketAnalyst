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
  // We no longer need accentColor here, as it will be set dynamically

  // NEW: A map to link category strings from the backend to your CSS color variables.
  // Make sure the keys here exactly match the category strings your backend sends.
  const categoryColorMap = {
    "core": "var(--category-core)",
    "documentation": "var(--category-documentation)",
    "finances": "var(--category-finances)",
    "market": "var(--category-market)",
    "stockdata": "var(--category-stockdata)",
    "macro_regulatory_data": "var(--category-macro_regulatory_data)",
    "sentiment_external_opinions": "var(--category-sentiment_external_opinions)",
    "events_interactions": "var(--category-events_interactions)",
    "general": "var(--category-general)"
  };
  const defaultColor = "var(--category-default)";


  let scatter = new Chart(graphCtx, {
    type: "scatter",
    data: {
      datasets: [{
        label: "Vector Embeddings",
        data: [],
        pointRadius: 1,
        // The colors will now be set dynamically in the updateGraph function
        pointBackgroundColor: defaultColor,
        pointBorderColor: defaultColor
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

  // --- THIS FUNCTION IS MODIFIED ---
  function updateGraph(graphData) {
    if (!Array.isArray(graphData) || graphData.length < 2) {
      console.error("Invalid graph data received. Expected an array.", graphData);
      graphMeta.textContent = "Graph data unavailable.";
      scatter.data.datasets[0].data = [];
      scatter.update();
      return;
    }

    const points = graphData[0];
    const category = graphData[1];

    if (!Array.isArray(points)) {
      console.error("Points data is not an array.", points);
      graphMeta.textContent = "Invalid points format.";
      return;
    }

    // NEW: Get the color for the category, or use the default color if not found.
    const color = categoryColorMap[category] || defaultColor;

    const dataset = scatter.data.datasets[0];

    // NEW: Update the dataset's colors dynamically.
    dataset.pointBackgroundColor = color;
    dataset.pointBorderColor = color;

    // Update the data points and refresh the chart.
    dataset.data = points.map(p => ({ x: p[0], y: p[1] }));
    scatter.update();
    graphMeta.textContent = `${category} • ${points.length} points`;
  }

  // --- Core API Fetch Function (no changes here) ---
  async function getApiResponse(message) {
    try {
      const response = await fetch("/api", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: message })
      });
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch from API:", error);
      return {
        response: "Sorry, I couldn't connect to the server. Please try again later.",
        graph_plot: null
      };
    }
  }

  // --- Event Listener (no changes here) ---
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (!text) return;

    addMessage({ text, role: "user" });
    userInput.value = "";
    typingIndicator.style.display = 'flex';
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    const apiData = await getApiResponse(text);

    typingIndicator.style.display = 'none';

    addMessage({ text: apiData.response, role: "bot" });
    updateGraph(apiData.graph_plot);
  });

  userInput.focus();
});