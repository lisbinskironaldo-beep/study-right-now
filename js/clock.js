/* =====================================================
   CLOCK MODULE — PADRÃO CORE
===================================================== */

const Clock = {

    interval: null,
    currentTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,

    init() {
        this.buildTimeZoneSelector();
        this.startWorldCarousel();
    },

    start() {
        this.update();
        clearInterval(this.interval);
        this.interval = setInterval(() => this.update(), 1000);
    },

    update() {

        if (Core.state.mode !== "clock") return;

        const now = new Date();

        const time = new Intl.DateTimeFormat("pt-BR", {
            timeZone: this.currentTimeZone,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        }).format(now);

        const date = new Intl.DateTimeFormat("pt-BR", {
            timeZone: this.currentTimeZone,
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric"
        }).format(now);

        document.getElementById("timeDisplay").textContent = time;
        document.getElementById("dateDisplay").textContent =
            this.capitalize(date);
    },

    buildTimeZoneSelector() {

    const select = document.getElementById("timezoneSelector");
    select.innerHTML = "";

    const zones = [
        // 🇧🇷 Brasil
        { tz: "America/Sao_Paulo", label: "🇧🇷 Brasília (Oficial)" },
        { tz: "America/Sao_Paulo", label: "🇧🇷 São Paulo" },
        { tz: "America/Manaus", label: "🇧🇷 Amazonas" },
        { tz: "America/Rio_Branco", label: "🇧🇷 Acre" },
        { tz: "America/Noronha", label: "🇧🇷 Fernando de Noronha" },

        // 🌎 Principais países
        { tz: "America/New_York", label: "🇺🇸 Estados Unidos (NY)" },
        { tz: "Europe/London", label: "🇬🇧 Reino Unido" },
        { tz: "Europe/Paris", label: "🇫🇷 França" },
        { tz: "Europe/Berlin", label: "🇩🇪 Alemanha" },
        { tz: "Asia/Tokyo", label: "🇯🇵 Japão" },
        { tz: "Australia/Sydney", label: "🇦🇺 Austrália" }
    ];

    zones.forEach(zone => {

        const option = document.createElement("option");
        option.value = zone.tz;
        option.textContent = zone.label;
        select.appendChild(option);
    });

    // padrão Brasil oficial
    select.value = "America/Sao_Paulo";
    this.currentTimeZone = "America/Sao_Paulo";

    select.addEventListener("change", (e) => {
        this.currentTimeZone = e.target.value;
        this.update();
    });
},
    formatLabel(tz) {

        const city = tz.split("/").pop().replaceAll("_", " ");
        const region = tz.split("/")[0];

        const flag = this.countryCodeToFlag(this.mapRegion(region));

        return `${flag} ${city}`;
    },

    mapRegion(region) {

        const map = {
            America: "US",
            Europe: "GB",
            Asia: "JP",
            Australia: "AU",
            Africa: "ZA",
            Pacific: "NZ"
        };

        return map[region] || "US";
    },

    countryCodeToFlag(code) {
        return code
            .toUpperCase()
            .replace(/./g, char =>
                String.fromCodePoint(127397 + char.charCodeAt())
            );
    },

    capitalize(text) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    },

    /* =====================================================
       WORLD CAROUSEL
    ===================================================== */

    worldZones: [
        "America/New_York",
        "Europe/London",
        "Europe/Paris",
        "Asia/Tokyo",
        "Australia/Sydney",
        "America/Sao_Paulo"
    ],

    worldIndex: 0,

    startWorldCarousel() {
        this.updateWorld();
        setInterval(() => this.updateWorld(), 5000);
    },

    updateWorld() {

        const tz = this.worldZones[this.worldIndex];

        const now = new Date();

        const time = new Intl.DateTimeFormat("pt-BR", {
            timeZone: tz,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        }).format(now);

        const city = tz.split("/").pop().replaceAll("_", " ");
        const region = tz.split("/")[0];

        const flag = this.countryCodeToFlag(this.mapRegion(region));

        document.getElementById("worldCarousel").textContent =
            `${flag} ${city} — ${time}`;

        this.worldIndex++;
        if (this.worldIndex >= this.worldZones.length) {
            this.worldIndex = 0;
        }
    }
};


/* =====================================================
   INIT CLOCK
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
    Clock.init();
});

/* ================= MINI ANALOG CLOCK ================= */

const MiniAnalogClock = {

    interval: null,

    init() {
        this.start();
    },

    start() {
        this.update();
        clearInterval(this.interval);
        this.interval = setInterval(() => this.update(), 1000);
    },

    update() {

        const bodyMode =
            document.body.getAttribute("data-mode");

        const clockEl =
            document.getElementById("miniAnalogClock");

        if (!clockEl) return;

        if (bodyMode === "clock") {
            clockEl.style.display = "none";
            return;
        } else {
            clockEl.style.display = "block";
        }

        const now = new Date();

        const hours = now.getHours() % 12;
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        const hourDeg =
            (hours * 30) +
            (minutes * 0.5);

        const minuteDeg =
            minutes * 6;

        const secondDeg =
            seconds * 6;

        clockEl.querySelector(".hour")
            .style.transform =
            `translateX(-50%) rotate(${hourDeg}deg)`;

        clockEl.querySelector(".minute")
            .style.transform =
            `translateX(-50%) rotate(${minuteDeg}deg)`;

        clockEl.querySelector(".second")
            .style.transform =
            `translateX(-50%) rotate(${secondDeg}deg)`;
    }
};

document.addEventListener("DOMContentLoaded", () => {
    MiniAnalogClock.init();
});