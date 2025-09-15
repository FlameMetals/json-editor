import { AbstractEditor } from '../editor.js'
import { isInteger, isNumber } from '../utilities.js'
import { buildInputBox, checkIfDisabled, getDisabledValue } from '../ffmUtilities.js'

/// <summary>
/// Used for SuperSystems.Com (SSi) 9xxx controllers.
/// The time in the SSi in in a short of total min
/// but users like to see the time in hours and minutes.
/// This editor displays the time in hours and minutes
/// but reads and saves the time in minutes.
/// All parameters names are case sensitive
/// </summary>
/// <example>
///   <code>
///   "option": {
///     "type": 'integer',
///     "format": 'SSI_HourMinuteToInt',
///     "title": "soak time",
///     "minimum": -2,
///     "maximum": 10019,
///     "ShowDisableCheckBox" : false,
///     "disabledValue" : -1
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
/// <returns>integer</returns>
export class ffmHourMinuteEditor extends AbstractEditor {
  preBuild () {
    super.preBuild()

    this.disabledValueDefault = -1
    this.disableCheckBoxId = this.path + Math.random().toString().slice(2, 11) + '.disable'

    // Build Hours input box
    this.inputHours = buildInputBox(0, null, this.theme, this.schema)

    // Build Minutes input box
    this.inputMinutes = buildInputBox(0, 59, this.theme, this.schema)

    // Add a lable for the inputHours
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

    // Build the Hours table Cell
    const tableCellHours = this.theme.getTableCell()

    // Add the Hours input box to Hours table Cell
    tableCellHours.appendChild(this.inputHours)

    // Build the minutes table Cell
    const tableCellMinutes = this.theme.getTableCell()

    // Add the minutes input box to minutes table Cell
    tableCellMinutes.appendChild(this.inputMinutes)

    // create a table row for the control
    const tableRow = this.theme.getTableRow()

    // Add the cells to the row
    tableRow.appendChild(tableCellHours)
    tableRow.appendChild(tableCellMinutes)

    // Add an event handler to update the controls value when one of the controls value is changed
    this.SomeThingChangedHandler_ffmHoursMinute = (e) => {
      let valueLocal = 0

      // Check to see if the check box is being clicked on and get it value
      // if the diable check box is checked get then use the disable value
      // if (e.target.id.toString().toLowerCase() === this.disableCheckBoxId.toString().toLowerCase() || e.target.checked) {
      if (e.target.checked) {
        valueLocal = getDisabledValue(null, this.schema, this.disabledValue)
      } else {
        // get the to totalTime min Minutes from the hour and seconds box
        const totalhours = isInteger(this.inputHours.value) ? parseInt(this.inputHours.value) : 0
        const totalMinutes = isInteger(this.inputMinutes.value) ? parseInt(this.inputMinutes.value) : 0
        const totalTime = (parseInt(totalhours) * 60) + parseInt(totalMinutes)
        valueLocal = totalTime
      }

      this.setValue(valueLocal)
      this.onChange(true)
    }

    // add a change event handler to the table
    this.table.addEventListener('change', this.SomeThingChangedHandler_ffmHoursMinute, false)

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
      this.inputHours.value = 0
      this.inputMinutes.value = 0

      this.inputHours.setAttribute('hidden', true)
      this.inputMinutes.setAttribute('hidden', true)

      this.value = getDisabledValue(value, this.schema, this.disabledValue)
      this.onChange(true)

      return
    }

    // Check to see if the value is a number
    let valueLocal = isNumber(value.toString()) ? value : 0

    this.disableCheckBox.checked = false
    this.inputHours.removeAttribute('hidden')
    this.inputMinutes.removeAttribute('hidden')

    // Format the listbox
    // if the number is one hour or more do the math to separate the hours and minutes
    // else just move the value to the minutes
    if (valueLocal >= 60) {
      this.inputHours.value = parseInt(Math.floor(valueLocal / 60))
      this.inputMinutes.value = parseInt(Math.floor(valueLocal % 60))
    } else {
      this.inputHours.value = 0
      this.inputMinutes.value = valueLocal
    }

    valueLocal = Math.floor(valueLocal)

    // Check to see if the number is less then -32767
    if (valueLocal < 0 && !checkIfDisabled(valueLocal, this.schema)) {
      valueLocal = 0
      this.inputHours.value = 0
      this.inputMinutes.value = 0
    }

    if (valueLocal > 32768) {
      valueLocal = 32768
    }

    // update the global storge value
    this.value = valueLocal
    this.onChange(true)
  }
}
