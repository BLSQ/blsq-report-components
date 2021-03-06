const isEmpty = (value) => {
  return value == undefined || value == "" || value == null;
};
const DefaultValidator = (contract, context) => {
  const missingFields = context.contractFields.filter(
    (field) => field.compulsory && isEmpty(contract.fieldValues[field.code]),
  );
  const errors = missingFields.map((field) => {
    return {
      field: field.code,
      errorCode: "required",
      message: context.t("validations.isrequired", { interpolation: true, field: field.name }),
    };
  });

  return errors;
};

export default DefaultValidator;
