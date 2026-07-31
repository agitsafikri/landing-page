import { defineStore } from "pinia";
import { postData } from "~/apiConfigs/method";
import type { ApiFieldError } from "~/types/formConfig";

const prefix = "order";

export interface CreateOrderResult {
  success: boolean;
  message: string;
  /** Daftar galat per field — berada pada atribut `data`, bukan `errors`. */
  errors: ApiFieldError[];
}

export const usePesananStore = defineStore("pesananStore", {
  state: () => ({
    isSubmitted: false,
    phoneNumber: "",
    message: "",
  }),
  actions: {
    async onStore(data: any): Promise<CreateOrderResult> {
      try {
        const response: any = await postData(
          "api_url",
          `/${prefix}/create`,
          data,
        );
        this.isSubmitted = true;
        this.phoneNumber = response.data.data.phoneNumber;
        this.message = response.data.data.message;

        return { success: true, message: response.data.message, errors: [] };
      } catch (error: any) {
        const body = error?.response?.data;
        return {
          success: false,
          message: body?.message || "Jaringan Bermasalah",
          // Galat validasi dipetakan ke masing-masing input oleh pemanggil;
          // toast hanya untuk galat yang tidak terpetakan.
          errors: Array.isArray(body?.data) ? body.data : [],
        };
      }
    },
  },
});
