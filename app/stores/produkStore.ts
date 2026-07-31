import { errorHelper, getData } from "~/apiConfigs/method";
import type { FormFieldCheckout } from "~/types/formConfig";
import { useAlertStore } from "./alertStore";

const prefix = "produk";

export const useProdukStore = defineStore("produkStore", {
  state: () => ({
    item: {} as any,
    loading: false,
    /** Terisi bila produk/konfigurasi gagal dimuat — halaman menawarkan "Muat ulang" (§18.6). */
    error: "",
  }),
  getters: {
    /**
     * Konfigurasi form checkout. Backend sudah menyaring field aktif dan
     * mengurutkannya menurut `sortOrder` — client tidak menyaring ulang (§15.2).
     */
    formConfig(state): FormFieldCheckout[] {
      const config = state.item?.formConfig;
      return Array.isArray(config) ? config : [];
    },

    /**
     * Setelan tampilan per produk. Produk lama dapat mengembalikan `null` atau
     * tidak mengirim atributnya sama sekali — dinormalkan di sini agar sisa kode
     * tidak perlu menangani `null` (TDD produk-display-config §4.3, EC-9).
     */
    hideFormLabel: (state): boolean => state.item?.hideFormLabel ?? false,
    hidePrice: (state): boolean => state.item?.hidePrice ?? false,
  },
  actions: {
    async onCheckout(urlCheckout: string): Promise<any> {
      const alertStore = useAlertStore();
      this.loading = true;
      try {
        const response: any = await getData("api_url", `${prefix}/checkout`, {
          urlCheckout,
        });
        this.item = response.data.data;
        this.error = "";
        return response.data;
      } catch (err: any) {
        const message = err.response?.data?.message || "Jaringan Bermasalah";
        this.error = message;
        alertStore.setAlert(message, "danger");
        return errorHelper(err);
      } finally {
        this.loading = false;
      }
    },
  },
});
