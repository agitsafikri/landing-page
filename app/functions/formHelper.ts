const getErrorMessage = (label: string, type: string, state: any) => {
  switch (type) {
    case 'required':
      return `${label} tidak boleh kosong`;
    case 'minLength':
      return `${label} minimal ${state.minLength} karakter`;
    case 'maxLength':
      return `${label} maksimal ${state.maxLength} karakter`;
    case 'minValue':
      return `${label} minimal ${state.minValue}`;
    case 'maxValue':
      return `${label} maksimal ${state.maxValue}`;
    case 'maxItems':
      return `${label} maksimal ${state.maxItems} item`;
    case 'minItems':
      return `${label} minimal ${state.minItems} item`;
    case 'differentWith':
      return `${label} tidak boleh sama dengan ${state.differentWith}`;
    case 'sameWith':
      return `${label} harus sama dengan ${state.sameWith}`;
    case 'moreThanWith':
      return `${label} harus lebih dari atau sama dengan ${state.sameWith}`;
    default:
      return '';
  }
};

export const validateForm = (validation: any, item: any, error: any) => {
  let countError = 0;

  for (const key in validation) {
    const state = validation[key];
    if (
      state.required &&
      (item[key] === null ||
        item[key] === undefined ||
        item[key] === '' ||
        (Array.isArray(item[key]) && item[key].length === 0))
    ) {
      error[key].type = 'error';
      error[key].message = getErrorMessage(state.label, 'required', state);
      countError++;
    } else if (state.minValue && item[key] < state.minValue) {
      error[key].type = 'error';
      error[key].message = getErrorMessage(state.label, 'minValue', state);
      countError++;
    } else if (state.maxValue && item[key] > state.maxValue) {
      error[key].type = 'error';
      error[key].message = getErrorMessage(state.label, 'maxValue', state);
      countError++;
    } else if (state.minLength && item[key].length < state.minLength) {
      error[key].type = 'error';
      error[key].message = getErrorMessage(state.label, 'minLength', state);
      countError++;
    } else if (state.maxLength && item[key].length > state.maxLength) {
      error[key].type = 'error';
      error[key].message = getErrorMessage(state.label, 'maxLength', state);
      countError++;
    } else if (state.minItems && item[key].length < state.minItems) {
      error[key].type = 'error';
      error[key].message = getErrorMessage(state.label, 'minItems', state);
      countError++;
    } else if (state.maxItems && item[key].length > state.maxItems) {
      error[key].type = 'error';
      error[key].message = getErrorMessage(state.label, 'maxItems', state);
      countError++;
    } else if (state.differentWith && item[key] === item[state.differentWith]) {
      error[key].type = 'error';
      error[key].message = getErrorMessage(state.label, 'differentWith', state);
      countError++;
    } else if (state.sameWith && item[key] !== item[state.sameWith]) {
      error[key].type = 'error';
      error[key].message = getErrorMessage(state.label, 'sameWith', state);
      countError++;
    } else if (state.moreThanWith && item[key] < item[state.moreThanWith]) {
      error[key].type = 'error';
      error[key].message = getErrorMessage(state.label, 'moreThanWith', state);
      countError++;
    } else {
      error[key].type = 'info';
      error[key].message = '';
    }
  }

  return countError;
};

export const validateArrayForm = (
  validation: any,
  items: any[],
  error: any[]
) => {
  let countError = 0;

  items.forEach((item, index) => {
    countError += validateForm(validation, item, error[index]);
  });

  return countError;
};

export const inputNumberOnly = (event: any) => {
  const charCode = event.which ? event.which : event.keyCode;
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    return false;
  }
  return true;
};

export const inputNumberAndDotOnly = (event: any) => {
  const charCode = event.which ? event.which : event.keyCode;
  if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode !== 46) {
    return false;
  }
  return true;
};

export const inputLetterOnly = (event: any) => {
  const charCode = event.which ? event.which : event.keyCode;
  if (charCode > 31 && (charCode < 65 || charCode > 90)) {
    return false;
  }
  return true;
};

export const inputNumberLimitation = (event: any, min: any, max: any) => {
  if (isNaN(event.target.value)) {
    return;
  }

  const inputValue = parseInt(event.target.value);
  if (inputValue < min) {
    return min;
  } else if (inputValue > max) {
    return max;
  } else {
    return inputValue;
  }
};

export const preventSpaceAndSlash = (event: any) => {
  const charCode = event.which ? event.which : event.keyCode;
  if (charCode === 32 || charCode === 191) {
    return event.preventDefault();
  }
  return true;
};
