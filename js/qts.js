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

        document.querySelectorAll(".qts-now").forEach(el=>el.classList.remove("qts-now"));

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

        this.highlightCurrentTime();
    },

    createHeader(text) {
        const cell = document.createElement("div");
        cell.textContent = text;
        cell.classList.add("qts-header");
        return cell;
    },

    createIntervalRow(columns, index) {

        const cell = document.createElement("div");
        cell.contentEditable = true;
        cell.tabIndex = 0;
cell.dataset.row = index;
cell.dataset.col = -1;

        const value = this.data.structure[index].duration || "Intervalo";

cell.innerHTML = `<span class="qts-interval-label">${value}</span>`;

cell.addEventListener("click",(e)=>{

// se foi arraste, ignora clique
if(cell._dragging) return

e.stopPropagation()

this.openIntervalPicker(cell, index)

})

        cell.style.gridColumn = `span ${columns}`;
        cell.classList.add("qts-interval");

        cell.onblur = () => {
    this.data.structure[index].duration = cell.textContent;
    this.save();
};


cell.addEventListener("keydown",(e)=>{

if(e.key==="Enter" && !e.shiftKey){
e.preventDefault()
cell.blur()
return
}

// DIREITA = TAB
if(e.key==="ArrowRight"){
e.preventDefault()

const all = [...document.querySelectorAll('#qtsGrid div[contenteditable="true"]')]
const index = all.indexOf(cell)

const next = all[index + 1]

if(next) next.focus()
}

// ESQUERDA = SHIFT+TAB
if(e.key==="ArrowLeft"){
e.preventDefault()

const all = [...document.querySelectorAll('#qtsGrid div[data-col]')]

const prev = all[index - 1]

if(prev) prev.focus()
}

// BAIXO
if(e.key==="ArrowDown"){
e.preventDefault()

let r = parseInt(cell.dataset.row)
const c = parseInt(cell.dataset.col)

let next = null

while(!next){

r++

if(r > 50) break

const test = document.querySelector(
`#qtsGrid div[data-row="${r}"][data-col="${c}"]`
)

if(test){
next = test
break
}

}

if(next) next.focus()
}

// CIMA
if(e.key==="ArrowUp"){
e.preventDefault()

let r = parseInt(cell.dataset.row)
const c = parseInt(cell.dataset.col)

let prev = null

while(!prev){

r--

if(r < 0) break

const test = document.querySelector(
`#qtsGrid div[data-row="${r}"][data-col="${c}"]`
)

if(test){
prev = test
break
}

}

if(prev) prev.focus()
}

e.stopPropagation()

})
        return cell;
    },

    createTimeCell(row) {

        const cell =
            document.createElement("div");

        cell.contentEditable = true;
        cell.dataset.row = row;
cell.dataset.col = -1;
        cell.tabIndex = 0;

cell.addEventListener("keydown",(e)=>{

if(e.key==="Enter" && !e.shiftKey){
e.preventDefault()
cell.blur()
return
}

// DIREITA (vai para primeira célula da linha)
if(e.key==="ArrowRight"){
e.preventDefault()

const next = document.querySelector(
`#qtsGrid div[data-row="${row}"][data-col="0"]`
)

if(next){
next.focus()
return
}
}

// ESQUERDA (não faz nada — evita travar)
if(e.key==="ArrowLeft"){
e.preventDefault()
return
}

// BAIXO
if(e.key==="ArrowDown"){
e.preventDefault()

const next = document.querySelector(
`#qtsGrid div[data-row="${row+1}"][data-col="0"]`
)

if(next) next.focus()
}

// CIMA
if(e.key==="ArrowUp"){
e.preventDefault()

const prev = document.querySelector(
`#qtsGrid div[data-row="${row-1}"][data-col="0"]`
)

if(prev) prev.focus()
}

e.stopPropagation()

})
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
        
cell.dataset.navIndex = 
document.querySelectorAll('#qtsGrid div[contenteditable="true"]').length;
cell.tabIndex = 0;
cell.dataset.row = row;
cell.dataset.col = this.days.indexOf(day);

cell.addEventListener("keydown",(e)=>{

// ENTER = salva (blur)
if(e.key==="Enter" && !e.shiftKey){
e.preventDefault()
cell.blur()
return
}

// SHIFT+ENTER = quebra de linha
if(e.key==="Enter" && e.shiftKey){
return
}

// SETAS só funcionam se NÃO estiver editando texto
const sel = window.getSelection()
const isEditing = sel && sel.anchorOffset !== cell.textContent.length

if(isEditing) return

// DIREITA
if(e.key==="ArrowRight"){
e.preventDefault()
if(cell.nextElementSibling){
cell.nextElementSibling.focus()
}
}

// ESQUERDA
if(e.key==="ArrowLeft"){
e.preventDefault()
if(cell.previousElementSibling){
cell.previousElementSibling.focus()
}
}

// BAIXO
if(e.key==="ArrowDown"){
e.preventDefault()

const r = parseInt(cell.dataset.row)
const c = parseInt(cell.dataset.col)

const next = document.querySelector(
`#qtsGrid div[data-row="${r+1}"][data-col="${c}"]`
)

if(next) next.focus()
}

// CIMA
if(e.key==="ArrowUp"){
e.preventDefault()

const r = parseInt(cell.dataset.row)
const c = parseInt(cell.dataset.col)

const prev = document.querySelector(
`#qtsGrid div[data-row="${r-1}"][data-col="${c}"]`
)

if(prev) prev.focus()
}

// bloquear sistema global
e.stopPropagation()

})

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
    
   highlightCurrentTime(){

if(!this.data.showTimeColumn) return

const times = document.querySelectorAll(".qts-time")
if(!times.length) return

document.querySelectorAll(".qts-now").forEach(el=>el.classList.remove("qts-now"));

const now = new Date()
const currentMinutes = now.getHours()*60 + now.getMinutes()

times.forEach((cell)=>{

const text = cell.textContent.trim()
if(!text) return

const parts = text.replace("h",":").split(":")
const h = parseInt(parts[0])
const m = parseInt(parts[1]) || 0

if(isNaN(h)) return

const minutes = h*60 + m

if(currentMinutes >= minutes){

let el = cell

while(el && !el.classList.contains("qts-header")){

el.classList.add("qts-now")
el = el.nextElementSibling

}

}

})

setTimeout(()=>this.highlightCurrentTime(), 60000);

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