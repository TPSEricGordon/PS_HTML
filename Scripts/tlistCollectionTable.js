define(['jquery'], function($j) {

	// Private variables/constants that spans across all instances on a single page (aka. private static)
	var DeleteRowTemplate = '<button class="deleteRow" type="button"><em>&nbsp;</em></button>';
	var UndoDelRowTemplate = '<button class="undoDelRow hide" type="button"><em>&nbsp;</em></button>';

	// Public Functions
	var tlistCollectionTable  =  {
		init: function () {
			$j('.tlistCollectionTable').each(function () {
				// Private variables that is limited to the scope of a single isntance.
				var outerDiv = $j(this);

				if (outerDiv.hasClass('tlistCollectionTableInitialized')) {
					// Already been initialized, don't init again
					return;
				}
				outerDiv.addClass('tlistCollectionTableInitialized');

				var hasDeleteCol = ($j('col.col-delete', outerDiv).length === 1);
				var insertCounter = 0;

				if (hasDeleteCol) {
					$j('tr', outerDiv).each(function () {
						var rowEl = $j(this);
						var delCB = $j('.deleteCB', rowEl).addClass('hide');
						var delRowBtn = $j(DeleteRowTemplate).insertAfter(delCB);
						var undoDelRowBtn = $j(UndoDelRowTemplate).insertAfter(delCB);
						delRowBtn.click(function () {
							delCB.prop('checked', true);
							delRowBtn.addClass('hide');
							undoDelRowBtn.removeClass('hide');
							rowEl.addClass('rowToDelete');
							var elToDisable = $j('input, textarea, select', rowEl).not('.deleteCB');
							elToDisable.filter(':disabled').data('elWasDisabled', true);
							elToDisable.prop('disabled', true);
							elToDisable.removeClass('error unvalidated');
							$j('.error-message',rowEl).text('');
							psFormValidate.updateFeedback_Alert(rowEl,null);
						});
						undoDelRowBtn.click(function () {
							delCB.prop('checked', false);
							delRowBtn.removeClass('hide');
							undoDelRowBtn.addClass('hide');
							rowEl.removeClass('rowToDelete');
							var elToEnable = $j('input, textarea, select', rowEl).not('.deleteCB');
							elToEnable.addClass('unvalidated');
							elToEnable.filter(function () {return !$j(this).data('elWasDisabled');}).prop('disabled', false);
						});
					});
				}

				var newRowTemplate = $j('tr.new', outerDiv);
				if(newRowTemplate.length >= 1) {	// Ability to Add
					pss_get_texts('psx.js.scripts.tlistcollectiontable.', 'psx.js.scripts.tlistcollectiontable.add');
					var addButton = $j('<button/>', {type: 'button', id: 'addButton', text: pss_text('psx.js.scripts.tlistcollectiontable.add')});
					outerDiv.prepend($j('<div class="button-row"></div>').append(addButton));
					addButton.click(function () {
						// Count one more
						insertCounter++;

						var newRow = newRowTemplate.clone().removeClass('new');
						newRow.attr('id', "newRow_" + insertCounter);

						// We couldn't include a name attribute in the template row's input fields (because we didn't want to
						// submit them), so we have to copy from data-name instead. We also need to substitute in the data-name
						// for <INSERT_COUNTER>, putting in a counter. This way, each submitted insert row will be grouped by
						// name.
						newRow.find('[data-name]').each(function(idx,el) {
							var jel = $j(el);
							var data_name = jel.attr('data-name');
							if (data_name) {
								data_name = data_name.replace('{INSERT_COUNTER}', insertCounter);
								jel.removeAttr('data-name');
								jel.attr('name', data_name);
							}
						});
						// similarly for data-validation attributes, we need to stash these somewhere so they dont get
						// processed early
						newRow.find('[data-validation-add]').each(function(idx,el) {
							var jel = $j(el);
							var validationStr = jel.attr('data-validation-add');
							jel.removeAttr('data-validation-add');
							jel.attr('data-validation', validationStr);
						});
						newRow.find('td').each(function(idx,el) {
							var jel = $j(el);
							var id_name = jel.attr('id');
							if (id_name) {
								id_name = id_name.replace('{INSERT_COUNTER}', insertCounter);
								jel.removeAttr('id');
								jel.attr('id', id_name);
							}
						});
						// We also don't want psbehaviors to initialize the widgets on the hidden field since we copy it, so
						// like above, we copy from data-addclass instead.
						newRow.find('[data-addclass]').each(function(idx,el) {
							var jel = $j(el);
							jel.addClass(jel.data('addclass')).removeAttr('data-addclass');
						});

						delTd = $j('.deleteCol', newRow);
						if (hasDeleteCol) {
							$j('<div/>', {'class': 'hide'}).appendTo(delTd);	// Makes sure the 2 buttons aren't the first element (Global CSS styles)
							var delRowBtn = $j(DeleteRowTemplate).appendTo(delTd);
							var undoDelRowBtn = $j(UndoDelRowTemplate).appendTo(delTd);
							delRowBtn.click(function () {
								delRowBtn.addClass('hide');
								undoDelRowBtn.removeClass('hide');
								newRow.addClass('rowToDelete');
								var elToDisable = $j('input, textarea, select', newRow);
								elToDisable.filter(':disabled').data('elWasDisabled', true);
								elToDisable.prop('disabled', true);
								elToDisable.removeClass('error unvalidated');
								psFormValidate.updateFeedback_Alert(newRow,null);
								$j('.error-message',newRow).text('')
							});
							undoDelRowBtn.click(function () {
								delRowBtn.removeClass('hide');
								undoDelRowBtn.addClass('hide');
								newRow.removeClass('rowToDelete');
								var elToEnable = $j('input, textarea, select', newRow);
								elToEnable.addClass('unvalidated');
								elToEnable.filter(function () {return !$j(this).data('elWasDisabled');}).prop('disabled', false);
							});
						}
						newRow.insertBefore(newRowTemplate);

						// Call jsLazyLoader, which sets up LDV validation on the new fields.
						// Note: This is currently not efficient as it checks against every element on the page for non-LDV-initialized ones.
						jsLazyLoader();

						return false;
					});
				}
			});
		}
	};
	return tlistCollectionTable;
});
