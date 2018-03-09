var _myattDropdownEditor;
var _ignoreBeforeUnload;
function initDropdownWidget() {
    _myattDropdownEditor = new AttendanceSingleDayWidget('attdate', 'att_attcodelist');
    pss_get_texts('psx.js.seatingchart.common', 'psx.js.seatingchart.common.dirty_browser_att');
	$j(window).on('beforeunload', function() {
		if (!_ignoreBeforeUnload && _myattDropdownEditor.getModifiedCount() > 0) {
			return pss_text('psx.js.seatingchart.common.dirty_browser_att');
		}
    });
	$j('[name="btnSubmit"]').click(function(){_ignoreBeforeUnload = true;});
    _myattDropdownEditor.subscribeDataChanged(function (changed, objid) {
        if (changed) {
            $j('#id_div_savewarning').addClass('feedback-alert');
            $j('#id_div_savewarning').show();
        }
        else {
            $j('#id_div_savewarning').hide();
        }
        handleCommentsOnDataChange(objid);
    });
    setupCommentsIcons();

}

function sa(obj) {
    _myattDropdownEditor.focus(obj);
}

function sa_click(e) {
    _myattDropdownEditor.click(e.target);
}

function sa_keyup(e) {
    _myattDropdownEditor.focus(e.target);
}


