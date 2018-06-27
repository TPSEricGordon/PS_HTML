/**
 * Functions to support the customization using tlist_child or tlist_standalone tag
 * input text to change the ui component to dropdown, radio button, text area or read only text
 */

function tlistText2DropDown(fieldName, ddRows) {
	var fqTD=".tlistCollectionTable > table > tbody > tr > .td-" + fieldName;
	$j(fqTD).each(function (x, TDHTML) {
		var tdElement = $j(TDHTML),
			input = tdElement.find("input"),
			inputName = input.attr("name"),
			inputValue = input.attr("value"),
			inputClass = input.attr("class"),
			inputdataName,
			inputdataClass,
			selectHtml;
		input.remove();
		if (inputName == null) {
			inputdataName = input.attr("data-name");
			inputdataClass = input.attr("data-addclass");
		}
		if (inputName != null) {
			selectHtml = '<select name="' + inputName + '" class="' + inputClass + '" >';
		} else {
			selectHtml = '<select data-name="' + inputdataName + '" class="' + inputClass + '" data-addclass="' + inputdataClass + '" > ';
		}
		for (var ddRow in ddRows) {
			var optionhtml;
			if (ddRows[ddRow]==inputValue){
				optionhtml = '<option value="' + ddRows[ddRow] + '" selected="selected">' + ddRows[ddRow] +'</option> ';
			} else {
				optionhtml = '<option value="' + ddRows[ddRow] + '">' + ddRows[ddRow] +'</option> ';
			}
			selectHtml += optionhtml;
		}
		selectHtml += '</select> ';
		tdElement.append(selectHtml);
		});
	}


function tlistText2DropDownValNamePair(fieldName, ddRows) {
	var fqTD=".tlistCollectionTable > table > tbody > tr > .td-" + fieldName;
	$j(fqTD).each(function (x, TDHTML) {
		var tdElement = $j(TDHTML),
			input = tdElement.find("input"),
			inputName = input.attr("name"),
			inputValue = input.attr("value"),
			inputClass = input.attr("class"),
			inputdataName,
			inputdataClass,
			selectHtml;
		input.remove();
		if (inputName == null) {
			inputdataName = input.attr("data-name");
			inputdataClass = input.attr("data-addclass");
		}
		if (inputName != null) {
			selectHtml = '<select name="' + inputName + '" class="' + inputClass + '" >';
		} else {
			selectHtml = '<select data-name="' + inputdataName + '" class="' + inputClass + '" data-addclass="' + inputdataClass + '" > ';
		}
		for (var ddRow in ddRows) {
			var optionhtml;
			if (ddRows[ddRow][0]==inputValue){
				optionhtml = '<option value="' + ddRows[ddRow][0] + '" selected="selected">' + ddRows[ddRow][1] +'</option> ';
			} else {
				optionhtml = '<option value="' + ddRows[ddRow][0] + '">' + ddRows[ddRow][1] +'</option> ';
			}
			selectHtml += optionhtml;
		}
		selectHtml += '</select> ';
		tdElement.append(selectHtml);
	});
}

function tlistText2RadioButton(fieldName,rbRows) {
	var fqTD=".tlistCollectionTable > table > tbody > tr > .td-" + fieldName;
	$j(fqTD).each(function (x, TDHTML) {
		var tdElement = $j(TDHTML),
			input = tdElement.find("input"),
			inputName = input.attr("name"),
			inputValue = input.attr("value"),
			inputClass = input.attr("class"),
			inputdataName,
			inputdataClass,
			radios;
		input.remove();
		if (inputName == null) {
			inputdataName = input.attr("data-name");
			inputdataClass = input.attr("data-addclass");
		}
		for (var rbRow in rbRows){
			var radioHtml;
			if (inputName != null) {
				radioHtml = '<input type="radio" name="' + inputName + '" class="' + inputClass + '" value="' + rbRows[rbRow] + '"';
			} else {
				radioHtml = '<input type="radio" data-name="' + inputdataName + '" data-addclass="' + inputdataClass + '" value="' + rbRows[rbRow] + '"';
			}
			if (rbRows[rbRow]==inputValue){
				radioHtml += ' checked="checked"';
			}
			radioHtml += '/>' + rbRows[rbRow] + '<br/>';
			tdElement.append(radioHtml);
		}
	});
}

