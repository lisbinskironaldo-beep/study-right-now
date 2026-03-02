/* =====================================================
   ALARM MODULE — PADRÃO CORE (ESTÁVEL)
   - Inline edit
   - Sem popup
   - Nome padrão "Alarme 01"
   - Digitação 1234 → 12:34
   - Enter salva
   - Persistência
===================================================== */

const Alarm = {

    data: JSON.parse(localStorage.getItem("alarms_core_v1")) || [],

    init() {
        this.ensureFirstAlarm();
        this.render();
    },

    ensureFirstAlarm() {
        if (this.data.length === 0) {
            this.data.push(this.createAlarm(1));
            this.save();
        }
    },

    createAlarm(number) {
        return {
            id: Date.now() + Math.random(),
            name: `Alarme ${String(number).padStart(2, "0")}`,
            hour: "07",
            minute: "00",
            days: ["seg","ter","qua","qui","sex"],
            active: false,
            editing: true
        };
    },

    render() {

        const container = document.getElementById("alarmModule");

        container.innerHTML = `
            <h2 style="text-align:center;margin-bottom:30px;">Alarmes</h2>
            <div id="alarmList"></div>
            <div style="margin-top:25px;">
                <button id="addAlarmBtn">+ Novo</button>
            </div>
        `;

        document.getElementById("addAlarmBtn")
            .addEventListener("click", () => {
                const next = this.data.length + 1;
                this.data.push(this.createAlarm(next));
                this.save();
                this.render();
            });

        const list = document.getElementById("alarmList");

        this.data.forEach((alarm, index) => {
            list.appendChild(this.buildRow(alarm, index));
        });
    },

    buildRow(alarm, index) {

        const row = document.createElement("div");
        row.className = "alarm-row";
        row.style.marginBottom = "25px";

        if (alarm.editing) {

            row.innerHTML = `
                <input class="alarm-name" value="${alarm.name}" />
                <input class="alarm-time" value="${alarm.hour}${alarm.minute}" maxlength="4" />
                <div class="alarm-days"></div>
            `;

            const nameInput = row.querySelector(".alarm-name");
            const timeInput = row.querySelector(".alarm-time");
            const daysContainer = row.querySelector(".alarm-days");

            nameInput.select();

            // Dias
            const days = ["dom","seg","ter","qua","qui","sex","sab"];

            days.forEach(day => {

                const chip = document.createElement("span");
                chip.textContent = day.toUpperCase();
                chip.className = "day-chip";

                if (alarm.days.includes(day)) {
                    chip.classList.add("active-day");
                }

                chip.onclick = () => {
                    chip.classList.toggle("active-day");
                };

                daysContainer.appendChild(chip);
            });

            // Hora input
            timeInput.addEventListener("input", (e) => {
                let value = e.target.value.replace(/\D/g,"");
                if (value.length > 4) value = value.slice(0,4);
                e.target.value = value;
            });

            row.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    this.saveEdit(index, row);
                }
            });

        } else {

            row.innerHTML = `
                <div style="font-size:22px;font-weight:600;">
                    ${alarm.hour}:${alarm.minute}
                </div>
                <div>${alarm.name}</div>
                <div style="margin-top:6px;font-size:13px;opacity:0.6;">
                    ${alarm.days.join(", ")}
                </div>
                <div style="margin-top:10px;">
                    <button data-edit="${index}">Editar</button>
                </div>
            `;

            row.querySelector("button").onclick = () => {
                this.data[index].editing = true;
                this.render();
            };
        }

        return row;
    },

    saveEdit(index, row) {

        const name = row.querySelector(".alarm-name").value;

        const timeRaw =
            row.querySelector(".alarm-time").value.padStart(4,"0");

        const hour = timeRaw.slice(0,2);
        const minute = timeRaw.slice(2,4);

        const selectedDays = [];

        row.querySelectorAll(".day-chip.active-day")
            .forEach(chip => selectedDays.push(chip.textContent.toLowerCase()));

        this.data[index] = {
            ...this.data[index],
            name,
            hour,
            minute,
            days: selectedDays.length ? selectedDays : ["seg"],
            active: true,
            editing: false
        };

        this.save();
        this.render();
    },

    save() {
        localStorage.setItem("alarms_core_v1", JSON.stringify(this.data));
    }
};


/* =====================================================
   INIT
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
    Alarm.init();
});