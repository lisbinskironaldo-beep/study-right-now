const EventBus = {

    events: {},

    on(event, handler) {

        if (!this.events[event]) {
            this.events[event] = [];
        }

        this.events[event].push(handler);
    },

    emit(event, data) {

        if (!this.events[event]) return;

        this.events[event].forEach(handler => {
            handler(data);
        });
    }

};