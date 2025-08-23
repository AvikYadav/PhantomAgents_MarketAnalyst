document.addEventListener("DOMContentLoaded", () => {
  const messagesDiv = document.getElementById("messages");
  const chatForm = document.getElementById("chatForm");
  const userInput = document.getElementById("userInput");
  const graphMeta = document.getElementById("graphMeta");
  const typingIndicator = document.getElementById("typingIndicator");
  const graphCanvas = document.getElementById("graphCanvas");

  if (!graphCanvas) return;
  const graphCtx = graphCanvas.getContext("2d");
  
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
        pointRadius: 4,
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

  function addMessage({ text, role }) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `msg ${role}`;
    
    // Create an avatar for BOTH user and bot messages
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    
    const content = document.createElement("div");
    content.className = "content";
    content.textContent = text;
    
    // The CSS 'flex-direction: row-reverse' on .msg.user will handle positioning.
    msgDiv.appendChild(avatar);
  	msgDiv.appendChild(content);

    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  async function askAPI(message) {
    await new Promise(resolve => setTimeout(resolve, 2500)); 
    const res = await fetch("/api", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    }).catch(() => ({ ok: false }));
    
    if (!res.ok) {
        return "Sorry, I couldn't connect to the server. Please try again later.";
    }
    return (await res.json()).response;
  }

  async function fetchGraph(query) {
    const res = await fetch("/graph", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    }).catch(() => null);

    if (!res || !res.ok) {
        return { points: [], category: "No data" };
    }
    return await res.json();
  }

  function updateGraph({ points, category }) {
    scatter.data.datasets[0].data = points.map(p => ({ x: p[0], y: p[1] }));
    scatter.update();
    graphMeta.textContent = `${category} • ${points.length} points`;
  }

  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (!text) return;
    
    addMessage({ text, role: "user" });
    userInput.value = "";
    typingIndicator.style.display = 'flex';
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    const reply = await askAPI(text);
    const graphData = await fetchGraph(text);

    typingIndicator.style.display = 'none';
    addMessage({ text: reply, role: "bot" });
    updateGraph(graphData);
  });

  userInput.focus();
});