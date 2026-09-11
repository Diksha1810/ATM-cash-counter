import * as Yup from 'yup';

export const withdrawSchema = Yup.object().shape({
  amount: Yup.number()
    .typeError('Amount must be a valid number')
    .positive('Amount must be greater than 0')
    .integer('Amount must be a whole number')
    .required('Withdrawal amount is required')
    .test('multiple-of-50', 'Amount must be a multiple of ₹50', (value) => {
      return value ? value % 50 === 0 : false;
    }),
});
