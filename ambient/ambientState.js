const AmbientState = {

catalog: [],
visible: [],
cursor: 0,

player: null,
currentVideo: null,
playing: false,

volume: Number(localStorage.getItem("ambient_volume") || 0.6),
lastTime: Number(localStorage.getItem("ambient_last_time") || 0),

ui: {
panelOpen: false
},

favoritesMode: false,


history: [],

favorites: JSON.parse(localStorage.getItem("ambient_favorites") || "[]"),

panelMode: 0,

}