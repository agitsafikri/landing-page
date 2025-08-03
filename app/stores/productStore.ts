export const productStore = defineStore('product', {
  state: () => ({
    productDetail: {
      id: 1,
      name: "Product Name",
      price: 100000,
      image: "https://unsplash.it/300/300?random",
      feature: ["Fitur 1", "Fitur 2", "Fitur 3", "Fitur 4", "Fitur 5"],
    },
    productOption: [
      {
        id: 1,
        text: "Beli 1 dapat 2",
        price: 100000,
      },
      {
        id: 2,
        text: "Beli 1 dapat 3",
        price: 100000,
      },
      {
        id: 3,
        text: "Beli 1 dapat 4",
        price: 100000,
      },
    ],
    productReceipentForm: [
      {
        fieldtype: 'input',
        name: 'name',
        label: 'Nama',
        placeholder: 'Masukkan Nama'
      },
      {
        fieldtype: 'input',
        name: 'phoneNumber',
        label: 'Nomor Telepon',
        placeholder: 'Masukkan Nomor Telepon'
      },
      {
        fieldtype: 'textarea',
        name: 'address',
        label: 'Alamat',
        placeholder: 'Masukkan Alamat'
      },
      {
        fieldtype: 'input',
        name: 'email',
        label: 'Email',
        placeholder: 'Masukkan Email'
      }
    ],
    productPaymentMethod: null,
    productGimmick: null
  }),
})