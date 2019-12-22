function reformatValidationErrors(errors) {
  const cleanErrors = {errors: {}};
  for (let error in errors) {
    cleanErrors.errors[errors[error].properties.path] = errors[error].message;
  }
  return cleanErrors;
}

module.exports = { reformatValidationErrors };