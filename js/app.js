/* =====================================================
   CORE ARCHITECTURE — HORÁRIO ONLINE
===================================================== */

/*
Arquitetura centralizada:

- 1 estado global único
- 1 sistema de navegação
- 1 sistema de teclado
- 1 sistema de áudio
- 1 controle de hero / módulos
- Nenhum listener espalhado fora do core
*/

const Core = {

    state: {
        mode: "clock",      // clock | stopwatch | timer | pomodoro | alarm | calendar | qts
        running: false,
        editing: false,

    modules: {},
    },

    init() {

        
        this.cacheDOM();
        this.registerModules();
        this.bindUI();
        this.initKeyboard();
        this.initFullscreen();
        this.initDarkMode();
        this.goHome();
    },
    registerModules() {

    if (typeof Clock !== "undefined")
        this.modules.clock = Clock;

    if (typeof Stopwatch !== "undefined")
        this.modules.stopwatch = Stopwatch;

    if (typeof Timer !== "undefined")
        this.modules.timer = Timer;

    if (typeof Pomodoro !== "undefined")
        this.modules.pomodoro = Pomodoro;

},

    cacheDOM() {
        this.hero = document.getElementById("hero");
        this.controls = document.getElementById("controls");
        this.timeDisplay = document.getElementById("timeDisplay");
        this.dateDisplay = document.getElementById("dateDisplay");
        this.modules = document.querySelectorAll(".module");
        this.footerButtons = document.querySelectorAll("[data-module]");
    },

    bindUI() {

        document.getElementById("focusModeBtn")
    .addEventListener("click", () => {
        document.body.classList.toggle("focus-mode");
    });

        // Footer navigation
        this.footerButtons.forEach(btn => {
    btn.addEventListener("click", () => {

        const module = btn.dataset.module;

        this.footerButtons.forEach(b =>
            b.classList.remove("active-footer")
        );

        btn.classList.add("active-footer");

        this.navigate(module);
    });
});

        // Home
       document.getElementById("homeBtn")
    .addEventListener("click", () => {

        this.footerButtons.forEach(b =>
            b.classList.remove("active-footer")
        );

        this.goHome();
    });

        // Controls
        document.getElementById("playBtn")
            .addEventListener("click", () => this.control("play"));

        document.getElementById("pauseBtn")
            .addEventListener("click", () => this.control("pause"));

        document.getElementById("resetBtn")
            .addEventListener("click", () => this.control("reset"));
    },

    navigate(target) {

    this.stopAll();
    this.hideModules();
    this.clearVisualResidues(target);

    // Modos que usam HERO
    if (
        target === "clock" ||
        target === "stopwatch" ||
        target === "timer" ||
        target === "pomodoro"
    ) {
        this.setMode(target);
        return;
    }

    // QTS
    if (target === "qts") {
    const printBtn = document.getElementById("printQtsBtn");
    if (printBtn) {
        printBtn.style.visibility = "visible";
        printBtn.style.pointerEvents = "auto";
    }
}

    // Módulos de tela cheia
    this.hideHero();
    document.getElementById(target + "Module").classList.add("active");

    this.state.mode = target;
    document.body.setAttribute("data-mode", target);
},

    setMode(mode) {

    this.state.mode = mode;
    document.body.setAttribute("data-mode", mode);

    this.showHero();
    this.hideModules();

    if (mode === "clock") {
    this.hideControls();
    if (this.modules.clock) this.modules.clock.start();
    return;
}

this.showControls();

if (this.modules[mode] && this.modules[mode].render) {
    this.modules[mode].render();
}
},

    goHome() {

    this.state.mode = "clock";
    document.body.setAttribute("data-mode", "clock");
    this.state.running = false;

    this.stopAll();
    this.clearVisualResidues("clock");

    this.hideModules();
    this.showHero();
    this.hideControls();

    if (this.modules.clock) {
        this.modules.clock.start();
    }
},

    control(action) {

        const module = this.modules[this.state.mode];

if (module && typeof module[action] === "function") {
    module[action]();
}
    },

    stopAll() {

    this.state.running = false;

    Object.values(this.modules).forEach(m => {
        if (m.pause) m.pause();
    });

},

    clearVisualResidues(target) {

    // NÃO limpar se o destino for QTS
    if (target === "qts") return;

    const ids = [
        "progressiveBars",
        "cycleProgress",
        "pomodoroPresets"
    ];

    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = "";
    });

    const printBtn = document.getElementById("printQtsBtn");
    if (printBtn) {
        printBtn.style.visibility = "hidden";
        printBtn.style.pointerEvents = "none";
    }

},

    hideModules() {
    this.modules.forEach(m => {
        m.classList.remove("active");
        m.classList.remove("fade-out");
    });
},

    hideHero() {
    this.hero.style.display = "none";

},

    showHero() {
    this.hero.style.display = "block";
},

    showControls() {
        this.controls.style.display = "flex";
    },

    hideControls() {
        this.controls.style.display = "none";
    },

        initKeyboard() {

    document.addEventListener("keydown", (e) => {

        if (
            e.target.isContentEditable ||
            e.target.tagName === "INPUT" ||
            e.target.tagName === "TEXTAREA"
        ) {
            return;
        }

        // ESC sempre funciona
        if (e.key === "Escape") {

            document.body.classList.remove("focus-mode");
            document.body.classList.remove("immersive-mode");

            if (document.fullscreenElement) {
                document.exitFullscreen();
            }

            return;
        }

        // Shift + F → Relógio + Imersivo + Fullscreen
        if (e.key.toLowerCase() === "f" && e.shiftKey) {

            document.body.classList.remove("focus-mode");

            if (Core.state.mode !== "clock") {
                Core.goHome();
            }

            document.body.classList.add("immersive-mode");

            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            }

            return;
        }

        // Controles só se NÃO for relógio
        if (this.state.mode !== "clock") {

            if (e.key === "Enter") {
                this.control("play");
            }

            if (e.code === "Space") {
                e.preventDefault();
                this.control("pause");
            }

            if (e.key === "Backspace") {
                this.control("reset");
            }

        }

    });

},

    initFullscreen() {

        document.getElementById("fullscreenBtn")
            .addEventListener("click", () => {

                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                } else {
                    document.exitFullscreen();
                }

            });
    },

    initDarkMode() {

        document.getElementById("darkToggle")
            .addEventListener("click", () => {
                document.body.classList.toggle("dark");
            });
    }

};

document.addEventListener("DOMContentLoaded", () => {

    Core.init();

    const side = document.getElementById("sideModules");
    const footerIcons = document.querySelectorAll(".footer-icon");

    if (side) {
        footerIcons.forEach(icon => {
            side.appendChild(icon);
        });
    }

});