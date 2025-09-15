import { AbstractEditor } from '../editor.js'
import { isNumber } from '../utilities.js'
import { buildInputBox, checkIfDisabled, getDisabledValue } from '../ffmUtilities.js'

/// <summary>
/// Used for SuperSystems.Com (SSi) 9xxx controllers.
/// The set point in the SSi in in a short so if you would
/// like a decimal number you need to off set the number.
/// This editor displays the set point as a decimal
/// but reads and saves the set point as a short.
/// All parameters names are case sensitive
/// </summary>
/// <example>
///   <code>
///   "loop2": {
///     "type": 'integer',
///     "format": 'ssiSetPoint',
///     "title": "carbon",
///     "minimum": -2,
///     "maximum": 10019,
///     "ShowDisableCheckBox" : false,
///     "disabledValue" : -1,
///     "step" : 0.01,
///     "impliedDecimalPoints" : 2
///   }
///   </code>
/// </example>
/// <param name="type">Must be a type of integer (Case </param>
/// <param name="format">Must be a type of SSI_HourMinuteToInt</param>
/// <param name="title">Title of the control.</param>
/// <param name="minimum">Minimum time setting. Not currently implemented.</param>
/// <param name="minimum">Maximum time setting. Used for hours only.</param>
/// <param name="ShowDisableCheckBox">
///   Boolean value : ,
///   true or undefined = show check box ,
///   false = hides the check box
/// </param>
/// <param name="disabledValue">
///   Integer value : ,
///   integer = sets the disable value ,
///   undefined = -1
/// </param>
/// <param name="step">
///   Integer value : ,
///   number the up button adds to the value
///   number the down button subtracts from the value
/// </param>
/// <param name="impliedDecimalPoints">
///   Integer value : ,
///   number of implied decimal points
/// </param>
/// <returns>integer</returns>
export class ffmSetPointEditor extends AbstractEditor {
  preBuild () {
    super.preBuild()

    this.disabledValueDefault = -1
    this.disableCheckBoxId = this.path + Math.random().toString().slice(2, 11) + '.disable'

    // Build input box
    this.input = buildInputBox(null, null, this.theme, this.schema)

    // Add a lable for the input
    this.lable = this.header = this.theme.getFormInputLabel(this.getTitle(), this.isRequired())

    // create a table for the for the controls
    this.table = this.theme.getTable()

    // Add the lable to the tables top row
    if (this.lable.innerText !== '') {
      const tableCellTitle = this.theme.getTableCell()
      tableCellTitle.appendChild(this.lable)
      const tableRowTitle = this.theme.getTableRow()
      tableRowTitle.appendChild(tableCellTitle)
      this.table.appendChild(tableRowTitle)
    }

    // Build a disable ckeck box
    this.disableCheckBox = this.theme.getCheckbox()
    this.disableCheckBox.id = this.disableCheckBoxId.toString()
  }

