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
      const input = document.createElement("input");
      input.placeholder = position;
      input.name = position;
      input.className = "p-1 text-xs text-center bg-white bg-opacity-80 border rounded shadow w-full max-w-[70px]";
      rowDiv.appendChild(input);
    });

    field.appendChild(rowDiv);
  });
}

createPlayerInputs(formationSelect.value);

formationSelect.addEventListener("change", () => {
  createPlayerInputs(formationSelect.value);
});

document.getElementById("submitTeam").addEventListener("click", () => {
  const formation = formationSelect.value;
  const inputs = document.querySelectorAll("#field input");
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

  fetch("http://127.0.0.1:5000/analyze", {
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
