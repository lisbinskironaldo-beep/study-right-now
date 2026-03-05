/* =====================================================
   STATS CORE 2.0 — SISTEMA PROFISSIONAL
===================================================== */

const Stats = {

    goal: 4,
    weeklyGoalHours: 10,
    xpPerMinute: 2,

    achievementsList: [
    { id: "first_pomodoro", label: "🔥 Primeiro Pomodoro", check: d => d.pomodorosToday >= 1 },
    { id: "ten_pomodoros", label: "💪 10 Pomodoros", check: d => d.totalXP >= 250 },
    { id: "five_hours", label: "🧠 5 Horas Estudadas", check: d => d.totalXP >= 600 },
    { id: "streak7", label: "⚡ 7 Dias de Streak", check: d => d.streak >= 7 },
    { id: "level5", label: "🏆 Nível 5", check: d => d.level >= 5 }
],

    data: JSON.parse(localStorage.getItem("study_stats_v2")) || {
        days: {}, // yyyy-m-d : { seconds, pomodoros }
        streak: 0,
        totalXP: 0,
        level: 1,

        unlocked: [],
    },

    getTodayKey() {
        const d = new Date();
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    },

    ensureToday() {
        const key = this.getTodayKey();
        if (!this.data.days[key]) {
            this.data.days[key] = {
                seconds: 0,
                pomodoros: 0
            };
        }
        return key;
    },

    addStudySeconds(seconds) {
        const key = this.ensureToday();
        this.data.days[key].seconds += seconds;
        this.save();

        const minutes = seconds / 60;
        this.data.totalXP += minutes * this.xpPerMinute;
        this.updateLevel();
    },

    addPomodoro() {
        const key = this.ensureToday();
        this.data.days[key].pomodoros++;
        this.save();
    },

    getTodayData() {
        const key = this.getTodayKey();
        return this.data.days[key] || { seconds: 0, pomodoros: 0 };
    },

    render() {

        const container = document.getElementById("studyStats");
        if (!container) return;

        const today = this.getTodayData();

        const hours = Math.floor(today.seconds / 3600);
        const minutes = Math.floor((today.seconds % 3600) / 60);

        const formatted =
            `${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}`;

        container.innerHTML = `
            <div class="study-stat-item">
                <div class="study-stat-value">${formatted}</div>
                <div class="study-stat-label">Hoje</div>
            </div>
            <div class="study-stat-item">
                <div class="study-stat-value">${today.pomodoros}</div>
                <div class="study-stat-label">Pomodoros</div>
            </div>
        `;

        this.renderGoal();
        this.renderWeeklyChart();
        this.renderSessionLog();
        this.renderAdvancedStats();
        this.renderWeeklyGoal();
        this.renderLevel();
        this.renderStreakVisual();
        this.renderAchievements();
    },

    renderGoal() {

        const container = document.getElementById("dailyGoal");
        if (!container) return;

        const today = this.getTodayData();

        const percent =
            Math.min((today.pomodoros / this.goal) * 100, 100);

        container.innerHTML = `
            <div class="goal-bar">
                <div class="goal-progress" style="width:${percent}%"></div>
            </div>
            <div class="goal-text">
                🎯 ${today.pomodoros} / ${this.goal} ciclos
            </div>
        `;
    },

    renderWeeklyChart() {

    const container = document.getElementById("weeklyChart");
    if (!container) return;

    const today = new Date();
    const week = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);

        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

        week.push({
            date: d,
            seconds: this.data.days[key]?.seconds || 0
        });
    }

    const getIntensity = (seconds) => {

        if (seconds === 0) return 0;
        if (seconds < 30 * 60) return 1;      // <30min
        if (seconds < 90 * 60) return 2;      // <1h30
        if (seconds < 3 * 3600) return 3;     // <3h
        return 4;                              // 3h+
    };

    container.innerHTML = `
        <div class="heatmap">
            ${week.map(d => `
                <div class="heat-cell intensity-${getIntensity(d.seconds)}"
                     title="${Math.floor(d.seconds / 60)} min">
                </div>
            `).join("")}
        </div>
    `;
},


logSession(type, seconds) {

    if (!this.data.sessions) {
        this.data.sessions = [];
    }

    this.data.sessions.unshift({
        date: new Date().toLocaleString("pt-BR"),
        type,
        seconds
    });

    if (this.data.sessions.length > 20) {
        this.data.sessions.pop();
    }

    this.save();
},

