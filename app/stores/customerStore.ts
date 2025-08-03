const initCustomer = {
  fullname: '',
  whatsappNumber: '',
  address: '',
  province: '',
  city: '',
  district: '',
}

export const customerStore = defineStore('customer', {
  state: () => ({
    customer: null,
    selectedProductOption: null,
    selectedPaymentMethod: null,
  }),
})