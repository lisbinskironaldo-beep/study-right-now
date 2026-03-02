/* =====================================================
   CALENDAR MODULE — PADRÃO CORE (PROFISSIONAL INLINE)
   - Dias da semana abreviados
   - Domingo vermelho pastel
   - Sábado azul pastel
   - Hoje verde pastel
   - Dia com lembrete circulado estilo caneta
   - Mês e ano clicáveis
   - Editor inline abaixo da linha
   - Enter salva
   - Persistente
===================================================== */

const Calendar = {

    data: JSON.parse(localStorage.getItem("calendar_core_v1")) || {},

    currentDate: new Date(),

    init() {
        this.render();
    },

    render() {

        const container = document.getElementById("calendarModule");
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        const monthName = this.currentDate.toLocaleString("pt-BR", { month: "long" });

        container.innerHTML = `
            <div class="calendar-header">
                <span id="monthSelect" class="calendar-select">${this.capitalize(monthName)}</span>
                <span id="yearSelect" class="calendar-select">${year}</span>
            </div>
            <div class="calendar-weekdays">
                ${["DOM","SEG","TER","QUA","QUI","SEX","SAB"]
                    .map((d,i) => `<div class="weekday ${i===0?"sun":""} ${i===6?"sat":""}">${d}</div>`)
                    .join("")}
            </div>
            <div class="calendar-grid" id="calendarGrid"></div>
        `;

        document.getElementById("monthSelect")
            .onclick = () => this.changeMonth();

        document.getElementById("yearSelect")
            .onclick = () => this.changeYear();

        this.buildDays(year, month);
    },

    buildDays(year, month) {

        const grid = document.getElementById("calendarGrid");
        grid.innerHTML = "";

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();

        for (let i = 0; i < firstDay; i++) {
            grid.appendChild(document.createElement("div"));
        }

        for (let day = 1; day <= daysInMonth; day++) {

            const cell = document.createElement("div");
            cell.className = "calendar-day";
            cell.textContent = day;

            const key = `${year}-${month}-${day}`;

            if (this.data[key]) {
                cell.classList.add("has-event");
            }

            if (
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear()
            ) {
                cell.classList.add("today");
            }

            const weekday = new Date(year, month, day).getDay();
            if (weekday === 0) cell.classList.add("sun");
            if (weekday === 6) cell.classList.add("sat");

            cell.onclick = () => this.openInlineEditor(cell, key);

            grid.appendChild(cell);
        }
    },

    openInlineEditor(cell, key) {

        if (cell.querySelector(".inline-editor")) return;

        const editor = document.createElement("div");
        editor.className = "inline-editor";

        editor.innerHTML = `
            <input class="event-title" value="LEMBRAR" />
            <input class="event-time" maxlength="4" placeholder="HHMM" />
            <button class="pre-alarm-btn">Pré alarme</button>
            <input class="pre-alarm-input" style="display:none;" placeholder="Minutos antes" />
        `;

        cell.appendChild(editor);

        const timeInput = editor.querySelector(".event-time");
        const preBtn = editor.querySelector(".pre-alarm-btn");
        const preInput = editor.querySelector(".pre-alarm-input");

        timeInput.addEventListener("input", (e) => {
            let v = e.target.value.replace(/\D/g,"");
            if (v.length > 4) v = v.slice(0,4);
            e.target.value = v;
        });

        preBtn.onclick = () => {
            preInput.style.display = "inline-block";
        };

        editor.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                this.saveEvent(key, editor);
                this.render();
            }
        });
    },

    saveEvent(key, editor) {

        const title = editor.querySelector(".event-title").value;
        const timeRaw = editor.querySelector(".event-time").value.padStart(4,"0");
        const pre = editor.querySelector(".pre-alarm-input").value || "00";

        this.data[key] = {
            title,
            hour: timeRaw.slice(0,2),
            minute: timeRaw.slice(2,4),
            pre
        };

        this.save();
    },

    changeMonth() {
        const m = prompt("Digite mês (1-12):");
        if (!m) return;
        this.currentDate.setMonth(Number(m)-1);
        this.render();
    },

    changeYear() {
        const y = prompt("Digite ano:");
        if (!y) return;
        this.currentDate.setFullYear(Number(y));
        this.render();
    },

    save() {
        localStorage.setItem("calendar_core_v1", JSON.stringify(this.data));
    },

    capitalize(text) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }
};


/* =====================================================
   INIT
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
    Calendar.init();
});