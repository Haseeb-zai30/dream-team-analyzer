const formations = {
  "4-3-3": {
    rows: [["GK"], ["LB", "CB1", "CB2", "RB"], ["CM1", "CM2", "CAM"], ["LW", "ST", "RW"]]
  },
  "4-4-2": {
    rows: [["GK"], ["LB", "CB1", "CB2", "RB"], ["LM", "CM1", "CM2", "RM"], ["ST1", "ST2"]]
  },
  "3-5-2": {
    rows: [["GK"], ["CB1", "CB2", "CB3"], ["LM", "CM1", "CAM", "CM2", "RM"], ["ST1", "ST2"]]
  },
  "3-4-3": {
    rows: [["GK"], ["CB1", "CB2", "CB3"], ["LM", "CM1", "CM2", "RM"], ["ST1", "ST2", "ST3"]]
  }
};

const field = document.getElementById("field");
const formationSelect = document.getElementById("formation");
const resultDiv = document.getElementById("result");

function createPlayerInputs(formationKey) {
  field.innerHTML = "";
  const { rows } = formations[formationKey];

  rows.forEach((row, index) => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "player-row";
    rowDiv.style.gridTemplateColumns = `repeat(${row.length}, 1fr)`;
    rowDiv.style.top = `${10 + index * 18}%`;

    row.forEach(position => {
      const wrapper = document.createElement("div");
      wrapper.className = "flex flex-col items-center gap-1";

      const input = document.createElement("input");
      input.placeholder = position;
      input.name = position;
      input.className = "p-1 text-xs text-center bg-white bg-opacity-80 border rounded shadow w-full max-w-[70px] player-input";

      const img = document.createElement("img");
      img.src = "/static/default.png";
      img.alt = "Player";
      img.className = "player-img w-20 h-20 object-cover rounded-full border border-gray-300 shadow";


      wrapper.appendChild(input);
      wrapper.appendChild(img);
      rowDiv.appendChild(wrapper);
    });

    field.appendChild(rowDiv);
  });
}

createPlayerInputs(formationSelect.value);
formationSelect.addEventListener("change", () => createPlayerInputs(formationSelect.value));

// Load image on blur (when user types name)
document.addEventListener("blur", async (e) => {
  if (e.target && e.target.classList.contains("player-input")) {
    const name = e.target.value.trim();
    if (!name) return;

    const wrapper = e.target.closest("div");
    const imgTag = wrapper.querySelector(".player-img");

    const response = await fetch("/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });

    const data = await response.json();
    imgTag.src = data.img || "/static/default.jpg";
  }
}, true);

// Analyze Team
document.getElementById("submitTeam").addEventListener("click", () => {
  const formation = formationSelect.value;
  const inputs = document.querySelectorAll(".player-input");
  const team = {};
  let missingFields = [];

  inputs.forEach(input => {
    const pos = input.placeholder;
    const name = input.value.trim();
    if (name) {
      team[pos] = name;
    } else {
      missingFields.push(pos);
    }
  });

  if (missingFields.length > 0) {
    resultDiv.className = "p-4 rounded shadow bg-red-100 text-red-800";
    resultDiv.innerText = `❗ Please fill all player names.\nMissing: ${missingFields.join(", ")}`;
    resultDiv.classList.remove("hidden");
    return;
  }

  fetch("/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ formation, team })
  })
    .then(res => res.json())
    .then(data => {
      resultDiv.classList.remove("hidden");
      if (data.analysis) {
        resultDiv.className = "p-4 rounded shadow bg-green-100 text-green-800";
        resultDiv.innerText = data.analysis;
      } else {
        resultDiv.className = "p-4 rounded shadow bg-red-100 text-red-800";
        resultDiv.innerText = `⚠️ Error: ${data.error || "Unexpected response"}`;
      }
    })
    .catch(err => {
      resultDiv.classList.remove("hidden");
      resultDiv.className = "p-4 rounded shadow bg-red-100 text-red-800";
      resultDiv.innerText = `❌ Network error: ${err.message}`;
    });
});
