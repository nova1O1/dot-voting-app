console.log("[dot-poll] main.js loaded");

(function () {
  const MAX_TOTAL = 5;
  const MAX_PER = 3;

  const grid = document.getElementById("contestant-grid");
  const spheres = document.getElementById("vote-spheres");
  const votesLeftEl = document.getElementById("votes-left");
  const totalUsedEl = document.getElementById("total-used");
  const messageEl = document.getElementById("message");
  const submitBtn = document.getElementById("submit-btn");

  if (!grid || !spheres || !votesLeftEl || !totalUsedEl || !messageEl || !submitBtn) {
    console.error("[dot-poll] missing required elements.", {
      grid,
      spheres,
      votesLeftEl,
      totalUsedEl,
      messageEl,
      submitBtn,
    });
    return;
  }

  console.log("[dot-poll] DOM ready, wiring logic…");

  const state = {
    contestants: [],
    totalUsed: 0,
    perContestant: new Map(),
  };

  function setMessage(text, kind) {
    messageEl.textContent = text || "";
    messageEl.classList.remove("error", "success");
    if (kind === "error") messageEl.classList.add("error");
    if (kind === "success") messageEl.classList.add("success");
  }

  function renderSpheres() {
    spheres.innerHTML = "";
    const remaining = MAX_TOTAL - state.totalUsed;
    for (let i = 0; i < remaining; i++) {
      const dot = document.createElement("div");
      dot.className = "sphere";
      spheres.appendChild(dot);
    }
  }

  function renderCounts() {
    votesLeftEl.textContent = String(MAX_TOTAL - state.totalUsed);
    totalUsedEl.textContent = String(state.totalUsed);

    state.contestants.forEach((c) => {
      const card = grid.querySelector(`.contestant-card[data-id="${c.id}"]`);
      if (!card) return;
      const countSpan = card.querySelector('[data-role="count"]');
      const minusBtn = card.querySelector('[data-role="minus"]');
      const plusBtn = card.querySelector('[data-role="plus"]');
      const val = state.perContestant.get(c.id) || 0;

      if (countSpan) countSpan.textContent = String(val);
      if (minusBtn) minusBtn.disabled = val === 0;
      if (plusBtn) plusBtn.disabled = val >= MAX_PER || state.totalUsed >= MAX_TOTAL;
    });

    renderSpheres();
  }

  function addVote(id) {
    const current = state.perContestant.get(id) || 0;

    if (state.totalUsed >= MAX_TOTAL) {
      setMessage("You’ve already used all 5 votes.", "error");
      return;
    }

    if (current >= MAX_PER) {
      setMessage("You can only give 3 votes to one contestant.", "error");
      return;
    }

    state.perContestant.set(id, current + 1);
    state.totalUsed += 1;
    setMessage("");
    renderCounts();
  }

  function removeVote(id) {
    const current = state.perContestant.get(id) || 0;
    if (current <= 0) return;

    state.perContestant.set(id, current - 1);
    state.totalUsed -= 1;
    setMessage("");
    renderCounts();
  }

  function wireCardEvents(card, id) {
    const minusBtn = card.querySelector('[data-role="minus"]');
    const plusBtn = card.querySelector('[data-role="plus"]');
    if (minusBtn) {
      minusBtn.addEventListener("click", function () {
        removeVote(id);
      });
    }
    if (plusBtn) {
      plusBtn.addEventListener("click", function () {
        addVote(id);
      });
    }
  }

  // render each contestant, with per-contestant color
  function renderContestants() {
    grid.innerHTML = "";

    if (!state.contestants.length) {
      const div = document.createElement("div");
      div.className = "subtitle";
      div.textContent = "No contestants yet. Ask the admin to add some.";
      grid.appendChild(div);
      return;
    }

    state.contestants.forEach((c, index) => {
      const article = document.createElement("article");
      article.className = "contestant-card";
      article.setAttribute("data-id", c.id);

      // distinct-ish hue per contestant
      const hue = (index * 72) % 360;
      article.style.setProperty("--bubble-color", `hsl(${hue} 85% 60%)`);

      article.innerHTML = `
        <div class="contestant-main">
          <div class="contestant-avatar"></div>
          <div class="contestant-name-block">
            <div class="contestant-name">${c.name}</div>
            <div class="contestant-subtext">${c.subtitle || ""}</div>
          </div>
        </div>
        <div class="vote-controls">
          <div class="chip">
            <span class="chip-dot"></span>
            <span class="vote-count" data-role="count">0</span>
            <span>/ 3</span>
          </div>
          <button class="btn-circle minus" data-role="minus" aria-label="Remove vote">−</button>
          <button class="btn-circle plus" data-role="plus" aria-label="Add vote">+</button>
        </div>
      `;

      grid.appendChild(article);
      wireCardEvents(article, c.id);
    });

    renderCounts();
  }

  async function loadStateFromServer() {
    try {
      setMessage("Loading contestants…", null);
      console.log("[dot-poll] fetching /api/state…");
      const res = await fetch("/api/state", {
        headers: { "Cache-Control": "no-store" },
      });
      console.log("[dot-poll] /api/state status", res.status);
      if (!res.ok) throw new Error("Failed to load state from server.");
      const json = await res.json();
      console.log("[dot-poll] state payload", json);
      state.contestants = Array.isArray(json.contestants) ? json.contestants : [];
      state.perContestant.clear();
      state.totalUsed = 0;
      renderContestants();
      setMessage("", null);
    } catch (err) {
      console.error("[dot-poll] loadStateFromServer error:", err);
      setMessage("Could not load contestants from server.", "error");
    }
  }

  submitBtn.addEventListener("click", async function () {
    if (state.totalUsed === 0) {
      setMessage("You haven’t used any votes yet.", "error");
      return;
    }

    const payload = {};
    state.perContestant.forEach((val, id) => {
      if (val > 0) payload[id] = val;
    });

    submitBtn.disabled = true;

    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ votes: payload }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        const msg = data.error || "Failed to submit votes.";
        setMessage(msg, "error");
        submitBtn.disabled = false;
        return;
      }

      setMessage("Your votes have been submitted. Thank you!", "success");
      submitBtn.disabled = true;
      grid.querySelectorAll("button").forEach((btn) => (btn.disabled = true));
      state.totalUsed = MAX_TOTAL;
      renderCounts();
    } catch (err) {
      console.error("[dot-poll] submit error:", err);
      setMessage("Network error while submitting votes.", "error");
      submitBtn.disabled = false;
    }
  });

  renderSpheres();
  loadStateFromServer();
})();
