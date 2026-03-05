/* =====================================================
   STOPWATCH MODULE — PADRÃO CORE
===================================================== */

const Stopwatch = {

    seconds: 0,
    interval: null,

    render() {

        Core.state.running = false;
        this.seconds = 0;

        this.display = document.getElementById("timeDisplay");
        this.date = document.getElementById("dateDisplay");

        this.updateDisplay();

        if (this.date)
            this.date.textContent = "Cronômetro";
    },

    play() {

        if (this.interval) return;

        Core.state.running = true;

        this.interval = setInterval(() => {
            this.seconds++;
            this.updateDisplay();
        }, 1000);
    },

    pause() {

        clearInterval(this.interval);
        this.interval = null;
        Core.state.running = false;
    },

    reset() {

        this.pause();
        this.seconds = 0;
        this.updateDisplay();
    },

    updateDisplay() {

        if (!this.display) return;

        this.display.textContent =
            this.format(this.seconds);
    },

    format(totalSeconds) {

        const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
        const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
        const s = String(totalSeconds % 60).padStart(2, "0");

        return `${h}:${m}:${s}`;
    }
};


/* =====================================================
   TIMER MODULE — REGRESSIVO + EDIÇÃO INTELIGENTE
===================================================== */

const Timer = {

    total: 0,
    remaining: 0,
    interval: null,
    editSection: 0,
    editing: false,

    render() {

        Core.state.running = false;

        this.display = document.getElementById("timeDisplay");
        this.date = document.getElementById("dateDisplay");

        this.total = 0;
        this.remaining = 0;
        this.editing = false;

        if (this.display)
            this.display.textContent = "00:00:00";

        if (this.date)
            this.date.textContent = "Timer";

        this.attachEditing();
    },

    attachEditing() {

        if (!this.display) return;

        this.display.onclick = (e) => {

            if (Core.state.mode !== "timer") return;

            this.editing = true;

            const rect = this.display.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const width = rect.width;

            if (clickX < width / 3) this.editSection = 0;
            else if (clickX < (width / 3) * 2) this.editSection = 1;
            else this.editSection = 2;

            this.highlight();
        };
    },

    play() {

        if (this.remaining <= 0) return;
        if (this.interval) return;

        Core.state.running = true;

        this.interval = setInterval(() => {

            this.remaining--;

            if (this.remaining <= 0) {
                this.remaining = 0;
                this.pause();
                this.beep();
            }

            this.updateDisplay();

        }, 1000);
    },

    pause() {

        clearInterval(this.interval);
        this.interval = null;
        Core.state.running = false;
    },

    reset() {

        this.pause();
        this.remaining = this.total;
        this.updateDisplay();
    },

    updateDisplay() {

        if (!this.display) return;

        this.display.textContent =
            this.format(this.remaining);
    },

    highlight() {

        if (!this.display) return;

        const parts =
            this.display.textContent.split(":");

        parts[this.editSection] =
            `<span class="highlight">${parts[this.editSection]}</span>`;

        this.display.innerHTML =
            parts.join(":");
    },

    handleNumberInput(num) {

        if (!this.editing) return;

        let parts =
            this.display.textContent
            .split(":")
            .map(Number);

        parts[this.editSection] =
            (parts[this.editSection] * 10 + num) % 100;

        this.setTime(parts);

        if (parts[this.editSection] >= 10) {

            this.editSection++;

            if (this.editSection > 2) {
                this.editing = false;
                this.editSection = 0;
            }
        }

        this.highlight();
    },

    setTime(parts) {

        this.total =
            parts[0] * 3600 +
            parts[1] * 60 +
            parts[2];

        this.remaining = this.total;

        if (this.display)
            this.display.textContent =
                parts.map(v =>
                    String(v).padStart(2, "0")
                ).join(":");
    },

    format(totalSeconds) {

        const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
        const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
        const s = String(totalSeconds % 60).padStart(2, "0");

        return `${h}:${m}:${s}`;
    },

    beep() {

        const audio = new Audio();

        audio.src =
        "https://actions.google.com/sounds/v1/alarms/beep_short.ogg";

        audio.volume = 0.4;

        audio.play();
    }
};


/* =====================================================
   GLOBAL NUMBER CAPTURE PARA TIMER
===================================================== */

document.addEventListener("keydown", (e) => {

    if (
        e.target.isContentEditable ||
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA"
    ) return;

    if (Core.state.mode !== "timer") return;

    if (!/[0-9]/.test(e.key)) return;

    Timer.handleNumberInput(Number(e.key));
});