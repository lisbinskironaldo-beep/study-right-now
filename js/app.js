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
        editing: false
    },

    init() {
        this.cacheDOM();
        this.bindUI();
        this.initKeyboard();
        this.initFullscreen();
        this.initDarkMode();
        this.goHome();
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

    // limpar resíduos visuais do pomodoro
const presets = document.getElementById("pomodoroPresets");
if (presets) presets.innerHTML = "";

    // limpar resíduos visuais do pomodoro
    const pb = document.getElementById("progressiveBars");
    if (pb) pb.innerHTML = "";

    const cb = document.getElementById("cycleProgress");
    if (cb) cb.innerHTML = "";

    const printBtn = document.getElementById("printQtsBtn");
    if (printBtn) {
        printBtn.style.visibility = "hidden";
        printBtn.style.pointerEvents = "none";
    }

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
    if (target === "qts" && printBtn) {
        printBtn.style.visibility = "visible";
        printBtn.style.pointerEvents = "auto";
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
        if (typeof Clock !== "undefined") Clock.start();
        return;
    }

    this.showControls();

    if (mode === "stopwatch" && typeof Stopwatch !== "undefined") {
        Stopwatch.render();
    }

    if (mode === "timer" && typeof Timer !== "undefined") {
        Timer.render();
    }

    if (mode === "pomodoro" && typeof Pomodoro !== "undefined") {
        Pomodoro.render();
    }
},

    goHome() {

    this.state.mode = "clock";
    document.body.setAttribute("data-mode", "clock");
    this.state.running = false;

    // 🔒 parar tudo
    this.stopAll();

    // 🔒 limpar pomodoro visual
    const pb = document.getElementById("progressiveBars");
    if (pb) pb.innerHTML = "";

    const cb = document.getElementById("cycleProgress");
    if (cb) cb.innerHTML = "";

    const presets = document.getElementById("pomodoroPresets");
if (presets) presets.innerHTML = "";

    // 🔒 esconder botão imprimir
    const printBtn = document.getElementById("printQtsBtn");
    if (printBtn) {
        printBtn.style.visibility = "hidden";
        printBtn.style.pointerEvents = "none";
    }

    this.hideModules();
    this.showHero();
    this.hideControls();

    if (typeof Clock !== "undefined") {
        Clock.start();
    }
},

    control(action) {

        if (this.state.mode === "stopwatch" && typeof Stopwatch !== "undefined") {
            Stopwatch[action]();
        }

        if (this.state.mode === "timer" && typeof Timer !== "undefined") {
            Timer[action]();
        }

        if (this.state.mode === "pomodoro" && typeof Pomodoro !== "undefined") {
            Pomodoro[action]();
        }
    },

    stopAll() {
        this.state.running = false;

        if (typeof Stopwatch !== "undefined") Stopwatch.pause();
        if (typeof Timer !== "undefined") Timer.pause();
        if (typeof Pomodoro !== "undefined") Pomodoro.pause();
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

            if (this.state.mode === "clock") return;

            if (e.key === "enter" && !e.target.isContentEditable) {
    this.control("play");
}

            if (e.code === "Space") {
                e.preventDefault();
                this.control("pause");
            }

            if (e.key === "Backspace") this.control("reset");
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


/* =====================================================
   BOOT
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
    Core.init();
});