function AttendanceSingleDayWidget(key, listName) {
    var me = this;
    var origDataMap;
    var dropdownOptions;
    var fn_dataChanged;
    var _prevObj_id; // input box that is currently active
    var crntIndex;
    var uniquePropertyKey; // i.e attdate property of input text box
    var isMenuOpen;
    var dropDownChangeEvent = false;
    var dropdownId;
    var bindingDropdownName;
    this.uniquePropertyKey = key;
    this.bindingDropdownName = listName;
    this.getModifiedData = function () {
        var m = [];
        for (var key in this.tempDataMap) {
            if ((this.tempDataMap[key] == '' && this.origDataMap[key] != undefined) || this.origDataMap[key] != this.tempDataMap[key]) {
                m[key] = this.tempDataMap[key];
            }
        }
        return m;
    }
    this.setUniquePropertyKey = function (s) {
        this.uniquePropertyKey = s;
    }
    this.restore = function () {
        this.restoreNormalView(false);
    }
    this.restoreNormalView = function (navigating) {
        oid = this._prevObj_id;
        if (oid != undefined && oid != null) {
            var x = $j('#' + this.dropdownId);
            if (x === undefined || x == null) return;
            if (!navigating) this.setValue(x.val(), oid);
            x.remove();
            this.get(oid).show();
            this._prevObj_id = null;
        }
    }
    this.isModified = function (oid) {
        if (this.tempDataMap === undefined) return false;
        var k = this.getKey(oid);
        if (this.tempDataMap[k] === undefined) return false;
        var val = this.tempDataMap[k];
        var oldval = (this.origDataMap[k] === undefined) ? '' : this.origDataMap[k];
        return (oldval != val);
    }
    this.saveValue = function (val) {
        this.setValue(val, this._prevObj_id);
    }
    this.setValue = function (val, objid) {
        if (objid === undefined) return;
        var k = this.getKey(objid);
        var set = false;
        if (this.tempDataMap === undefined) this.tempDataMap = [];
        var origVal = (this.origDataMap[k] == undefined) ? '' : this.origDataMap[k];
        if (val == origVal) {
            if (this.tempDataMap[k] != undefined) {
                delete this.tempDataMap[k];
                set = true;
            }
        }
        else {
            if (this.tempDataMap[k] != val) {
                this.tempDataMap[k] = val;
                set = true;
            }
        }
        if (set) {
            this.get(objid).val(val);
            if (this.fn_dataChanged != undefined) {
                var n = this.getModifiedCount();
                this.fn_dataChanged(n > 0, objid);
            }
        }
    }
    this.getModifiedCount = function () {
        var n = 0;
        for (var k in this.tempDataMap) {
            n++;
        }
        if ($j('#savecomments').val() > 0) {
            return n + 1;
        } else {
            return n;
        }
    }
    this.setDropdownOptions = function (opt) { // set dropdown options
        this.dropdownOptions = opt;
    }
    this.subscribeDataChanged = function (fn) {
        this.fn_dataChanged = fn;
    }
    this.getKey = function (objid) {
        return objid;
    }
    this.getValue = function (objid) {
        var k = this.getKey(objid);
        if (this.tempDataMap[k] != undefined) return this.tempDataMap[k];
        if (this.origDataMap[k] != undefined) return this.origDataMap[k];
        return "";
    }
    this.getOriginalValue = function (objid) {
        var k = this.getKey(objid);
        return this.origDataMap[k];
    }
    this.getMyOriginalValue = function () {
        var k = this.getKey(this._prevObj_id);
        return this.origDataMap[k];
    }
    this.createDropDown = function (obj, navigating, defaultValue) {
        if (this.dropdownOptions === undefined || this.dropdownOptions == null || this.dropdownOptions.length == 0) return;
        x = this.get(obj.name);
        w = x.outerWidth() + 16;
        var parentWidth = x.parent().width();
        // create dropdown
        var minWidth = 80;
        if (minWidth>(parentWidth-20)) minWidth=parentWidth-20;
        var str = '<select id="' + this.dropdownId + '" title="" style="position:relative; min-width:'+minWidth+'px;margin-left:0px;top:0px;left:1px;z-index:10;float:left;">';
        for (i = 0; i < this.dropdownOptions.length; i++)
        str += '<option value="' + this.dropdownOptions[i].value + '">' + this.dropdownOptions[i].text + '</option>';
        str += '</select>';
        $j(str).insertAfter(obj);

        w=$j("#"+this.dropdownId).width()-24;
        if (w>parentWidth) {
        	$j("#"+this.dropdownId).width(parentWidth-24);
        	x.parent().width(parentWidth);
      	}
        var curVal = '';
        if (navigating) curVal = this.getValue(obj.name);
        else {
            curVal = defaultValue;
            this.setValue(curVal, this._prevObj_id);
        }
        var o = $j('#' + this.dropdownId);
        o.val(curVal).attr("selected", "selected");
        me.isMenuOpen = false;
        me.dropDownChangeEvent = true;
        o.parentNode = obj.parentNode;
        var firsttime = true;
        o.keydown(function (event) {
            if (me.isMenuOpen) return true;
            if (event.ctrlKey && (event.keyCode >= 37 && event.keyCode <= 40)) { // ctrl arrow key
                $j('#' + this.dropdownId).click();
                event.stopPropagation();
                event.preventDefault();
                return false;
            }
            else if (event.ctrlKey && event.keyCode == 90) { // ctrl z, undo
                origVal = me.getMyOriginalValue();
                if (origVal === undefined) origVal = '';
                this.value = origVal;
                me.saveValue(this.value);
                return false;
            }
            else {
                var restore = false;
                var o = event.target;
                var r = o.parentNode.parentNode;
                var icol = o.parentNode.cellIndex;
                var nextObj = null;
                if (event.keyCode == 37) { // left arrow or shift tab, go to prev col
                    var o1 = o.previousSibling;
                    while (o1.previousSibling != undefined) {
                        o1 = o1.previousSibling;
                        if (me.isValidObject(o1)) {
                            nextObj = o1;
                            break;
                        }
                    }
                    if (nextObj == null) {
                        for (var i = icol - 1; i >= 0; i--) { // find in this row
                            c = r.cells[i];
                            nextObj = me.findInCell(c);
                            if (nextObj != null) break;
                        }
                    }
                    if (nextObj == null) { // did not find any in current row so simulate up arrow
                        r = r.previousSibling;
                        while (r != undefined && nextObj == null) {
                            nextObj = me.findClosest(r, 0);
                            r = r.previousSibling;
                        }
                    }
                    restore = true;
                }
                else if (event.keyCode == 38) { // up arrow, go up
                    r = r.previousSibling;
                    while (r != undefined && nextObj == null) {
                        nextObj = me.findClosest(r, icol);
                        r = r.previousSibling;
                    }
                    restore = true;
                }
                else if (event.keyCode == 39) { // next arrow or tab, go next col
                    for (var i = icol + 1; i < r.cells.length; i++) {
                        c = r.cells[i];
                        nextObj = me.findInCell(c);
                        if (nextObj != null) break;
                    }
                    if (nextObj === null) { // did not find any in current row so simulate down arrow
                        r = r.nextSibling;
                        while (r != undefined && nextObj == null) {
                            nextObj = me.findClosest(r, icol);
                            r = r.nextSibling;
                        }
                    }
                    restore = true;
                }
                else if (event.keyCode == 40 || event.which == 13) { // down arrow, return key, go down
                    var o1 = o;
                    while (o1.nextSibling != undefined) { // first within cell
                        o1 = o1.nextSibling;
                        if (me.isValidObject(o1)) {
                            nextObj = o1;
                            break;
                        }
                    }
                    r = r.nextSibling;
                    while (r != undefined && nextObj == null) {
                        nextObj = me.findClosest(r, icol);
                        r = r.nextSibling;
                    }
                    restore = true;
                    if (event.which == 13) me.setValue(o.value, me._prevObj_id);
                }
                if (restore) {
                    me.stopEvent(event);
                    if (nextObj != null) {
                        var x = me.getSelection();
                        o.disabled = true;
                        setTimeout(function () {
                            me.navigateEditor(nextObj, true, x);
                        }, 100);
                        return false;
                    }
                    else { // FF fix for when dropdown reaches end and you hit arrow then dropdown value changes (want to avoid that). We will disable the dropdown for a sec so event is skipped
                        o.disabled = true;
                        setTimeout(function () {
                            o.disabled = false;
                            o.focus();
                        }, 100);
                    }
                    return false;
                }
            }
            return true;
        });
        o.keyup(function (event) {
            me.stopEvent(event);
            o = event.target;
            if (!(event.keyCode >= 37 && event.keyCode <= 40 || event.which == 13)) {
                me.setValue(o.value, me._prevObj_id);
                return true;
            }
            o.disabled = true;
            obj = me.get(me._prevObj_id);
            curVal = me.getValue(obj[0].name);
            o1 = $j('#' + me.dropdownId);
            o1.val(curVal).attr("selected", "selected"); //select value in the cell
            o.disabled = false;
            o.focus();
            return false;
        });
        var firsttime = true;
        o.click(function (event) {
            me.isMenuOpen = !me.dropDownChangeEvent;
            me.dropDownChangeEvent = false;
            //console.log('onclick:'+me.isMenuOpen);
        });
        o.blur(function (event) {
            me.isMenuOpen = false;
            me.saveValue(event.target.value);
            //console.log('onblur:'+me.isMenuOpen);
            return false;
        });
        o.change(function (event) {
            me.isMenuOpen = false;
            me.saveValue(event.target.value);
            me.dropDownChangeEvent = true;
            //console.log('onchange:'+me.isMenuOpen);
            return false;
        });
        o.focus();
        if (this.fn_onFocus != undefined) this.fn_onFocus(this.uniqueId);
    }
    this.isValidObject = function (o) {
        var valid = false;
        if (o != undefined && o.type == 'text') {
            for (var j = 0; j < o.attributes.length; j++) {
                if (o.getAttribute(this.uniquePropertyKey) != undefined) {
                    valid = true;
                    break;
                }
            }
        }
        return valid;
    }
    this.findInCell = function (c) {
        if (c == null) return null;
        var nextObj = null;
        for (var j = 0; j < c.children.length; j++) {
            o = c.children[j];
            if (this.isValidObject(o)) {
                nextObj = o;
                break;
            }
        }
        return nextObj;
    }
    this.findClosest = function (r, icol) {
        if (r.cells === undefined || r.cells.length == 0) return null;
        var nextObj = null;
        for (var j = icol; j < r.cells.length; j++) {
            c = r.cells[j];
            nextObj = this.findInCell(c, 0);
            if (nextObj != null) break;
        }
        if (nextObj == null && r.cells.length > (icol - 1)) {
            for (var j = icol - 1; j >= 0; j--) {
                c = r.cells[j];
                nextObj = this.findInCell(c, 0);
                if (nextObj != null) break;
            }
        }
        return nextObj;
    }
    this.stopEvent = function (e) {
        if (!e) var e = window.event;
        e.cancelBubble = true;
        e.returnValue = false;
        if (e.stopPropagation) {
            e.stopPropagation();
            e.preventDefault();
        }
        return false;
    }
    this.get = function (name) {
        return $j('[type=text][name="' + name + '"]');
    }
    this.navigateEditor = function (obj, navigating, defaultValue) {
        var o = $j('#' + this.dropdownId);
        if (o != undefined) {
            o.unbind('blur');
        }
        this.restoreNormalView(navigating);
        this._prevObj_id = obj.name;
        this.get(obj.name).hide();
        this.createDropDown(obj, navigating, defaultValue);
    }
    this.changeDropdownValue = function (val) {
        o = $j('#' + this.dropdownId);
        if (o != undefined) o.val(val).attr("selected", "selected");
    }
    this.getSelection = function () {
        pu = document.getElementsByName(this.bindingDropdownName)[0];
        if (pu === undefined) return '';
        b = pu.selectedIndex;
        c = pu[b].value;
        return c;
    }
    this.setupDropdownItems = function () {
        pu = document.getElementsByName(this.bindingDropdownName)[0];
        opt = [];
        for (var i = 0; i < pu.options.length; i++) {
            s = pu.options[i].text;
            opt[i] = {
                text: s,
                value: pu.options[i].value
            };
        }
        this.setDropdownOptions(opt);
    }
    this.focus = function (o) {
        this.navigateEditor(o, true, this.getSelection());
    }
    this.click = function (o) {
        this.navigateEditor(o, false, this.getSelection());
    }
    this.init = function () {
        this.dropdownId = "id_myattdropdown";
        this.isMenuOpen = false;
        this.tempDataMap = [];
        var objArray = $j('[type=text][' + this.uniquePropertyKey + ']'); // find all input text boxes that have uniquePropertyKey attribute
        if (objArray === undefined) return;
        this.origDataMap = [];
        for (var i = 0; i < objArray.length; i++) {
            var k = objArray[i].name;
            this.origDataMap[k] = objArray[i].value;
            objArray[i].onfocus = null;
        }
        objArray.click(sa_click);
        objArray.keyup(sa_keyup);
        this.setupDropdownItems();
    }
    this.init();
}

