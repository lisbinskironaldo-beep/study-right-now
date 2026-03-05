/* =====================================================
   CORE ARCHITECTURE — HORÁRIO ONLINE
===================================================== */

const Core = {

    state: {
        mode: "clock",
        running: false,
        editing: false
    },

    modules: {},
    moduleElements: [],
    footerButtons: [],
    hero: null,
    controls: null,
    printBtn: null,

    /* ================= INIT ================= */

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

       getActiveModule() {
        return this.modules[this.state.mode] || null;
    },

    /* ================= DOM ================= */

    cacheDOM() {

        this.hero = document.getElementById("hero") || null;
        this.controls = document.getElementById("controls") || null;

        this.moduleElements =
            document.querySelectorAll(".module") || [];

        this.footerButtons =
            document.querySelectorAll("[data-module]") || [];

        this.printBtn =
            document.getElementById("printQtsBtn") || null;
    },

    bindUI() {

        const focusBtn =
            document.getElementById("focusModeBtn");

        if (focusBtn) {
            focusBtn.addEventListener("click", () => {
                document.body.classList.toggle("focus-mode");
            });
        }

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

        const homeBtn =
            document.getElementById("homeBtn");

        if (homeBtn) {
            homeBtn.addEventListener("click", () => {

                this.footerButtons.forEach(b =>
                    b.classList.remove("active-footer")
                );

                this.goHome();
            });
        }

        const playBtn =
            document.getElementById("playBtn");
        const pauseBtn =
            document.getElementById("pauseBtn");
        const resetBtn =
            document.getElementById("resetBtn");

        if (playBtn)
            playBtn.addEventListener("click",
                () => this.control("play"));

        if (pauseBtn)
            pauseBtn.addEventListener("click",
                () => this.control("pause"));

        if (resetBtn)
            resetBtn.addEventListener("click",
                () => this.control("reset"));
    },

    /* ================= NAVIGATION ================= */

    navigate(target) {

        if (this.modules[target]) {
            this.changeMode(target);
            return;
        }

        this.stopAll();
        this.clearVisualResidues(target);

        if (target === "qts" && this.printBtn) {
            this.printBtn.style.visibility = "visible";
            this.printBtn.style.pointerEvents = "auto";
        }

        this.hideHero();
        this.hideModules();

        const moduleEl =
            document.getElementById(target + "Module");

        if (moduleEl)
            moduleEl.classList.add("active");

        this.state.mode = target;
        document.body.setAttribute("data-mode", target);
    },

    changeMode(mode) {

    const previousMode = this.state.mode;

    this.stopAll();
    this.clearVisualResidues(mode);
    this.setMode(mode);

    if (window.AmbientEngine && AmbientEngine.onModeChange) {
        AmbientEngine.onModeChange(previousMode, mode);
    }

},

    setMode(mode) {

        this.state.mode = mode;
        document.body.setAttribute("data-mode", mode);

        this.hideModules();
        this.showHero();

        const module = this.modules[mode];

        if (mode === "clock") {
            this.hideControls();
            if (module && module.start)
                module.start();
            return;
        }

        this.showControls();

        if (module && module.render)
            module.render();
    },

    goHome() {
        this.changeMode("clock");
    },

    /* ================= CONTROL ================= */

    control(action) {

    const module = this.getActiveModule();

    if (!module) return;

    if (typeof module[action] === "function") {
        module[action]();
    }

},

    stopAll() {

        this.state.running = false;

        Object.values(this.modules)
            .forEach(m => {
                if (m.pause) m.pause();
            });
    },

    clearVisualResidues(target) {

        if (target === "qts") return;

        const ids = [
            "progressiveBars",
            "cycleProgress",
            "pomodoroPresets"
        ];

        ids.forEach(id => {
            const el =
                document.getElementById(id);
            if (el) el.innerHTML = "";
        });

        if (this.printBtn) {
            this.printBtn.style.visibility = "hidden";
            this.printBtn.style.pointerEvents = "none";
        }
    },

    /* ================= UI HELPERS ================= */

    hideModules() {
        this.moduleElements.forEach(m => {
            m.classList.remove("active");
            m.classList.remove("fade-out");
        });
    },

    hideHero() {
        if (this.hero)
            this.hero.style.display = "none";
    },

    showHero() {
        if (this.hero)
            this.hero.style.display = "block";
    },

    showControls() {
        if (this.controls)
            this.controls.style.display = "flex";
    },

    hideControls() {
        if (this.controls)
            this.controls.style.display = "none";
    },

    /* ================= KEYBOARD ================= */

    initKeyboard() {

        document.addEventListener("keydown", (e) => {

            if (
                e.target.isContentEditable ||
                e.target.tagName === "INPUT" ||
                e.target.tagName === "TEXTAREA"
            ) return;

            if (e.key === "Escape") {

                document.body.classList.remove("focus-mode");
                document.body.classList.remove("immersive-mode");

                if (document.fullscreenElement)
                    document.exitFullscreen();

                return;
            }

            if (e.key.toLowerCase() === "f" && e.shiftKey) {

                if (this.state.mode !== "clock")
                    this.goHome();

                document.body.classList.add("immersive-mode");

                if (!document.fullscreenElement)
                    document.documentElement.requestFullscreen();

                return;
            }

            if (this.state.mode !== "clock") {

                if (e.key === "Enter")
                    this.control("play");

                if (e.code === "Space") {
                    e.preventDefault();
                    this.control("pause");
                }

                if (e.key === "Backspace")
                    this.control("reset");
            }
        });
    },

    initFullscreen() {

        const btn =
            document.getElementById("fullscreenBtn");

        if (!btn) return;

        btn.addEventListener("click", () => {

            if (!document.fullscreenElement)
                document.documentElement.requestFullscreen();
            else
                document.exitFullscreen();
        });
    },

    initDarkMode() {

        const btn =
            document.getElementById("darkToggle");

        if (!btn) return;

        btn.addEventListener("click", () => {
            document.body.classList.toggle("dark");
        });
    }

};

/* ================= BOOT ================= */

document.addEventListener("DOMContentLoaded", () => {

    Core.init();

    const side =
        document.getElementById("sideModules");

    const footerIcons =
        document.querySelectorAll(".footer-icon");

    if (side) {
        footerIcons.forEach(icon =>
            side.appendChild(icon)
        );
    }
});