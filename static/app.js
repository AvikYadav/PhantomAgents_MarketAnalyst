const messagesDiv = document.getElementById("messages");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const graphMeta = document.getElementById("graphMeta");
const graphCtx = document.getElementById("graphCanvas").getContext("2d");

let scatter = new Chart(graphCtx, {
  type: "scatter",
  data: { datasets: [{ label: "Vector Embeddings", data: [], pointRadius: 3 }] },
  options: {
    plugins: { legend: { labels: { color: "#eaeaea" } } },
    scales: {
      x: { ticks: { color: "#eaeaea" }, grid: { color: "#333" } },
      y: { ticks: { color: "#eaeaea" }, grid: { color: "#333" } }
    }
  }
});

function addMessage({ text, role }) {
  const bubble = document.createElement("div");
  bubble.className = `msg ${role}`;
  if (role === "bot") {
    const avatar = document.createElement("span");
    avatar.className = "avatar";
    bubble.appendChild(avatar);
  }
  const content = document.createElement("div");
  content.textContent = text;
  bubble.appendChild(content);
  messagesDiv.appendChild(bubble);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function askAPI(message) {
  const res = await fetch("/api", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });
  return (await res.json()).response;
}
async function fetchGraph(query) {
  const res = await fetch("/graph", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });
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
  const reply = await askAPI(text);
  addMessage({ text: reply, role: "bot" });
  const g = await fetchGraph(text);
  updateGraph(g);
});

userInput.focus();
addMessage({ text: "👋 Hi, I’m Phantom. Ask me about markets, documents, or stocks!", role: "bot" });