function on_mouseenter_comment(o, flag) {
    if (flag == 0) {
        o.title = o.previousSibling.value;
    }
    else {
        o.title = $j(o.previousSibling).text();
    }
}

var blueIcon = '/images/seatingchart/icon-comment-lrg-blue.png';
var greyIcon = '/images/seatingchart/icon-comment-lrg-grey.png';

function setupCommentsIcons() {
    // find all the hidden fields with name starting with COM for comments
    var objArray = $j('[type=hidden][name^="COM"]');
    for (i = 0; i < objArray.length; i++) {
        var current = $j(objArray[i]);
        var attendanceCode = '';
        var comment = current.val();
        // assumes previous sibling is attendance input box
        if (current.prev()) {
            attendanceCode =current.prev().val();
        }

        var element = $j('<span id="id_' + current.attr('name') + '" onmouseover="on_mouseenter_comment(this,0)">' +
            '<img class="comment-icon" name="comment-icon" onclick="return showAttendanceCommentsDialog(\'' + current.attr('name') + '\', false);"/></span>');

        if (comment != '') {
            element.find('img.comment-icon').attr('src', blueIcon);
        }
        else if (attendanceCode != '') {
            element.find('img.comment-icon').attr('src', greyIcon);
        }
        else {
            element.hide();
        }

        element.insertAfter(current);
        }

    // read only comments
    objArray = $j("span[id^='COM']"); // find all the hidden fields with name starting with COM for comments
    for (var i = 0; i < objArray.length; i++) {
        if (objArray[i].innerHTML != '') {
            var str = '<span onmouseover="on_mouseenter_comment(this,1)" >' +
                '<img class="comment-icon" name="comment-icon" src="/images/seatingchart/icon-comment-lrg-blue.png" onclick="return showAttendanceCommentsDialog(\'' + objArray[i].id + '\', true);"/></span>';
            $j(str).insertAfter(objArray[i]);
        }
    }
}

