import { defineStore } from "pinia";
import { postData, errorHelper } from "~/apiConfigs/method";
import { useAlertStore } from "./alertStore";

const prefix = "order";

export const usePesananStore = defineStore("pesananStore", {
  state: () => ({
    items: [] as Array<any>,
    // item: initPesananItem(),
    // info: initPesananInfo(),
  }),
  actions: {
    // resetInfo() {
    //   this.info = initPesananInfo();
    // },
    async onStore(data: any) {
      const alertStore = useAlertStore();
      try {
        const response: any = await postData("api_url", `/${prefix}`, data);
        alertStore.setAlert(response.data.message, "success");
        return response.data;
      } catch (error: any) {
        alertStore.setAlert(error.message, "error");
        errorHelper(error);
      }
    },
  },
});
