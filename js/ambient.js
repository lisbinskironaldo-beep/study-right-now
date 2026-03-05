/* =====================================================
   AMBIENT ENGINE
===================================================== */

const AmbientEngine = {

    /* ================= CATEGORIES ================= */

    categories: {

              favorites: {
    icon: "⭐",
    label: "Favoritos",
    sounds: []
},

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
                { name: "Stillstorm", src: "assets/sounds/Stillstorm.mp3" }
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
        },

        nature: {
            icon: "🌿",
            label: "Natureza",
            sounds: [
                { name: "Forest Wind", src: "assets/sounds/forest.mp3" },
                { name: "Night Crickets", src: "assets/sounds/crickets.mp3" },
                { name: "River Flow", src: "assets/sounds/river.mp3" }
            ]
        },

        fireplace: {
            icon: "🔥",
            label: "Lareira",
            sounds: [
                { name: "Fireplace Calm", src: "assets/sounds/fireplace.mp3" },
                { name: "Warm Fire", src: "assets/sounds/fire2.mp3" }
            ]
        },

        city: {
            icon: "🌆",
            label: "Cidade",
            sounds: [
                { name: "Night City", src: "assets/sounds/city.mp3" },
                { name: "Distant Traffic", src: "assets/sounds/traffic.mp3" },
                { name: "Metro Ambience", src: "assets/sounds/metro.mp3" }
            ]
        },

        youtube: {
            icon: "▶",
            label: "YouTube",
            sounds: []
        }

    },

    currentAudio: null,
    currentCategory: null,
    currentIndex: 0,
    currentCategoryIndex: 0,

    /* ================= INIT ================= */

    init() {

        this.bindOutsideClick();

        this.renderPlayerCategories();
        this.bindPlayer();
        this.bindKeyboard();

        const p = document.getElementById("ambientPrev");
        const n = document.getElementById("ambientNext");
        const t = document.getElementById("ambientPlay");

        const volume = document.getElementById("ambientVolume");

if (volume) {
    volume.addEventListener("input", (e) => {
        if (this.currentAudio) {
            this.currentAudio.volume = parseFloat(e.target.value);
        }
    });
}

        if (p) p.addEventListener("click", () => this.prev());
        if (n) n.addEventListener("click", () => this.next());
        if (t) t.addEventListener("click", () => this.toggle());

    },

    /* ================= CAROUSEL ================= */

    renderCarousel() {

        const keys = Object.keys(this.categories);
        const container = document.getElementById("ambientCategories");

        if (!container) return;

        container.innerHTML = "";

        keys.forEach((key, i) => {

            const el = document.createElement("div");
            el.className = "ambient-category";

            if (i === this.currentCategoryIndex) el.classList.add("center");
            else if (i === this.currentCategoryIndex - 1 || i === this.currentCategoryIndex + 1)
                el.classList.add("side");

            el.innerHTML = `<img src="assets/ambient/${key}.jpg">`;

            el.onclick = () => {
                this.currentCategoryIndex = i;
                this.renderCarousel();
                this.renderPlayerSounds(key);
            };

            container.appendChild(el);

        });

    },

    /* ================= PLAYER UI ================= */

    updatePlayerUI(name, category) {

    const track = document.getElementById("ambientTrack");
    const icon = document.getElementById("ambientIcon");

    if (track) track.textContent = name;

    if (icon && this.currentCategory) {
        icon.textContent = this.categories[this.currentCategory].icon;
    }

},

    /* ================= ICONS ================= */

    renderIcons() {

    const container = document.getElementById("ambientControls");
    if (!container) return;

    container.innerHTML = Object.keys(this.categories)
        .map(key => `
            <button class="ambient-btn" data-category="${key}">
                ${this.categories[key].icon}
            </button>
        `).join("");

    container.querySelectorAll(".ambient-btn").forEach(btn => {

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

    /* ================= PANEL ================= */

    openPanel(categoryKey) {

        this.currentCategory = categoryKey;
        this.currentIndex = 0;

        const panel = document.getElementById("ambientPanelNew");
        const category = this.categories[categoryKey];

        if (!panel) return;

        panel.innerHTML = `
            <div class="ambient-panel-title">${category.label}</div>
            ${category.sounds.map((sound, index) => `
                <div class="ambient-option" data-index="${index}">
                    ${sound.name}
                </div>
            `).join("")}
        `;

        panel.classList.add("show");

        panel.querySelectorAll(".ambient-option").forEach(opt => {

            opt.addEventListener("click", () => {

                const index = parseInt(opt.dataset.index);

                this.currentIndex = index;

                this.play(
                    this.categories[this.currentCategory]
                        .sounds[this.currentIndex].src
                );

            });

        });

    },

    /* ================= PLAY ================= */

    play(src) {

        if (this.currentAudio) {
            this.fadeOut(this.currentAudio);
        }

        const sound = this.categories[this.currentCategory].sounds[this.currentIndex];

        this.updatePlayerUI(
            sound.name,
            this.categories[this.currentCategory].label
        );

        const audio = new Audio(src);

        audio.loop = true;
       const volumeSlider = document.getElementById("ambientVolume");
audio.volume = volumeSlider ? parseFloat(volumeSlider.value) : 0.3;

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

        if (this.currentAudio.paused)
            this.currentAudio.play();
        else
            this.currentAudio.pause();

    },

    /* ================= FADE ================= */

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

    /* ================= PLAYER ================= */

    renderPlayerCategories() {

        const container = document.getElementById("ambientCategories");

        if (!container) return;

        container.innerHTML = Object.keys(this.categories).map((key,i) => {

    const cat = this.categories[key];

    return `
    <div class="ambient-category ${i === this.currentCategoryIndex ? "center" : ""}" data-cat="${key}">
        ${cat.icon}
    </div>
    `;

}).join("");

        container.querySelectorAll(".ambient-category").forEach(btn => {

            btn.addEventListener("mouseenter", () => {

                this.renderPlayerSounds(btn.dataset.cat);

            });

        });

        const keys = Object.keys(this.categories);

this.currentCategory = keys[this.currentCategoryIndex];

    },

    renderPlayerSounds(category) {

        const container = document.getElementById("ambientSounds");

        if (!container) return;

        if (category === "youtube") {

            container.innerHTML = `
            <div class="youtube-search">
                <input id="ytSearchInput" placeholder="Buscar no YouTube">
                <button id="ytSearchBtn">Buscar</button>
            </div>

            <div id="ytResults"></div>
            `;

            document
                .getElementById("ytSearchBtn")
                .onclick = searchYouTube;

            return;

        }

        const sounds = this.categories[category].sounds;

            container.innerHTML = sounds.map((s, i) => `
            <div class="ambient-sound" data-cat="${category}" data-index="${i}">

            <span class="ambient-preview" data-index="${i}">▶</span>

            <span class="ambient-title">${s.name}</span>

            <span class="ambient-fav" data-index="${i}">
${category === "favorites" ? "✖" : "☆"}
</span>

            </div>
                `).join("");

        container.querySelectorAll(".ambient-sound").forEach(row => {

        row.addEventListener("click", (e) => {

        if(e.target.classList.contains("ambient-preview")) return;
        if(e.target.classList.contains("ambient-fav")) return;

        container.querySelectorAll(".ambient-sound")
        .forEach(el => el.classList.remove("active"));

        row.classList.add("active");

        this.currentCategory = row.dataset.cat;
        this.currentIndex = parseInt(row.dataset.index);

        this.play(
            this.categories[this.currentCategory]
                .sounds[this.currentIndex].src
        );

        /* ================= KEYBOARD NAVIGATION ================= */

let rows = Array.from(container.querySelectorAll(".ambient-sound"));
let currentRow = 0;
let focusPart = "row";

if(rows.length){
    rows[0].classList.add("active");
}

document.onkeydown = (e) => {

    if(e.key === "Escape"){
        document.getElementById("ambientPanelNew").classList.remove("open");
        return;
    }

    if(!document.getElementById("ambientPanelNew").classList.contains("open"))
        return;

    if(e.key === "ArrowDown"){
        currentRow = (currentRow + 1) % rows.length;
        focusPart = "row";
    }

    if(e.key === "ArrowUp"){
        currentRow = (currentRow - 1 + rows.length) % rows.length;
        focusPart = "row";
    }

    rows.forEach(r => r.classList.remove("active"));
    rows[currentRow].classList.add("active");

    if(e.key === "ArrowRight"){
        focusPart = "fav";
    }

    if(e.key === "ArrowLeft"){
        focusPart = "preview";
    }

    if(e.key === "Enter"){

        const row = rows[currentRow];

        if(focusPart === "row"){
            this.currentCategory = row.dataset.cat;
            this.currentIndex = parseInt(row.dataset.index);

            this.play(
                this.categories[this.currentCategory]
                .sounds[this.currentIndex].src
            );
        }

        if(focusPart === "preview"){
            row.querySelector(".ambient-preview").click();
        }

        if(focusPart === "fav"){
            row.querySelector(".ambient-fav").click();
        }

    }

};

    });

});

container.querySelectorAll(".ambient-preview").forEach(btn => {

    btn.addEventListener("click", (e) => {

        e.stopPropagation();

        document.querySelectorAll(".ambient-preview")
        .forEach(p => p.classList.remove("preview-active"));

        btn.classList.add("preview-active");

        const index = parseInt(btn.dataset.index);

        const sound = this.categories[category].sounds[index];

        const preview = new Audio(sound.src);

        preview.volume = 0.35;

        preview.play();

        setTimeout(() => {
            preview.pause();
        }, 4000);

    });

});

container.querySelectorAll(".ambient-fav").forEach(btn => {

    btn.addEventListener("click", (e) => {

        e.stopPropagation();

        const row = btn.closest(".ambient-sound");

        const cat = row.dataset.cat;
        const index = parseInt(row.dataset.index);

        const sound = this.categories[cat].sounds[index];

        if(cat === "favorites"){

            this.categories.favorites.sounds =
            this.categories.favorites.sounds.filter(s => s.name !== sound.name);

            row.remove();

            return;

        }

        btn.classList.toggle("fav-active");

        if(btn.classList.contains("fav-active")){

            this.categories.favorites.sounds.push(sound);

        }else{

            this.categories.favorites.sounds =
            this.categories.favorites.sounds.filter(s => s.name !== sound.name);

        }

    });

});

    },

    bindKeyboard(){

document.addEventListener("keydown",(e)=>{

const panel = document.getElementById("ambientPanelNew");
const keys = Object.keys(this.categories);

/* navegar categorias */

if(e.key === "ArrowRight"){

this.currentCategoryIndex =
(this.currentCategoryIndex + 1) % keys.length;

this.renderCarousel();

return;

}

if(e.key === "ArrowLeft"){

this.currentCategoryIndex =
(this.currentCategoryIndex - 1 + keys.length) % keys.length;

this.renderCarousel();

return;

}

/* entrar nas músicas */

if(e.key === "ArrowDown"){

if(!panel.classList.contains("open")){

const category = keys[this.currentCategoryIndex];

this.renderPlayerSounds(category);

panel.classList.add("open");

/* selecionar primeira música automaticamente */

setTimeout(()=>{

const first = document.querySelector(".ambient-sound");

if(first){
first.classList.add("active");
}

},50);

return;

}

}

/* voltar para categorias */

if(e.key === "ArrowUp"){

const active = document.querySelector(".ambient-sound.active");

if(active){

active.classList.remove("active");

panel.classList.remove("open");

return;

}

}

});

},

    bindPlayer() {

        const main = document.getElementById("ambientMain");
        const panel = document.getElementById("ambientPanelNew");

        if (!main || !panel) return;

        main.addEventListener("click", () => {

            panel.classList.toggle("open");

        });

    },

    bindOutsideClick() {

        document.addEventListener("click", (e) => {

            const player = document.getElementById("ambientPlayer");
            const panel = document.getElementById("ambientPanelNew");

            if (!player.contains(e.target)) {
                panel.classList.remove("open");
            }

        });

    }

};

/* =====================================================
   YOUTUBE
===================================================== */

async function searchYouTube() {

    const query = document.getElementById("ytSearchInput").value;

    const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search
        ?part=snippet
        &type=video
        &maxResults=10
        &q=${encodeURIComponent(query)}
        &key=YOUR_API_KEY`
    );

    const data = await res.json();

    const results = document.getElementById("ytResults");

    results.innerHTML = data.items.map(v => `

    <div class="youtube-item"
    onclick="playYouTube('${v.id.videoId}')">

        <img src="${v.snippet.thumbnails.medium.url}">
        <div>${v.snippet.title}</div>

    </div>

    `).join("");

}

let ytPlayer;

function onYouTubeIframeAPIReady(){

    ytPlayer = new YT.Player('youtubePlayer',{
        height:'0',
        width:'0',
        videoId:'',
        playerVars:{
            autoplay:1,
            controls:0,
            modestbranding:1,
            rel:0
        }
    });

}

function playYouTube(id){

    if(!ytPlayer) return;

    if(AmbientEngine.currentAudio){
        AmbientEngine.fadeOut(AmbientEngine.currentAudio);
    }

    ytPlayer.loadVideoById(id);

}

/* =====================================================
   INIT
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    AmbientEngine.init();

});

const Ambient = AmbientEngine;