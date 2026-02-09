import { defineStore } from "pinia";
import { postData, errorHelper } from "~/apiConfigs/method";

const prefix = "order";

export const usePesananStore = defineStore("pesananStore", {
  state: () => ({
    isSubmitted: false,
    phoneNumber: "",
    message: "",
  }),
  actions: {
    async onStore(data: any) {
      try {
        const response: any = await postData(
          "api_url",
          `/${prefix}/create`,
          data,
        );
        this.isSubmitted = true;
        this.phoneNumber = response.data.data.phoneNumber;
        this.message = response.data.data.message;

        return response.data;
      } catch (error: any) {
        errorHelper(error);
      }
    },
  },
});