  build () {
    super.build()

    // Build the input table Cell
    const tableCellInput = this.theme.getTableCell()

    // Add the input box to table Cell
    tableCellInput.appendChild(this.input)

    // create a table row for the control
    const tableRow = this.theme.getTableRow()

    // Add the cells to the row
    tableRow.appendChild(tableCellInput)

    // Add an event handler to update the controls value when one of the controls value is changed
    this.SomeThingChangedHandler_ffmSetPoint = (e) => {
      let valueLocal = isNumber(this.input.value.toString()) ? this.input.value : 0

      // Check to see if the number is less then -32767
      if (valueLocal < -32768) {
        valueLocal = -32768
      }

      if (valueLocal > 32767) {
        valueLocal = 32767
      }

      // Check to see if the check box is being clicked on and get it value
      // if the diable check box is checked get then use the disable value
      // if (e.target.id.toString().toLowerCase() === this.disableCheckBoxId.toString().toLowerCase() || e.target.checked) {
      if (e.target.checked) {
        valueLocal = getDisabledValue(null, this.schema, this.disabledValueDefault)
      } else {
        if (typeof this.schema.impliedDecimalPoints !== 'undefined' && isNumber(this.schema.impliedDecimalPoints.toString()) && this.schema.impliedDecimalPoints > 0) {
          const impliedDecimalPoints = this.schema.impliedDecimalPoints
          const mathPowerOf10 = Math.pow(10, impliedDecimalPoints)
          valueLocal = valueLocal * mathPowerOf10
        }
      }

      this.setValue(valueLocal)
      this.onChange(true)

      this.setValue(valueLocal)
      this.onChange(true)
    }

    // add a change event handler to the table
    this.table.addEventListener('change', this.SomeThingChangedHandler_ffmSetPoint, false)

    // add the row to the table
    this.table.appendChild(tableRow)

    // check to see if the disable box is undefined in the schema
    // or requested to be shown
    // if it is build the check box and add it to the table
    if (typeof this.schema.ShowDisableCheckBox === 'undefined' || this.schema.ShowDisableCheckBox === true) {
      const disableCheckBoxLable = this.theme.getCheckboxLabel('Disable')

      const disableCheckBoxControl = this.theme.getFormControl(disableCheckBoxLable, this.disableCheckBox)

      const tableCellDisableCheckBox = this.theme.getTableCell()
      tableCellDisableCheckBox.appendChild(disableCheckBoxControl)

      const tableRowDisableCheckBox = this.theme.getTableRow()
      tableRowDisableCheckBox.appendChild(tableCellDisableCheckBox)

      this.table.appendChild(tableRowDisableCheckBox)
    }

    // Add the table to the AbstractEditor base container
    this.container.appendChild(this.table)
  }

  // called by the SomeThingChangedHandler
  // every time the control is changed
  setValue (value, initial) {
    if (checkIfDisabled(value, this.schema)) {
      this.disableCheckBox.checked = true
      this.input.value = 0

      this.input.setAttribute('hidden', true)

      this.value = getDisabledValue(value, this.schema, this.disabledValueDefault)
      this.onChange(true)

      return
    }

    // Check to see if the value is a int
    let valueLocal = isNumber(value.toString()) ? value : 0

    // Check to see if the number is less then -32767
    if (valueLocal < -32768) {
      valueLocal = -32768
    }

    if (valueLocal > 32767) {
      valueLocal = 32767
    }

    this.disableCheckBox.checked = false
    this.input.removeAttribute('hidden')

    // Format the listbox Data
    // If the control has an impliedDecimalPoints setting above 0
    if (typeof this.schema.impliedDecimalPoints !== 'undefined' && isNumber(this.schema.impliedDecimalPoints.toString()) && this.schema.impliedDecimalPoints > 0) {
      const impliedDecimalPoints = this.schema.impliedDecimalPoints
      const mathPowerOf10 = Math.pow(10, impliedDecimalPoints)
      this.input.value = (valueLocal / mathPowerOf10).toFixed(impliedDecimalPoints)
    } else {
      this.input.value = valueLocal
    }

    if (typeof this.schema.ShowDisableCheckBox !== 'undefined' || this.schema.ShowDisableCheckBox === true) {
      if (
        (typeof this.schema.disabledValue === 'undefined' && this.disabledValueDefault === this.input.value) ||
        (typeof this.schema.disabledValue !== 'undefined' && this.schema.disabledValue === value)
      ) {
        this.input.value = 0
        this.disableCheckBox.checked = true
        this.input.setAttribute('hidden', true)
      } else {
        this.disableCheckBox.checked = false
        this.input.removeAttribute('hidden')
      }
    }

    valueLocal = Math.floor(valueLocal)

    // Check to see if the number is less then -32767
    if (valueLocal < -32768) {
      valueLocal = -32768
    }

    if (valueLocal > 32767) {
      valueLocal = 32767
    }

    // update the global storge value
    this.value = valueLocal
    this.onChange(true)
  }
}
