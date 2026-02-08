import { defineStore } from "pinia";
import { getData, errorHelper } from "~/apiConfigs/method";

const prefix = {
  province: "location/province",
  city: "location/city",
  district: "location/district",
};

export const useLocationStore = defineStore("locationStore", {
  state: () => ({
    provinces: [] as any[],
    cities: [] as any[],
    districts: [] as any[],
  }),
  actions: {
    reset() {
      this.provinces = [] as any[];
      this.districts = [] as any[];
      this.cities = [] as any[];
    },
    async onIndexProvince() {
      try {
        const response: any = await getData("api_url", `${prefix.province}`);
        this.provinces = response.data.data.map((item: any) => ({
          value: item.id,
          name: item.provinceName,
        }));
      } catch (err: any) {
        return errorHelper(err);
      }
    },
    async onIndexCity(id: number) {
      try {
        const response: any = await getData("api_url", `${prefix.city}`, {
          provinceId: id,
        });
        this.cities = response.data.data.map((item: any) => ({
          value: item.id,
          name: item.cityName,
        }));
      } catch (err: any) {
        return errorHelper(err);
      }
    },
    async onIndexDistrict(id: number) {
      try {
        const response: any = await getData("api_url", `${prefix.district}`, {
          cityId: id,
        });
        this.districts = response.data.data.map((item: any) => ({
          value: item.id,
          name: item.districtName,
        }));
      } catch (err: any) {
        return errorHelper(err);
      }
    },
  },
});