function showAttendanceCommentsDialog(name, readOnly) {
    var comment;
    if (readOnly) {
        o = document.getElementById(name);
        comment = $j(o).text();
    }
    else {
        comment = document.getElementsByName(name)[0].value;
    }

    var psDialogDiv = $j('<div/>', {style: 'padding: 20px;'}).append($j('<textarea/>', {id: 'comment-text-area', cols: 80, rows: 15}));
    var textArea = $j('#comment-text-area', psDialogDiv);
    if (readOnly) {
        textArea.attr('readonly', 'readonly');
        textArea.attr('style', 'background-color: #D3D3D3');
    }
    else {
        textArea.attr('maxlength', 2000);
    }
    textArea.val(comment);

      var myButtons;
    if (!readOnly) {
        myButtons = [{
            text: _ok,
            click: function () { saveAttendanceComment(name, textArea); }
        }, {
            text: _cancel,
            click: function () { psDialogClose(); }
        }];
    } else {
        myButtons = [{
            text: _close,
            click: function () { psDialogClose(); }
        }];
    }

    psDialog({
        type: 'dialogM',
        title: readOnly ? _readOnlyTitle : _editableTitle,
        content: psDialogDiv,
        buttons: myButtons
    });

    return false;
}

function saveAttendanceComment(name, textArea) {
    var commentInputEl = $j(document.getElementsByName(name)[0]);
    var commentSpanEl = $j('span#id_' + name);
    var attCodeEL = commentInputEl.prev();
    commentInputEl.val(textArea.val());

    psDialogClose();

    handleCommentOrCodeChange(attCodeEL, commentInputEl, commentSpanEl);
    enableSaveButtons();
}

function enableSaveButtons() {
    $j('#savecomments').val("1");
    //Added to enable the submit button on the Enter Attendance page in the admin portal.
    if(getPortal() === 'admin'){
    	attReset();
    }
    $j('#id_div_savewarning').addClass('feedback-alert');
    $j('#id_div_savewarning').show();
}

function handleCommentsOnDataChange(objid) {
    var codeEL = $j(document.getElementsByName(objid)[0]);
    var commentEL = $j(document.getElementsByName('COM' + objid.substr(3))[0]);
    var span = $j("#id_COM" + objid.substr(3));

    handleCommentOrCodeChange(codeEL, commentEL, span);
}

function handleCommentOrCodeChange(codeEL, commentEL, commentSpanEL) {
    var attCode = codeEL.attr('value');
    var comment = commentEL.val();
    var hasCodeSet = attCode.length > 0;
    if ((comment !== null && comment.length > 0) || hasCodeSet) {
        if (comment.length > 0) {
            commentSpanEL.find('img.comment-icon').attr('src', blueIcon);
        } else {
            commentSpanEL.find('img.comment-icon').attr('src', greyIcon);
        }
        commentSpanEL.show().css("display","inline")

    } else {
        commentSpanEL.hide();
    }

}
