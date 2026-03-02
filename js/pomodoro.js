/* =====================================================
   POMODORO MODULE — PADRÃO CORE
===================================================== */

const Pomodoro = {

    interval: null,
    mode: "study", // study | break
    remaining: 0,
    running: false,

    presets: {
    tradicional: {
        study: 25*60,
        break: 5*60,
        label: "🍅 Tomate 25/5",
        desc: "25/5 ideal para foco padrão e produtividade diária."
    },
    estendido: {
        study: 50*60,
        break: 15*60,
        label: "🔥 Long / Deep Work 50/15",
        desc: "Sessões longas para trabalho profundo."
    },
    metodo5217: {
        study: 52*60,
        break: 17*60,
        label: "🧠 52/17",
        desc: "Baseado em estudos sobre foco sustentado."
    },
    ultradiano: {
        study: 90*60,
        break: 30*60,
        label: "⚡ Ritmo 90/30",
        desc: "Ciclo ultradiano de alto desempenho."
    },
    mini: {
        study: 15*60,
        break: 5*60,
        label: "🚀 Sprint 15/5",
        desc: "Ideal para tarefas rápidas ou iniciar foco."
    },
    progressivo: {
        study: 15*60,
        break: 5*60,
        label: "📈 Progressivo",
        desc: "15/5 _ 25/7,5 _ 35/10 _ 45/15..."
    },
    custom: {
        study: 30*60,
        break: 5*60,
        label: "⚙ Custom",
        desc: "Intervalos definidos pelo usuário."
    }
},

customSequence: [],
customIndex: 0,
customActive: false,

progressiveLevels: [
    { study: 15*60, break: 5*60 },
    { study: 25*60, break: 7.5*60 },
    { study: 35*60, break: 10*60 },
    { study: 45*60, break: 15*60 }
],

progressiveIndex: 0,

openCustomModal() {

    const modal = document.getElementById("customModal");
    modal.classList.remove("hidden");

    // inicia já com Study + Break
    this.customSequence = [
        { type: "study", minutes: 25 },
        { type: "break", minutes: 5 }
    ];

    this.renderCustomRows();

    document.addEventListener("keydown", this.handleEnterSave);
},

closeCustomModal() {
    document.getElementById("customModal").classList.add("hidden");
    document.removeEventListener("keydown", this.handleEnterSave);
},

handleEnterSave: (e) => {
    if (e.key === "Enter") {
        Pomodoro.saveCustom();
    }
},



addCustomRow() {

    const type =
        this.customSequence.length % 2 === 0 ? "study" : "break";

    this.customSequence.push({
        type,
        minutes: type === "study" ? 25 : 5
    });

    this.renderCustomRows();
},

removeCustomRow() {

    if (this.customSequence.length <= 2) return;

    this.customSequence.pop();
    this.renderCustomRows();
},
renderCustomRows() {

    const container = document.getElementById("customRows");
    container.innerHTML = "";

    this.customSequence.forEach((item, index) => {

        const row = document.createElement("div");
        row.className = "custom-row";

        const label = document.createElement("span");
        label.textContent = item.type === "study" ? "Estudo" : "Descanso";

        const input = document.createElement("input");
        input.type = "number";
        input.min = 1;
        input.value = item.minutes;

        input.oninput = (e) => {
            this.customSequence[index].minutes = Number(e.target.value);
        };

        row.appendChild(label);
        row.appendChild(input);

        container.appendChild(row);
    });
},

saveCustom() {

    if (this.customSequence.length < 2) return;

    this.customIndex = 0;
    this.customActive = true;

    this.currentPreset = "custom";

    this.remaining =
        this.customSequence[0].minutes * 60;

    this.mode = this.customSequence[0].type;
    this.renderCycleProgress();
    this.updateDisplay();
    this.renderPresets();

    this.closeCustomModal();
},
    currentPreset: "tradicional",

    renderPresets() {

    const container = document.getElementById("pomodoroPresets");
    if (!container) return;

    container.innerHTML = "";

    Object.keys(this.presets).forEach(key => {

        const p = this.presets[key];

        const chip = document.createElement("div");
        chip.className = "preset-chip";
        chip.textContent = p.label;
        chip.title = p.desc;

        if (key === this.currentPreset) {
            chip.classList.add("active");
        }

        chip.onclick = () => {

            if (key === "custom") {
                this.openCustomModal();
                return;
            }

            this.setPreset(key);
            this.renderPresets();
        };

        container.appendChild(chip);
    });
},
    
renderCycleProgress() {

    const container = document.getElementById("cycleProgress");
    if (!container) return;

    container.innerHTML = "";

    if (!this.customActive) return;

    this.customSequence.forEach((_, index) => {

        const bar = document.createElement("div");
        bar.className = "cycle-bar";

        if (index <= this.customIndex) {
            bar.classList.add("active");
        }

        container.appendChild(bar);
    });
},

renderProgressiveBars() {

    const container = document.getElementById("progressiveBars");
    if (!container) return;

    container.innerHTML = "";

    if (this.currentPreset !== "progressivo") return;

    this.progressiveLevels.forEach((_, index) => {

        const bar = document.createElement("div");
        bar.className = "progressive-bar";

        // níveis anteriores
        if (index < this.progressiveIndex) {
            bar.classList.add("active");
        }

        // nível atual
        if (index === this.progressiveIndex) {

            bar.classList.add("active");

            if (this.mode === "break") {

                const dot = document.createElement("div");
                dot.className = "progressive-dot";
                bar.appendChild(dot);
            }
        }

        container.appendChild(bar);
    });
},

updateCycleProgress() {
    this.renderCycleProgress();
},
    render() {

    // 🔒 limpar qualquer resto visual
    const pb = document.getElementById("progressiveBars");
    if (pb) pb.innerHTML = "";

    const cb = document.getElementById("cycleProgress");
    if (cb) cb.innerHTML = "";

    Core.state.running = false;
    this.running = false;

    if (this.currentPreset === "progressivo") {

        this.progressiveIndex = 0;
        this.mode = "study";
        this.remaining = this.progressiveLevels[0].study;

    } else {

        this.mode = "study";
        this.remaining =
            this.presets[this.currentPreset].study;
    }

    this.updateDisplay();
    this.renderPresets();
},

    play() {

    if (this.interval) return;
    if (this.remaining <= 0) return;

    this.running = true;
    Core.state.running = true;

    this.interval = setInterval(() => {

        this.remaining--;

        if (this.remaining <= 0) {

            clearInterval(this.interval);
            this.interval = null;

            this.switchMode();
        }

        this.updateDisplay();

    }, 1000);
},
    pause() {
        clearInterval(this.interval);
        this.interval = null;
        this.running = false;
        Core.state.running = false;
    },

    reset() {
        this.pause();
        this.mode = "study";
        this.remaining = this.presets[this.currentPreset].study;
        this.updateDisplay();
    },

    switchMode() {

    // garante que não existe interval rodando
    if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
    }

    // ===== CUSTOM =====
    if (this.customActive) {

        this.customIndex++;

        if (this.customIndex >= this.customSequence.length) {

            this.beepFinish();
            this.pause();
            return;
        }

        const next = this.customSequence[this.customIndex];

        this.mode = next.type;
        this.remaining = next.minutes * 60;

        this.updateCycleProgress();
        this.beepCycle();
        this.play();
        return;
    }

    // ===== PROGRESSIVO =====
if (this.currentPreset === "progressivo") {

    if (this.mode === "study") {

        this.mode = "break";
        this.remaining =
            this.progressiveLevels[this.progressiveIndex].break;

    } else {

        if (this.progressiveIndex <
            this.progressiveLevels.length - 1) {

            this.progressiveIndex++;
        }

        this.mode = "study";
        this.remaining =
            this.progressiveLevels[this.progressiveIndex].study;
    }

    this.updateDisplay();   // ✔ atualizar depois de definir tudo
    this.beepCycle();
    this.play();
    return;
}

    // ===== PRESET NORMAL (INFINITO) =====
    if (this.mode === "study") {
        this.mode = "break";

        this.remaining = this.presets[this.currentPreset].break;
    } else {
        this.mode = "study";
        this.remaining = this.presets[this.currentPreset].study;
    }

    this.beepCycle();
    this.play();
},

    updateDisplay() {

    const time = this.format(this.remaining);

    document.getElementById("timeDisplay").textContent = time;

    const modeLabel =
        this.mode === "study" ? "🔵 Estudo" : "🟢 Descanso";

    let presetLabel = this.presets[this.currentPreset].label;

    if (this.currentPreset === "progressivo") {

        if (this.progressiveIndex ===
            this.progressiveLevels.length - 1) {

            presetLabel = `📈 Progressivo — Deep Mode`;

        } else {

            presetLabel = `📈 Progressivo`;
        }
    }

    document.getElementById("dateDisplay").textContent =
        `${presetLabel} — ${modeLabel}`;

    this.renderProgressiveBars();
},
    setPreset(name) {

    if (!this.presets[name]) return;

    this.customActive = false;
    this.currentPreset = name;

    const pb = document.getElementById("progressiveBars");
if (pb) pb.innerHTML = "";

    // Reset progressivo
    if (name === "progressivo") {
    this.progressiveIndex = 0;
    this.mode = "study";
    this.remaining = this.progressiveLevels[0].study;
    this.updateDisplay();
    return;
}

    this.reset();
},
    format(totalSeconds) {
        const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
        const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
        const s = String(totalSeconds % 60).padStart(2, "0");
        return `${h}:${m}:${s}`;
    },

    audioCtx: null,

initAudio() {
    if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
},

beep(frequency = 800, duration = 120) {

    this.initAudio();

    const oscillator = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    gainNode.gain.setValueAtTime(0.1, this.audioCtx.currentTime);

    oscillator.start();

    setTimeout(() => {
        oscillator.stop();
    }, duration);
},

beepCycle() {
    this.beep(700, 100); // som curto e discreto
},

beepFinish() {
    this.beep(600, 150);
    setTimeout(() => this.beep(900, 150), 200);
},

    beepMultiple(times) {

    let count = 0;

    const audio = new Audio(
        "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg"
    );

    audio.volume = 0.25;

    const interval = setInterval(() => {

        audio.currentTime = 0;
        audio.play();

        count++;

        if (count >= times) {
            clearInterval(interval);
        }

    }, 400);
}
};
