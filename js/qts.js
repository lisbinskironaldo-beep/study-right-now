const QTS = {

    maxTotalRows: 20,
    maxIntervals: 5,

    data: JSON.parse(localStorage.getItem("qts_core_v6")) || {
        showTimeColumn: false,
        structure: Array.from({ length: 6 }, () => ({ type: "row" })),
        grid: {}
    },

    days: [
        "Domingo","Segunda","Terça",
        "Quarta","Quinta","Sexta","Sábado"
    ],

    init() {
        this.normalize();
        this.render();
    },

    normalize() {

        if (!Array.isArray(this.data.structure))
            this.data.structure = [];

        if (this.data.structure.length === 0)
            this.data.structure =
                Array.from({ length: 6 }, () => ({ type: "row" }));

        if (this.data.structure.length > this.maxTotalRows)
            this.data.structure =
                this.data.structure.slice(0, this.maxTotalRows);

        this.save();
    },

    render() {

        const container =
            document.getElementById("qtsModule");

        container.innerHTML = `
            <h2 style="text-align:center;margin-bottom:20px;">
                Quadro Horário
            </h2>

            <div style="text-align:center;margin-bottom:15px;">
                <label>
                    <input type="checkbox" id="toggleTimeCol"
                    ${this.data.showTimeColumn ? "checked":""}>
                    HORÁRIO
                </label>
            </div>

            <div id="qtsGrid"></div>

            <div class="qts-controls">
                <div class="row-control">
                    <button id="removeRowBtn" class="row-btn left">−</button>
                    <div class="row-label">Linhas</div>
                    <button id="addRowBtn" class="row-btn right">+</button>
                <div class="row-control">
    <button id="removeIntervalBtn" class="row-btn left">−</button>
    <div class="row-label">Intervalos</div>
    <button id="addIntervalBtn" class="row-btn right">+</button>
</div>
        `;

        this.bindControls();
        this.buildGrid();
    },

    bindControls() {

        const printBtn = document.getElementById("printQtsBtn");

if (printBtn) {
    printBtn.onclick = () => {

        const printContent =
            document.getElementById("qtsGrid").outerHTML;

        const win = window.open("", "", "width=900,height=700");

        win.document.write(`
            <html>
            <head>
                <title>Quadro Horário</title>
                <style>
                    body { font-family: sans-serif; padding: 20px; }
                    #qtsGrid {
                        display: grid;
                        gap: 4px;
                    }
                    #qtsGrid > div {
                        border: 1px solid #ccc;
                        padding: 8px;
                        text-align: center;
                        min-height: 35px;
                    }
                </style>
            </head>
            <body>
                <h2>Quadro Horário</h2>
                ${printContent}
            </body>
            </html>
        `);

        win.document.close();
        win.focus();
        win.print();
    };
}

        document.getElementById("toggleTimeCol").onchange = (e) => {
            this.data.showTimeColumn = e.target.checked;
            this.save();
            this.render();
        };

        document.getElementById("addRowBtn").onclick = () => {

            if (this.data.structure.length >= this.maxTotalRows)
                return;

            this.data.structure.push({ type: "row" });
            this.save();
            this.render();
        };

        document.getElementById("removeRowBtn").onclick = () => {

            const lastRowIndex =
                [...this.data.structure]
                    .map((x,i)=>x.type==="row"?i:null)
                    .filter(x=>x!==null)
                    .pop();

            if (lastRowIndex === undefined) return;

            this.data.structure.splice(lastRowIndex,1);

            this.save();
            this.render();
        };

        // ADICIONAR INTERVALO
document.getElementById("addIntervalBtn").onclick = () => {

    const totalIntervals =
        this.data.structure
            .filter(x=>x.type==="interval")
            .length;

    if (totalIntervals >= this.maxIntervals)
        return;

    if (this.data.structure.length >= this.maxTotalRows)
        return;

    this.data.structure.push({ type:"interval" });

    this.save();
    this.render();
};

// REMOVER INTERVALO
document.getElementById("removeIntervalBtn").onclick = () => {

    const lastIntervalIndex =
        [...this.data.structure]
            .map((x,i)=>x.type==="interval"?i:null)
            .filter(x=>x!==null)
            .pop();

    if (lastIntervalIndex === undefined) return;

    this.data.structure.splice(lastIntervalIndex,1);

    this.save();
    this.render();
};
    },

    buildGrid() {

        const grid =
            document.getElementById("qtsGrid");

        grid.innerHTML = "";

        const columns =
            (this.data.showTimeColumn ? 1 : 0)
            + this.days.length;

        grid.style.display = "grid";
        grid.style.gridTemplateColumns =
            `repeat(${columns}, 1fr)`;

        if (this.data.showTimeColumn)
            grid.appendChild(this.createHeader("HORÁRIO"));

        this.days.forEach(d =>
            grid.appendChild(this.createHeader(d))
        );

        this.data.structure.forEach((item, index) => {

            if (item.type === "interval") {
                grid.appendChild(
                    this.createIntervalRow(columns, index)
                );
                return;
            }

            const rowIndex = index;

            if (this.data.showTimeColumn)
                grid.appendChild(
                    this.createTimeCell(rowIndex)
                );

            this.days.forEach(day =>
                grid.appendChild(
                    this.createEditableCell(rowIndex, day)
                )
            );
        });
    },

    createHeader(text) {
        const cell = document.createElement("div");
        cell.textContent = text;
        cell.classList.add("qts-header");
        return cell;
    },

    createIntervalRow(columns, index) {

        const cell = document.createElement("div");

        cell.textContent = "INTERVALO";
        cell.style.gridColumn = `span ${columns}`;
        cell.classList.add("qts-interval");
        cell.draggable = true;

        cell.ondragstart = (e) => {
            e.dataTransfer.setData("intervalIndex", index);
        };

        cell.ondragover = (e) => e.preventDefault();

        cell.ondrop = (e) => {
            e.preventDefault();

            const from =
                Number(e.dataTransfer.getData("intervalIndex"));

            if (isNaN(from)) return;

            const item =
                this.data.structure[from];

            this.data.structure.splice(from,1);
            this.data.structure.splice(index,0,item);

            this.save();
            this.render();
        };

        return cell;
    },

    createTimeCell(row) {

        const cell =
            document.createElement("div");

        cell.contentEditable = true;
        cell.classList.add("qts-time");

        if (this.data.grid[row]?._time)
            cell.textContent =
                this.data.grid[row]._time;

        cell.onblur = () => {
            this.data.grid[row] =
                this.data.grid[row] || {};
            this.data.grid[row]._time =
                cell.textContent;
            this.save();
        };

        return cell;
    },

    createEditableCell(row, day) {

        const cell =
            document.createElement("div");

        cell.contentEditable = true;

        if (this.data.grid[row]?.[day])
            cell.textContent =
                this.data.grid[row][day];

        cell.onblur = () => {
            this.data.grid[row] =
                this.data.grid[row] || {};
            this.data.grid[row][day] =
                cell.textContent;
            this.save();
        };

        return cell;
    },

    save() {
        localStorage.setItem(
            "qts_core_v6",
            JSON.stringify(this.data)
        );
    }
};

document.addEventListener("DOMContentLoaded", () => {
    QTS.init();
});