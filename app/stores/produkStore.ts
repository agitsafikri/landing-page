import { errorHelper, getData } from "~/apiConfigs/method";
import { useAlertStore } from "./alertStore";

const prefix = "produk";

export const useProdukStore = defineStore("produkStore", {
  state: () => ({
    item: {} as any,
  }),
  actions: {
    async onCheckout(urlCheckout: string): Promise<any> {
      const alertStore = useAlertStore();
      try {
        const response: any = await getData("api_url", `${prefix}/checkout`, {
          urlCheckout,
        });
        this.item = response.data.data;
        alertStore.setAlert(response.data.message, "success");
        return response.data;
      } catch (err: any) {
        alertStore.setAlert(err.response?.data?.message, "danger");
        return errorHelper(err);
      }
    },
  },
});