renderSessionLog() {

    const container = document.getElementById("sessionLog");
    if (!container) return;

    const sessions = this.data.sessions || [];

    container.innerHTML = `
        
        ${sessions.map(s => {

            const min = Math.floor(s.seconds / 60);

            return `
                <div class="log-item">
                    <div>${s.type}</div>
                    <div>${min} min</div>
                </div>
            `;

        }).join("")}
    `;
},

renderAdvancedStats() {

    const container =
        document.getElementById("advancedStats");
    if (!container) return;

    const days =
        Object.values(this.data.days);

    if (days.length === 0) {
        container.innerHTML = "";
        return;
    }

    const totalSeconds =
        days.reduce((sum, d) =>
            sum + (d.seconds || 0), 0);

    const avgMinutes =
        Math.floor(
            (totalSeconds / days.length) / 60
        );

    const bestDay =
        Math.max(...days.map(d =>
            d.seconds || 0
        ));

    const bestMinutes =
        Math.floor(bestDay / 60);

    container.innerHTML = `
        <div class="adv-title">
            📊 Resumo Inteligente
        </div>
        <div class="adv-row">
            Média diária: ${avgMinutes} min
        </div>
        <div class="adv-row">
            Melhor dia: ${bestMinutes} min
        </div>
    `;
},

renderWeeklyGoal() {

    const container =
        document.getElementById("weeklyGoal");
    if (!container) return;

    const days =
        Object.values(this.data.days);

    const totalSeconds =
        days.reduce((sum, d) =>
            sum + (d.seconds || 0), 0);

    const totalHours =
        totalSeconds / 3600;

    const percent =
        Math.min(
            (totalHours / this.weeklyGoalHours) * 100,
            100
        );

    container.innerHTML = `
        <div class="wg-title">
            🎯 Meta semanal
        </div>
        <div class="wg-bar">
            <div class="wg-progress"
                style="width:${percent}%">
            </div>
        </div>
        <div class="wg-text">
            ${totalHours.toFixed(1)}h /
            ${this.weeklyGoalHours}h
        </div>
    `;
},

updateLevel() {

    let leveledUp = false;

    let xpToNext = this.data.level * 100;

    while (this.data.totalXP >= xpToNext) {

        this.data.totalXP -= xpToNext;
        this.data.level++;
        leveledUp = true;

        xpToNext = this.data.level * 100;
    }

    if (leveledUp) {
        this.triggerLevelUpEffect();
    }

    this.save();
},

triggerLevelUpEffect() {

    const el = document.getElementById("levelSystem");
    if (!el) return;

    el.classList.add("level-up");

    setTimeout(() => {
        el.classList.remove("level-up");
    }, 1200);
},

renderLevel() {

    const container = document.getElementById("levelSystem");
    if (!container) return;

    const level = this.data.level;
    const xp = this.data.totalXP;
    const xpToNext = level * 100;

    const percent = Math.min((xp / xpToNext) * 100, 100);

    container.innerHTML = `
        <div class="level-title">
            🏆 Nível ${level}
        </div>
        <div class="level-bar">
            <div class="level-progress"
                style="width:${percent}%">
            </div>
        </div>
        <div class="level-text">
            ${Math.floor(xp)} / ${xpToNext} XP
        </div>
    `;
},

checkAchievements() {

    this.achievementsList.forEach(a => {

        if (
            a.check(this.data) &&
            !this.data.unlocked.includes(a.id)
        ) {
            this.data.unlocked.push(a.id);
        }
    });
},

renderAchievements() {

    const container =
        document.getElementById("achievements");
    if (!container) return;

    this.checkAchievements();

    const unlockedList = this.data.unlocked || [];

    if (unlockedList.length === 0) {
        container.innerHTML = "";
        return;
    }

    container.innerHTML =
        `<div class="ach-title">🏅 Conquistas</div>`;

    this.achievementsList.forEach(a => {

        const unlocked =
            unlockedList.includes(a.id);

        const badge =
            document.createElement("div");

        badge.className =
            "badge" +
            (unlocked ? " unlocked" : "");

        badge.textContent = a.label;

        container.appendChild(badge);
    });
},

renderStreakVisual() {

    const container = document.getElementById("streakVisual");
    if (!container) return;

    const streak = this.data.streak;

    if (streak === 0) {
        container.innerHTML = "";
        return;
    }

    const flames = "🔥".repeat(Math.min(streak, 5));

    container.innerHTML = `
        <div class="streak-card">
            <div class="streak-flames">${flames}</div>
            <div class="streak-text">
                ${streak} dias seguidos
            </div>
        </div>
    `;
},
    save() {
        localStorage.setItem("study_stats_v2",
            JSON.stringify(this.data));
        this.render();
    }

};

document.addEventListener("DOMContentLoaded", () => {
    Stats.render();
});