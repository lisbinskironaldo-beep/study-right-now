const Ambient = {

    categories: {
        rain: {
            icon: "🌧",
            label: "Chuva",
            sounds: [
                { name: "Stormfall", src: "assets/sounds/Stormfall.wav" },
                { name: "Rainveil", src: "assets/sounds/Rainveil.mp3" },
                { name: "Downpour", src: "assets/sounds/Downpour.wav" },
                { name: "Mistfall", src: "assets/sounds/Mistfall.mp3" },
                { name: "Cloudburst", src: "assets/sounds/Cloudburst.wav" },
                { name: "Stormhush", src: "assets/sounds/Stormhush.wav" },
                { name: "Greyflow", src: "assets/sounds/Greyflow.wav" },
                { name: "Nightrain", src: "assets/sounds/Nightrain.mp3" },
                { name: "Stillstorm", src: "assets/sounds/Stillstorm.mp3" },
            ]
        },
        cafe: {
            icon: "☕",
            label: "Café",
            sounds: [
                { name: "Café suave", src: "assets/sounds/cafe.mp3" }
            ]
        },
        library: {
            icon: "📚",
            label: "Biblioteca",
            sounds: [
                { name: "Biblioteca silenciosa", src: "assets/sounds/white.mp3" }
            ]
        }
    },

    currentAudio: null,
    currentCategory: null,
    currentIndex: 0,

    init() {
        this.renderIcons();
        this.bindOutsideClick();

        document.getElementById("prevSound")
            .addEventListener("click", (e) => {
                e.stopPropagation();
                this.prev();
            });

        document.getElementById("nextSound")
            .addEventListener("click", (e) => {
                e.stopPropagation();
                this.next();
            });

        document.getElementById("toggleSound")
            .addEventListener("click", (e) => {
                e.stopPropagation();
                this.toggle();
            });
    },

    renderIcons() {

        const container = document.getElementById("ambientControls");

        container.innerHTML = Object.keys(this.categories)
            .map(key => `
                <button class="ambient-btn"
                    data-category="${key}">
                    ${this.categories[key].icon}
                </button>
            `).join("");

        container.querySelectorAll(".ambient-btn")
            .forEach(btn => {
                btn.addEventListener("click", (e) => {
                    e.stopPropagation();

                    const panel = document.getElementById("ambientPanel");

                    if (panel.classList.contains("show")) {
                        panel.classList.remove("show");
                        return;
                    }

                    this.openPanel(btn.dataset.category);
                });
            });
    },

    openPanel(categoryKey) {

        this.currentCategory = categoryKey;
        this.currentIndex = 0;

        const panel = document.getElementById("ambientPanel");
        const category = this.categories[categoryKey];

        panel.innerHTML = `
            <div class="ambient-panel-title">${category.label}</div>
            ${category.sounds.map((sound, index) => `
                <div class="ambient-option"
                     data-index="${index}">
                     ${sound.name}
                </div>
            `).join("")}
        `;

        panel.classList.remove("show");
        panel.classList.add("show");

        panel.querySelectorAll(".ambient-option")
            .forEach(opt => {
                opt.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const index = parseInt(opt.dataset.index);
                    this.currentIndex = index;
                    this.play(
                        this.categories[this.currentCategory]
                            .sounds[this.currentIndex].src
                    );
                });
            });
    },

    play(src) {

        if (this.currentAudio) {
            this.fadeOut(this.currentAudio);
        }

        const audio = new Audio(src);
        audio.loop = true;
        audio.volume = 0;

        audio.play();
        this.fadeIn(audio);

        this.currentAudio = audio;
    },

    prev() {
        if (!this.currentCategory) return;

        const sounds = this.categories[this.currentCategory].sounds;

        this.currentIndex =
            (this.currentIndex - 1 + sounds.length) % sounds.length;

        this.play(sounds[this.currentIndex].src);
    },

    next() {
        if (!this.currentCategory) return;

        const sounds = this.categories[this.currentCategory].sounds;

        this.currentIndex =
            (this.currentIndex + 1) % sounds.length;

        this.play(sounds[this.currentIndex].src);
    },

    toggle() {
        if (!this.currentAudio) return;

        if (this.currentAudio.paused) {
            this.currentAudio.play();
        } else {
            this.currentAudio.pause();
        }
    },

    fadeIn(audio) {
        let volume = 0;

        const interval = setInterval(() => {
            volume += 0.05;

            if (volume >= 0.3) {
                volume = 0.3;
                clearInterval(interval);
            }

            audio.volume = volume;
        }, 50);
    },

    fadeOut(audio) {
        let volume = audio.volume;

        const interval = setInterval(() => {
            volume -= 0.05;

            if (volume <= 0) {
                volume = 0;
                clearInterval(interval);
                audio.pause();
            }

            audio.volume = volume;
        }, 50);
    },

    bindOutsideClick() {
        document.addEventListener("click", (e) => {

            const panel = document.getElementById("ambientPanel");

            const clickedButton = e.target.closest(".ambient-btn");
            const clickedPanel = e.target.closest("#ambientPanel");

            if (!clickedButton && !clickedPanel) {
                panel.classList.remove("show");
            }
        });
    }

};

document.addEventListener("DOMContentLoaded", () => {
    Ambient.init();
});