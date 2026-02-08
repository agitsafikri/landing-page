import { defineStore } from 'pinia';

export const useAlertStore = defineStore('alert', {
  state: () => ({
    show: false,
    message: '',
    // bg: 'white',
    type: 'success',
  }),

  //   getters: {
  //     doubleCount: state => state.counter * 2,
  //   },

  actions: {
    hideAlert() {
      this.show = false;
    },

    setAlert(message: string, type = 'success') {
      this.message = message;
      this.type = type;
      this.show = true;

      setTimeout(() => {
        this.show = false;
      }, 3000);
    },
  },
});