function tlistText2RadioButtonValNamePair(fieldName,rbRows) {
	var fqTD=".tlistCollectionTable > table > tbody > tr > .td-" + fieldName;
	$j(fqTD).each(function (x, TDHTML) {
		var tdElement = $j(TDHTML),
			input = tdElement.find("input"),
			inputName = input.attr("name"),
			inputValue = input.attr("value"),
			inputClass = input.attr("class"),
			inputdataName,
			inputdataClass,
			radios;
		input.remove();
		if (inputName == null) {
			inputdataName = input.attr("data-name");
			inputdataClass = input.attr("data-addclass");
		}
		for (var rbRow in rbRows){
			var radioHtml;
			if (inputName != null) {
				radioHtml = '<input type="radio" name="' + inputName + '" class="' + inputClass + '" value="' + rbRows[rbRow][0] + '"';
			} else {
				radioHtml = '<input type="radio" data-name="' + inputdataName + '" data-addclass="' + inputdataClass + '" value="' + rbRows[rbRow][0] + '"';
			}
			if (rbRows[rbRow][0]==inputValue){
				radioHtml += ' checked="checked"';
			}
			radioHtml += '/>' + rbRows[rbRow][1] + '<br/>';
			tdElement.append(radioHtml);
		}
	});
}

function tlistText2TextArea(fieldName,taRows,taCols) {

	var fqTD=".tlistCollectionTable > table > tbody > tr > .td-" + fieldName;
	$j(fqTD).each(function (x, TDHTML) {
		var tdElement = $j(TDHTML),
			input = tdElement.find("input"),
			inputName = input.attr("name"),
			inputValue = input.attr("value"),
			inputClass = input.attr("class"),
			inputdataName,
			inputdataClass,
			inputdataValidation,
			textareahtml;
		input.remove();
		if (inputName == null) {
			inputdataName = input.attr("data-name");
			inputdataClass = input.attr("data-addclass");
		}
		if (inputName != null) {
			textareahtml = '<textarea cols="' + taCols + '" rows="' + taRows + '" name="' + inputName + '" class="' + inputClass + '">'
		} else {
			textareahtml = '<textarea cols="' + taCols + '" rows="' + taRows + '" data-name="' + inputdataName + '" class="' + inputClass + '" data-addclass="' + inputdataClass + '">'
		}
		textareahtml += inputValue + '</textarea>';
		tdElement.append(textareahtml);
	});
}
function tlistText2StaticText(fieldName) {
	var fqTD=".tlistCollectionTable > table > tbody > tr > .td-" + fieldName;
	$j(fqTD).each(function (x, TDHTML) {
		var tdElement = $j(TDHTML),
			input = tdElement.find("input"),
			inputName = input.attr("name"),
			inputValue = input.attr("value"),
			staticText,
			datePicker;
			input.remove();
			staticText = '<p>' + inputValue + '</p>';
			// Might be a date type, remove the date picker if it exists
			datePicker = tdElement.find("button.ui-datepicker-trigger");
			if (datePicker != null) {
				datePicker.remove();
			}
			tdElement.append(staticText);
	});
}

function tlistText2StaticTextAllowNew(fieldName) {
	var fqTD=".tlistCollectionTable > table > tbody > tr > .td-" + fieldName;
	$j(fqTD).each(function (x, TDHTML) {
		var tdElement = $j(TDHTML),
			input = tdElement.find("input"),
			inputName = input.attr("name"),
			inputValue = input.attr("value"),
			staticText,
			datePicker;
		if (inputName != null) {
			input.remove();
			// Might be a date type, remove the date picker if it exists
			datePicker = tdElement.find("button.ui-datepicker-trigger");
			if (datePicker != null) {
				datePicker.remove();
			}
			staticText = '<p>' + inputValue + '</p>';
		}
		tdElement.append(staticText);
	});
}
