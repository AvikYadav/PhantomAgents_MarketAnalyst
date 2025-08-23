document.addEventListener("DOMContentLoaded", () => {
  const messagesDiv = document.getElementById("messages");
  const chatForm = document.getElementById("chatForm");
  const userInput = document.getElementById("userInput");
  const graphMeta = document.getElementById("graphMeta");
  const typingIndicator = document.getElementById("typingIndicator");
  const graphCanvas = document.getElementById("graphCanvas");

  if (!graphCanvas) return;
  const graphCtx = graphCanvas.getContext("2d");

  // --- Helper Function to Get CSS Variable Values ---
  // NEW: This function reads the actual color value (e.g., "#38bdf8") from a CSS variable.
  function getCssVariable(variableName) {
    return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
  }

  // --- Color Mapping (Now with Resolved Colors) ---
  // NEW: We now call getCssVariable to populate the map with the real color codes.
  const categoryColorMap = {
    "core": getCssVariable('--category-core'),
    "documentation": getCssVariable('--category-documentation'),
    "finances": getCssVariable('--category-finances'),
    "market": getCssVariable('--category-market'),
    "stockdata": getCssVariable('--category-stockdata'),
    "macro_regulatory_data": getCssVariable('--category-macro_regulatory_data'),
    "sentiment_external_opinions": getCssVariable('--category-sentiment_external_opinions'),
    "events_interactions": getCssVariable('--category-events_interactions'),
    "general": getCssVariable('--category-general')
  };
  const defaultColor = getCssVariable('--category-default');


  // --- Graph Setup (Chart.js) ---
  const textColor = getCssVariable('--text');
  const gridColor = getCssVariable('--border');

  let scatter = new Chart(graphCtx, {
    type: "scatter",
    data: {
      datasets: [{
        label: "Vector Embeddings",
        data: [],
        pointRadius: 1,
        pointBackgroundColor: defaultColor, // Uses the resolved default color
        pointBorderColor: defaultColor    // Uses the resolved default color
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
    content.innerHTML = text;
    msgDiv.appendChild(avatar);
    msgDiv.appendChild(content);
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  function updateGraph(graphData) {
    if (!Array.isArray(graphData) || graphData.length < 2) {
      graphMeta.textContent = "Graph data unavailable.";
      scatter.data.datasets[0].data = [];
      scatter.update();
      return;
    }

    const points = graphData[0];
    const category = graphData[1];

    if (!Array.isArray(points)) {
      graphMeta.textContent = "Invalid points format.";
      return;
    }

    // Get the resolved color from the map. This will now be a hex/rgb code.
    const color = categoryColorMap[category] || defaultColor;
    const dataset = scatter.data.datasets[0];

    // Update the dataset's colors and data
    dataset.pointBackgroundColor = color;
    dataset.pointBorderColor = color;
    dataset.data = points.map(p => ({ x: p[0], y: p[1] }));

    // Refresh the chart
    scatter.update();
    graphMeta.textContent = `${category} • ${points.length} points`;
  }

  // --- Core API Fetch Function (no changes) ---
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

  // --- Event Listener (no changes) ---
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