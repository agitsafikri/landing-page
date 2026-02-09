export const formatPhoneNumber = (number: string) => {
  return `+62 ${number.slice(2)}`.replace(/(\d{4})/g, '$1 ');
};

export const removeSnakeCase = (str: string) => str.replace(/_/g, ' ');

// sample input: "CUSTOMER_SERVICE" => "Customer Service"
export const convertSentenceCase = (str: string) => {
  let strings = str.split(' ');
  for (let i = 0; i < strings.length; i++) {
    strings[i] =
      strings[i].charAt(0).toUpperCase() +
      strings[i].substring(1).toLowerCase();
  }
  return strings.join(' ');
};
