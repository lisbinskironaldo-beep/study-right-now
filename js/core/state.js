// js/core/state.js

const State = {

    data: {},

    set(key, value) {
        this.data[key] = value;
    },

    get(key) {
        return this.data[key];
    }

};

export default State;