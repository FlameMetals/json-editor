import { isInteger, isNumber } from './utilities.js'

/**
 * Helper function used to build a input box with all sttributes needed
 *
 * @param {number} min - Minimum used for validation, a number between -32768 and 32767. Passing a null will use the default of -32768.
 * @param {Number} max - Maximum used for validation, a number between -32768 and 32767. Passing a null will use the default of 32767.
 * @param {theme} theme - The editors theme always passed as "this.theme"
 * @param {schema} schema - The editors schema always passed as "this.schema"
 *
 * @return {HTMLInputElement} HTMLInputElement
 */
export function buildInputBox (min, max, theme, schema) {
  const input = theme.getFormInputField('input')

  // Set the input type to a number.
  input.setAttribute('type', 'number')

  // Set up the input box as a step type ,
  // and set number the up button adds to the value
  // and set number the down button subtracts from the value
  if (!input.getAttribute('step')) {
    if (typeof schema.step !== 'undefined' && !(isNumber(schema.step.toString()))) {
      input.setAttribute('step', '1')
    } else {
      input.setAttribute('step', schema.step)
    }
  }

  // Set the minimum value for the input box from the schema
  let minimum = 0
  if (min === 'undefined' || min === null) {
    if (typeof schema.minimum !== 'undefined') {
      minimum = schema.minimum

      if (typeof schema.exclusiveMinimum !== 'undefined') {
        minimum += 1
      }
    }
  } else {
    // if the minimum value is overridden set from the caller
    minimum = min
  }
  if (minimum !== 'undefined' && minimum !== null && minimum >= -32768) {
    input.setAttribute('min', minimum)
  } else {
    input.setAttribute('min', -32768)
  }

  // Set the maximum value for the input box from the schema
  let maximum = 0
  if (max === 'undefined' || max === null) {
    if (typeof schema.maximum !== 'undefined') {
      maximum = schema.maximum

      if (typeof schema.exclusiveMaximum !== 'undefined') {
        maximum -= 1
      }
    }
  } else {
    // if the maximum value is overridden set from the caller
    maximum = max
  }

  if (maximum !== 'undefined' && maximum !== null && maximum <= 32768) {
    input.setAttribute('max', maximum)
  } else {
    input.setAttribute('max', 32768)
  }

  return input
}

/**
 * Helper function to see if the box is disabled
 *
 * @param {number} value - The value to check to see if the box is disabled, a number between -32768 and 32767. Passing a null will use the default of -32768."
 * @param {JSON} schema - The editors schema always passed as "this.schema"
 *
 * @return {boolean} boolean
 */
export function checkIfDisabled (value, schema) {
  if (typeof schema.ShowDisableCheckBox !== 'undefined' || schema.ShowDisableCheckBox === true) {
    if (
      (typeof schema.disabledValue === 'undefined' && this.disabledValueDefault === value) ||
      (typeof schema.disabledValue !== 'undefined' && schema.disabledValue === value)
    ) {
      return true
    }
  }
  return false
}

/**
 * Helper function used get the current disabled value
 *
 * @param {number} value - The value to check to see if the box can be disabled, a number between -32768 and 32767. Passing a null will use the default of -32768."
 * @param {JSON} schema - The editors schema always passed as "this.schema"
 * @param {number} disabledValueDefault - The default value if the schema dosn't include a disabled value, a number between -32768 and 32767. Passing a null will use the default of 32767.
 *
 * @return {number} number
 */
export function getDisabledValue (value, schema, disabledValueDefault) {
  if (value === null || checkIfDisabled(value, schema)) {
    if (typeof schema.disabledValue !== 'undefined' && typeof disabledValueDefault !== 'undefined') {
      return isInteger(schema.disabledValue.toString()) ? parseInt(schema.disabledValue) : disabledValueDefault
    } else {
      return -1
    }
  } else {
    return null
  }
}
