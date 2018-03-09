var viewOnly=false; // we need to set this to true when we want to disable edit options (teacher can only view attendance but not edit)
var _origAttData = [];
var _ignoreBeforeUnload = false;
var _sectionTodayEnrolledStudentMap = [];
var _origCommentMap=[];
var _modifiedCommentMap=[];

var showPeriodsOnGrid=true;
var showComments=false;
var commentCookieName='att-grid-showcomments';

var maxPastIndex = 9999, maxFutureIndex=-1;
function setMaxPastFutureAllowables() {
  if (isAdmin) {
    maxPastIndex = 0;
    maxFutureIndex=cal_date_arr.length;
  }
  else {
  for (var j=0;j<cal_date_arr.length;j++) {
    if (cal_date_arr[j] == teacherAllowableAttendanceDates[0]) {
      maxPastIndex=j;
    }
    if (cal_date_arr[j] == teacherAllowableAttendanceDates[1]) {
      maxFutureIndex=j;
    }
  }
}
}

function convertToAttMap(arr) {
var map = [];
for (var i=0;i<arr.length;i++) {
  o=arr[i];
  map[o[0]]=o[1];
}
return map;
}

function getPeriodIntervalText(secIndx, perId,intervalNum) {
var perArr = periodIntervalsArray[secIndx];
var txt='';
var secId = sectionMap[secIndx];
var isIntervalMode = (sectionMeetingMap[secId] == 'ATT_ModeInterval');

var showPeriods=true;
if (periodIntervalsArray.length <= 1 && isIntervalMode) {
  showPeriods=false;
}

for (var i=0;i<perArr.length;i++) {
  if (perArr[i].periodId == perId) {
    var p=perArr[i];
    txt=_period_p+p.periodAbb;
    if (p.intervals.length>=intervalNum && intervalNum>0) {
      p.intervals[intervalNum-1]
      s = (intervalNum>0)?p.intervals[intervalNum-1]:p.intervals[0];
      if (s.length>5 && showPeriods)
        s = s.substr(0,5);// remove am pm

      txt = showPeriods?(txt+' '+s):s;
    }
    break;
  }
}
return txt;
}

function on_mouseout_comment(o) {
o.title='';
}

function on_mouseenter_comment(o,id,secIdx) {
ar_orig=_origCommentMap[''+secIdx];
ar_mod=_modifiedCommentMap[''+secIdx];

str=ar_orig[id];
if (ar_mod[id] !== undefined)
  str = ar_mod[id];

o.title=$j("<div/>").html(str).text();
}

function saveAttendanceComment(secIdx, id, textArea) {
psDialogClose();

ar_orig=_origCommentMap[''+secIdx];
ar_mod=_modifiedCommentMap[''+secIdx];
origVal=ar_orig[id];
val = textArea.val();
if (val != origVal)
  ar_mod[id]=textArea.val();

handleAttDataChanged(isAnyGridDirty(), id, secIdx);
}

function updateCommentIcon(id,secIdx) {

m=editableGrid[secIdx].getModifiedData();
m_orig=_origAttData[secIdx];
attVal = m_orig[id];
if (m[id] !== undefined)
  attVal=m[id];

if (attVal === undefined)
  return;
el = document.getElementById("comment_"+id);
if (el !== undefined && el !== null) {
  comment = getCommentValue(id,secIdx);
  var blueIcon = '/images/seatingchart/icon-comment-lrg-blue.png';
  var greyIcon = '/images/seatingchart/icon-comment-lrg-grey.png';

  if ((comment !== undefined && comment.length > 0) || attVal != '') {
    if (comment !== undefined && comment.length > 0) {
      el.src=blueIcon;
    } else {
      el.src=greyIcon;
    }
    el.style.display='';

  } else {
    el.style.display='none';
  }
}
}

function getCommentValue(id,secIdx) {
ar_orig=_origCommentMap[''+secIdx];
ar_mod=_modifiedCommentMap[''+secIdx];

str=ar_orig[id];
if (ar_mod[id] !== undefined)
  str = ar_mod[id];
return str;
}

function showAttendanceCommentsDialog(id, readOnly, secIdx) {

var str = getCommentValue(id,secIdx);

comment=$j("<div/>").html(str).text();
//alert(str);

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
    click: function () { saveAttendanceComment(secIdx, id, textArea); }
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

function cancelEvent(e) {
if (!e)
  e = window.event;
if ("cancelBubble" in e)
  e.cancelBubble = true;
else if(e.stopPropagation)
  e.stopPropagation();
}

  function calculateGridWidth() {
      if (attCodeMaxLength == 1)
          return (showComments ? 45 : 30);
      else if (attCodeMaxLength == 2)
          return (showComments ? 55 : 35);
      else if (attCodeMaxLength == 3)
          return (showComments ? 65 : 45);
      else if (attCodeMaxLength == 4)
          return (showComments ? 75 : 55);
      else if (attCodeMaxLength == 5)
          return (showComments ? 85 : 65);
      else if (attCodeMaxLength == 6)
          return (showComments ? 95 : 75);
      else if (attCodeMaxLength == 7)
          return (showComments ? 105 : 85);
      else if (attCodeMaxLength == 8)
          return (showComments ? 115 : 95);
      else if (attCodeMaxLength == 9)
          return (showComments ? 125 : 105);
      else if (attCodeMaxLength == 10)
          return (showComments ? 135 : 115);
      else
          return (showComments ? 135 : 115);
  }

  function getSpaceCount() {
      if (attCodeMaxLength == 1) return 14;
      else if (attCodeMaxLength == 2) return 16;
      else if (attCodeMaxLength == 3) return 18;
      else if (attCodeMaxLength == 4) return 20;
      else if (attCodeMaxLength == 5) return 22;
      else if (attCodeMaxLength == 6) return 24;
      else if (attCodeMaxLength == 7) return 28;
      else if (attCodeMaxLength == 8) return 30;
      else if (attCodeMaxLength == 9) return 32;
      else if (attCodeMaxLength == 10) return 34;
      else return 34;
  }

function getPreparedData(sectionIndex, colModel, cur_perId, cur_intNum, firstNonFrozenCol) {
  var cls_stud_arr = sec_cls_stud_arr[sectionIndex];
var cls_stud_id_arr = sec_cls_stud_id_arr[sectionIndex];
var att_arr=sec_cls_att_arr[sectionIndex];
  var att_date_arr=sec_att_date_arr[sectionIndex];

  var mydata = [];
  var myOrigData=[];
  var myperiodId=-1;
  var mycomments=[];
  _origCommentMap[''+sectionIndex]=mycomments;
  _modifiedCommentMap[''+sectionIndex]=[];

  _sectionTodayEnrolledStudentMap[sectionIndex] = 0;

  var absenceMap = [];
  if (absenceCountArray.length>sectionIndex) absenceMap = convertToAttMap(absenceCountArray[sectionIndex]);
  var tardyMap = [];
  if (tardyCountArray.length>sectionIndex) tardyMap = convertToAttMap(tardyCountArray[sectionIndex]);

  var recordCount=0;

      var simpleTextBox = "";
      simpleTextBox = "simpleTextBox" + calculateGridWidth();

  for (var i=0;i<cls_stud_arr.length;i++) {
          var m = new Array();
          var startIdx=1;
          var icol=startIdx;
          var std_id = cls_stud_id_arr[i];
          var absenceVal = absenceMap[std_id];
          if (absenceVal === undefined) absenceVal='-';
          var tardyVal = tardyMap[std_id];
          if (tardyVal === undefined) tardyVal='-';

          var perCol='';

    m['col0']= '<span class="simpleTextBox" style="text-align:left;">'+cls_stud_arr[i]+'</span>';
    m['col1']= '<span id="ida_'+sectionIndex+'_'+std_id+'"  class="simpleTextBox">'+absenceVal+'</span>';
    m['col2']= '<span id="idt_'+sectionIndex+'_'+std_id+'"  class="simpleTextBox">'+tardyVal+'</span>';
    startIdx = 3;
    if (showPeriodsOnGrid)  {
      perCol='colperiod';
      startIdx++;
      m[perCol]='';
    }
    icol=startIdx;
    if (colModel[0].frozen) {
      startIdx = firstNonFrozenCol;
    }


          var perTextArr=[];
          var cellItemCount=0;//count how many items are in a cell so we can set first column properly for frozen column
          var index=0;
          var totalCols = cal_date_arr.length;
          for (var j=0;j<totalCols;j++) {

              var strAtt='';
              if (index < att_date_arr.length && cal_date_arr[j] == att_date_arr[index]) {
          var attr = null;
          if (att_arr != null && att_arr.length>0 && att_arr[i].length > index)
            attr = att_arr[i][index];  //attendance data for this day
          index++;

          if (attr != null && attr.length>0) { // if enrolled


            var attItemCount = 0;
            for (var p=0;p<attr.length;p++) { // each period
              var perRec = attr[p]
              var perId = perRec[0];
              var curEnrollment = perRec[1];
              var onTrack = perRec[2];

              if (curEnrollment) {
                if (j === todayIndex)
                  _sectionTodayEnrolledStudentMap[sectionIndex] = cls_stud_id_arr[i];
              }

              if (cur_perId == perId || cur_perId < 0) {//all or matched
                myperiodId=perId;

                var intCount = perRec.length-1;
                var s='';
                for (var c=3;c<=intCount;c++) { // for each interval of this period
                  var intRec = perRec[c];
                  if (intRec != undefined) {
                    var intervalNum =intRec[0];
                    var ac = intRec[1];
                    var readOnly=intRec[2];
                    if (cur_intNum < 0 || cur_intNum == intervalNum || intervalNum == 0) { // if all, or matched or it's meeting (not interval) then interval num zero

                      var id = sectionIndex+'_'+cls_stud_id_arr[i]+'_'+j+'_'+perId+'_'+intervalNum;
                      if (ac != '') myOrigData[id]=ac;

                      var commentVal = (intRec.length>3 && intRec[3] !== undefined)?intRec[3]: '';

                      var val = ac;
                      var showComment = false;
                      if (val != '' || commentVal != '') showComment = true;
                      if (readOnly) {
                        if (val == '') val = '&nbsp;&nbsp;';
                        val = '('+val+')';
                      }
                      if (val == '') val = (curEnrollment?'&nbsp;':'-');
                      if (!onTrack) val = 'OT';
                      var s1 = '';
                      var editable=false;
                      if (curEnrollment && (!readOnly) && (!viewOnly) && onTrack && (j >= maxPastIndex && j <= maxFutureIndex)) { // editable
                        s1 += '<span id="att_'+id+'"  class="'+simpleTextBox+'" onclick="sa(this,false);"  onmouseover="do_attMouseOver(this);"><span>'+val+'</span>';
                        editable=true;
                        s2='</span>';
                      }
                      else {
                        s1='<span class="'+simpleTextBox+'" onmouseover="do_attMouseOver(this);" >';
                        s1 += '<span>'+val+'</span>';
                      }
                      var strComment = '<img id="comment_'+id+'" style="display:'+(showComment?'':'none') +';" onmouseout="on_mouseout_comment(this);" onmouseover="on_mouseenter_comment(this,\'' + id + '\','+sectionIndex+');" ';
                      if (commentVal != '')
                        strComment += ' class="comment-icon" src="/images/seatingchart/icon-comment-lrg-blue.png" onclick="showAttendanceCommentsDialog(\'' + id + '\', '+readOnly+','+sectionIndex+');cancelEvent(event);"/>';
                      else if (editable || commentVal != '')
                        strComment +=' class="comment-icon" src="/images/seatingchart/icon-comment-lrg-grey.png" onclick="showAttendanceCommentsDialog(\'' + id + '\', '+readOnly+','+sectionIndex+');cancelEvent(event);"/>';
                      else
                        strComment = '';
                      mycomments[id]=commentVal;
                      if (showComments)
                        s1 += strComment;
                      s1 += '</span>';
                      s += s1;

                      if (showPeriodsOnGrid)
                        perTextArr[attItemCount]=getPeriodIntervalText(sectionIndex, perId,intervalNum);

                      attItemCount++;
                    }
                  }
                }

                if (s == '') {
                  // we did not have any intervals, must not be enrolled
                  strAtt = '-';
                  enrld = false;
                  attItemCount++;
                }
                else
                  strAtt += s;

              }
            }
            if (cellItemCount<attItemCount) cellItemCount=attItemCount;
          }
          else {
            strAtt = '-';
          }
              }
              else {
                if (i==0 && colModel.length > (j+startIdx)) {
                  if (colModel[j+startIdx].classes === undefined)
                      colModel[j+startIdx].classes = 'cvInvalid';
                  else {
                    colModel[j+startIdx].classes = colModel[j+startIdx].classes.replace('cvEditNotAllowed','') + ' cvInvalid';
                  }
                }
              }

              if (strAtt === '-') {
                strAtt='<span class="'+simpleTextBox+'" onmouseover="do_attMouseOver(this);" >'+strAtt+'</span>';
              }

              m['col'+icol++]= strAtt; // set attendance values
              recordCount++;
          }

    for (var n=1;n<cellItemCount;n++) {
      m['col0'] += '<span class="'+simpleTextBox+'">&nbsp;</span>';
      m['col1'] += '<span class="'+simpleTextBox+'">&nbsp;</span>';
      m['col2'] += '<span class="'+simpleTextBox+'">&nbsp;</span>';
    }

          if (perTextArr.length>0) {
            s='';
            for (var n=0;n<perTextArr.length;n++)
        s += '<span style="color:#aaa;text-align:left;">'+perTextArr[n]+'</span><br/>';
            m[perCol]=s;
          }

          gridRowItemCount[sectionIndex]=(cellItemCount>0)?cellItemCount:1;

          mydata[i] = m;

        }

        _origAttData[sectionIndex]=myOrigData;
        if (myperiodId == -1 && att_arr.length > 0)
          return null;//since no matching period was found this section we return null
        return mydata;
}




 /* Now setup the jqgrid */
var editableGrid=[];

  function setupGrid(sectionIndex,parentId, captionHtml,width){
        var cls_stud_arr = sec_cls_stud_arr[sectionIndex];
  var cls_stud_id_arr = sec_cls_stud_id_arr[sectionIndex];

        var WEEKS_SUPPORTED=52;
        /* prepare for jqgrid */

        var colNames = [];
  var colModel = [];
  var mydata = [];
        var weekDays = 7;
  if (!showWeekendDays) weekDays=5;

        var i=0

        var colGroups = [];
  var grpCount=0;
  var startCol=3;
  var grpHdrText='';

        freeze = true;

  // Column headers are set in attendance-grid.ftl
  colNames[i]= '<span style="text-align:left;display:block;">'+_Students+' ('+cls_stud_arr.length+')'+'</span>';
  colModel[i]= {name:'col'+i,index:'k'+i, width:160, frozen:freeze, sortable:false,resizable: false};
  i++
  colNames[i]=_AbsentAbb;
  colModel[i]= {name:'col'+i,index:'k'+i, width:20, frozen:freeze, sortable:false,resizable: false};
  i++
  colNames[i]=_TardyAbb;
  colModel[i]= {name:'col'+i,index:'k'+i, width:20, frozen:freeze, sortable:false,resizable: false};

  colGroups[grpCount++] = {startColumnName: 'col1', numberOfColumns: 2, titleText: _Total};

  if (showPeriodsOnGrid) {
    i++;

    var lbl=lbl_periods;
    secId=sectionMap[sectionIndex];
    if (sectionMeetingMap[secId] == 'ATT_ModeInterval') lbl=lbl_intervals;
    colNames[i]=  lbl;
    colModel[i]= {name:'colperiod',index:'k'+i, width:70, frozen:freeze, sortable:false,resizable: false};
    startCol++;
  }


  setMaxPastFutureAllowables();

  for (var j=0;j<cal_date_arr.length;j++) {
    i++;

    if (j == (WEEKS_SUPPORTED*weekDays)) break;

    if (j == 0) grpHdrText=cal_date_arr[0];
    colNames[i]='<button id="massFill_btn_col'+i+'" type="button" onClick="massFillColumn(this,'+Number(i+1)+');" class="massFill">'+ cal_week_arr[j] + '</button>';
    colModel[i]= {name:'col'+i,index:'k'+i, width: calculateGridWidth(), editable:false, sortable:false,resizable: false};

    if ((maxPastIndex < cal_date_arr.length && j < maxPastIndex) || (maxFutureIndex != -1 && j > maxFutureIndex)) {
      if (colModel[i].classes === undefined)
        colModel[i].classes = 'cvEditNotAllowed';
      else
        colModel[i].classes += ' cvEditNotAllowed';
    }

    if (todayIndex == j) {
      if (colModel[i].classes	=== undefined) 	colModel[i].classes = 'cvToday';
      else colModel[i].classes +=' cvToday';
    }

    if ((j%weekDays) == 0) {
      colModel[i].classes =(colModel[i].classes === undefined) ? 'cvWeekDemarcation' : colModel[i].classes + ' cvWeekDemarcation';
      if (j>0) {
        grpHdrText=grpHdrText+' - '+cal_date_arr[j-1];
        colGroups[grpCount++] = {startColumnName: 'col'+startCol, numberOfColumns: weekDays, titleText: grpHdrText};
        startCol=i;
        grpHdrText=cal_date_arr[j];
      }
    }
  }

  if (grpHdrText != '') {
    grpHdrText=grpHdrText+' - '+cal_date_arr[j-1];
    colGroups[grpCount] = {startColumnName: 'col'+startCol, numberOfColumns: weekDays, titleText: grpHdrText};
  }

        // create grid table

  var grid=new EditableGrid();
  editableGrid[sectionIndex]=grid;
  pu=document.getElementsByName('att_attcodelist')[0];
  opt = [];
          var spaceCount = getSpaceCount();
          for (var i = 0; i < pu.options.length; i++) {
              s = pu.options[i].text;
              if (pu.options[i].value === '') {
                  s1 = s;
                  s = '';
                  for (var j = 0; j < spaceCount; j++) {
                      s += '&nbsp;';
                  }
                  s += s1;
              }
              else {
                  n=s.indexOf(' ');
                  if (n>0) {
                      s1 = s.substr(0,n);
                      s2 = trimme(s.substr(n));
                      s = s1;
                      for (var j = 0; j < spaceCount; j++) {
                          s += '&nbsp;';
                      }
                      s += s2;
                  }
              }
              opt[i] = {text:s, value:pu.options[i].value};
          }

          grid.setDropdownOptions(opt);// set dropdown options. this will tell widget to show dropdown with these options
        grid.initGrid(parentId, sectionIndex, captionHtml, colNames, colModel, colGroups,0,width);
        return grid;
     }

      jQuery(document).ready(function (){
        if ($j.cookie === undefined)
          $j.getScript("/scripts/jquery.cookie.js", function () {'use strict';do_pageLoad();});
        else
          do_pageLoad();

      });

      function do_pageLoad() {
        loadingDialog();
  setTimeout(function() {setupGridPage();},50);
    pss_get_texts('psx.js.seatingchart.common', 'psx.js.seatingchart.common.dirty_browser_att');
  $j(window).on('beforeunload', function() {
    if (!_ignoreBeforeUnload && isAnyGridDirty()) {
      closeLoading();
      return pss_text('psx.js.seatingchart.common.dirty_browser_att');
    }
  });
      }

      function toggleCommentShowHide() {
        showComments = !showComments;
        setUICookie(commentCookieName, (showComments?"1":null));
        $j('#id_comment_display').text(showComments?_hideText:_displayText);

        // redraw grid
        $j('#id_grid_parent').empty();
  loadingDialog();
  setTimeout(function() {initGridView();},50);
      }

      function handleCommentDisplayClick() {
        if (isAnyGridDirty()) {
    psConfirm({
      content: $j('<span/>').html(pss_text('psx.js.seatingchart.common.dirty_browser_att')),
      title: pss_text('psx.js.seatingchart.common.dirty_richui_att_title'),
      ok:toggleCommentShowHide,
      cancel:null
    });
  }
  else
    toggleCommentShowHide();
      }

      function setupGridPage() {

          var items = fillPeriodIntervalDropdown();
          if (items<=1) showPeriodsOnGrid=false;//only one period

          if (viewOnly) {
            disableControlsForViewOnly();
          }

          //modify alignment of bottom submit button after period drop down had been added to page.
          var button = $j('#id_grid_submit_btn_top');
          var position = button.position();
          var width = button.width();

  var cookieVal='';
  if ($j && $j.cookie) {
    cookieVal=$j.cookie(commentCookieName);
  }
  if (cookieVal === "1") {
    showComments=true;
    $j('#id_comment_display').text(showComments?_hideText:_displayText);
  }


          setTimeout(function() {initGridView();},50);
      }


      function initGridView() {

  if (sectionMap.length == 0) {
            $j("#id_no_data_found").show();
            $j("#id_grid_submit_btn").hide();
            $j("#id_grid_submit_btn_top").hide();
            closeLoading();
          }
          else {
            $j("#id_no_data_found").hide();
            $j("#id_grid_submit_btn").show();
            $j("#id_grid_submit_btn_top").show();
          }


          x=$j('#id_grid_parent').offset().left;
  var width=$j(window).width()-x;// width to cover rest of the page, due to freeze column we cannot do resize on window resize as it messes up things
          if (isAdmin) {// framed
            width -=220;
          }
          for (var i=0; i<sectionMap.length;i++) {
          var sectionHtml = '';
          if (sectionMap.length>1) {
            n=sectionMap[i];
            sectionHtml = sectionExpMap[''+n];
          }
          _sectionTodayEnrolledStudentMap[i] = 0;

            var grid = setupGrid(i,"id_grid_parent", sectionHtml,width);
            grid.subscribeDataChanged(handleAttDataChanged);
            grid.subscribeTooltip(handleTooltip);
            grid.subscribeAfterLoadComplete();
            grid.subscribeGetDefaultValue(getAttSelection);
            grid.subscribeOnFocus(onGridFocus);
            grid.showDirtyMarks(true);
            refreshGrid(i, -1,-1);

          }

        if (sectionMap.length == 1) {
    $j(window).resize(function() {
      resizeGrid(0);
    }).trigger('resize');
  }
          $j('#jqgh_lgrid0_col0').addClass('textLeft');

  handleAttDataChanged(false);

      }

      function resizeGrid(indx) {

        var cnt=gridRowItemCount[indx];
        var perLb = $j("#selectPeriodInterval")
        if (perLb.options != undefined && perLb.options.length>1 &&  perLb.val() != undefined && perLb.val() != '') cnt=1;

        var rows=editableGrid[indx].getRowCount();
  var hdrHeight=40;
  var rowHeight=20;
        var totalHeight=(rows*cnt*rowHeight)+hdrHeight;
        var h = totalHeight;
        if (sectionMap.length == 1) {
    if (h<120) h=120;
    if (h > 480) h=480;
  }
  else {
    if (h<120 ) h=120;
    if (h > 400) h=400;
  }
  editableGrid[indx].setHeight(h);
      }

      var _focusedGridIndex=0;
      function onGridFocus(indx) {
        _focusedGridIndex=indx;
      }


  function refreshGrid(gridIndex,perId, intNum) {
    var g = editableGrid[gridIndex];
  var colModel = g.getColModel();
  firstNonFrozenCol = g.getFirstNonFrozenCol();
  var mydata = null;
  if (perId >= -1)
    mydata = getPreparedData(gridIndex,colModel,perId, intNum, firstNonFrozenCol);
  if (mydata == null) {
    g.disable();
    closeLoading();
  }
  else {
    g.enable();
    $j("#gbox_lgrid"+gridIndex).show();

    setTimeout(function() {
        loadingDialog();
        g.refreshGrid(mydata,_origAttData[gridIndex]);
        resizeGrid(gridIndex);
        closeLoading();
      },100);


  }
  g.hideColumn('colperiod');
}

function isAnyGridDirty() {
  for (var i=0;i<editableGrid.length;i++) {
    if (editableGrid[i].getModifiedCount() > 0)
      return true;
    var commentmap=_modifiedCommentMap[i];
    var dirtyCount=0;
    for (var key in commentmap) {
      dirtyCount++;
    }
    if (dirtyCount>0)
      return true;
  }

  return false;
}


var _crntPeriodVal = '';
var _perListMap=[];

    function fillPeriodIntervalDropdown() {

      var multiSection = periodIntervalsArray && periodIntervalsArray.length > 1;
      var multiPeriod = false;
      var multiInterval = false;
      $j("#id_tdPeriod").addClass('hide');

      var periodSpan = $j("#id_periodIntervalSpan");
      if (periodSpan === undefined) return 0;

      if (periodIntervalsArray) { // single section
        for (i = 0; i < periodIntervalsArray.length; i++) {
          var section = periodIntervalsArray[i];
          multiPeriod = multiPeriod || section.length > 1;
          if (!multiInterval) {
            for (j = 0; j < section.length; j++) {
              if (section[j].intervals && section[j].intervals.length > 1) {
                multiInterval = true;
                break;
              }
            }
          }
          if (multiPeriod && multiInterval) {
            break;
          }
        }
      }
      var my_label = multiPeriod ? lbl_periods + (multiInterval ? '/' + lbl_intervals : '') : multiInterval ? lbl_intervals : '';

      var lb = $j("#selectPeriodInterval");
      if (lb === undefined) return 0;

      var options = [];
      var uniqueArray = [];

      // only do this if the drop down will be displayed
      if (multiPeriod || multiInterval) {
        // build a map of properties we need to build and sort our option list.
        var option;
    for (var secIndx=0; secIndx<periodIntervalsArray.length; secIndx++) {
      var sectionPeriods = periodIntervalsArray[secIndx];
      for (var i = 0; i < sectionPeriods.length; i++) {
        var sectionPeriod = sectionPeriods[i];
        if (sectionPeriod.intervals && sectionPeriod.intervals.length > 0) {
          for (var j = 0; j < sectionPeriod.intervals.length; j++) {
            var periodInterval = sectionPeriod.intervals[j];
            option = {
                sectionIndex: secIndx,
                periodId: sectionPeriod.periodId,
                periodAbb: multiPeriod ? sectionPeriod.periodAbb : '',
                intervalId: j + 1,
                intervalText: multiInterval ? periodInterval : ''
            };
            var displayText = multiPeriod ? _period_p  + option.periodAbb + (multiInterval ? ' - ' + option.intervalText : '') : option.intervalText;
            option.value = option.sectionIndex + '_' + option.periodId + '_' + option.intervalId
            if ($j.inArray(displayText, uniqueArray) == -1)
            {
              option.displayText = displayText;
              uniqueArray.push(displayText);
              options.push(option);
              _perListMap[displayText] = [option.value];
            } else {
              _perListMap[displayText].push(option.value);
            }
          }
        } else {
          option = {
              sectionIndex: secIndx,
              periodId: sectionPeriod.periodId,
              periodAbb: multiPeriod ? sectionPeriod.periodAbb : '',
              intervalId: 0,
              intervalText: ''
          };
          var displayText = multiPeriod ? _period_p  + option.periodAbb + (multiInterval ? ' - ' + option.intervalText : '') : option.intervalText;
          option.value = option.sectionIndex + '_' + option.periodId + '_' + option.intervalId
          if ($j.inArray(displayText, uniqueArray) == -1)
          {
            option.displayText = displayText;
            uniqueArray.push(displayText);
            options.push(option);
            _perListMap[displayText] = [option.value];
          } else {
            _perListMap[displayText].push(option.value);
          }
        }
      }
    }

    options.sort(function (a, b) {
      var retVal;
      // first check the period as a number, then as a string
      if (parseInt(a.periodAbb) != NaN && parseInt(b.periodAbb) != NaN) {
        retVal = parseInt(a.periodAbb) - parseInt(b.periodAbb);
      } else {
        retVal = a.periodAbb.localeCompare(b.periodAbb);
      }
      if (retVal == 0) {
        // check meeting time
        var aSplit = a.intervalText.split(' ');
        var bSplit = b.intervalText.split(' ');
        if (aSplit.length == 2 && bSplit.length == 2) {
          // check AM vs. PM
          retVal = aSplit[1].localeCompare(bSplit[1]);
          if (retVal == 0) {
            // prepend zero for accurate comparison
            if (aSplit[0].length == 4) {
              aSplit[0] = '0' + aSplit[0];
            }
            if (bSplit[0].length == 4) {
              bSplit[0] = '0' + bSplit[0];
            }
            retVal = aSplit[0].localeCompare(bSplit[0]);
          }
        } else {
          retVal = a.intervalText.localeCompare(b.intervalText);
        }
      }
      return retVal;
    });

    // Now let's build our list of options using jQuery
    lb.append($j('<option/>', {value: '', text: _All}));
    for (var i = 0; i < options.length; i++) {
      var value = options[i].sectionIndex + '_' + options[i].periodId + '_' + options[i].intervalId;
      lb.append($j('<option/>', {value: value, text: options[i].displayText}));
    }
        $j("#lbl_periodIntervals").html(my_label);
        $j("#id_tdPeriod").removeClass('hide');
      } else {
        $j("#id_tdPeriod").addClass('hide');
      }


      lb.change(function() {
    if (isAnyGridDirty()) {
      psConfirm({
        content: $j('<span/>').html(pss_text('psx.js.seatingchart.common.dirty_browser_att')),
        title: pss_text('psx.js.seatingchart.common.dirty_richui_att_title'),
        ok:handle_period_change,
        cancel:cancelPeriodDDChange
      });
    }
    else
      handle_period_change();

  });

      return options.length;
    }

    function cancelPeriodDDChange() {
      $j("#selectPeriodInterval").val(_crntPeriodVal);
    }

    function handle_period_change() {

    var lb = document.getElementById("selectPeriodInterval");
      var val = $j("#selectPeriodInterval").val();
      _crntPeriodVal = val;
      var perId = -1;
      var intNum = -1;
      var secIdx=0;

      if (val != '') {
        var ar = val.split('_');
        secIdx = ar[0];
        perId = ar[1];
        intNum = ar[2];
      }

      s=lb.options[lb.options.selectedIndex].text;
      m=_perListMap[s];

      for (var i=0;i<sectionMap.length;i++) {
        if (m != undefined) {
        var hide=true;
        for (var j=0;j<m.length;j++) {
          var ar = m[j].split('_');
          secIdx = ar[0];
          perId = ar[1];
          intNum = ar[2];
          if (secIdx == i) {
            refreshGrid(i,perId,intNum);
            hide=false;
          }
          if (hide) {// hide grid
            refreshGrid(i,-9,intNum);//put some negative period id so grid is hidden
          }
        }
              }
              else
                refreshGrid(i,perId,intNum);
            }
            if (!isAnyGridDirty())
              handleAttDataChanged(false);
    }


function trimme(v) {return v.replace(/^\s+|\s+$/g, ''); }

  function post_att_data() {

    var fld = $j("#id_hidden_att_data");
    if (fld === undefined) return false;
    var form_data='';
    var index=0;



    for (var i=0;i<editableGrid.length;i++) {
    var tempDataMap = editableGrid[i].getModifiedData();
    var origDataMap=_origAttData[i+''];
    var commentModifiedData=_modifiedCommentMap[''+i];

    var todayMarked = false;
    for (var key in tempDataMap) {
      if (tempDataMap[key] != undefined) {
        ar = key.split('_');
        sec_idx = ar[0];//section index, note we may have to use this to get section id and then setup form (for multiple section handling)
        std_id=ar[1];
        day_index=ar[2];
        per_id=ar[3];
        interval_num=ar[4];
        dt = cal_dates_arr[day_index];

        val = tempDataMap[key];
        comment = getCommentValue(key,i);
        var data = '<input type="hidden" name="gridRecords['+index+'].studentId" value="'+std_id+'">'
              +'<input type="hidden" name="gridRecords['+index+'].date" value="'+dt+'">'
              +'<input type="hidden" name="gridRecords['+index+'].periodId" value="'+per_id+'">'
              +'<input type="hidden" name="gridRecords['+index+'].intervalNumber" value="'+interval_num+'">'
              +'<input type="hidden" name="gridRecords['+index+'].code" value="'+val+'">'
              +'<input type="hidden" name="gridRecords['+index+'].sectionId" value="'+sectionMap[sec_idx+'']+'">';

        if (comment !== undefined)
          data += '<input type="hidden" name="gridRecords['+index+'].comment" value="'+_.escape(comment)+'">';

        form_data += data;

        index++;

        if (day_index == todayIndex)
          todayMarked = true;
      }
    }

    // now setup for comment changes for which att data was not changed
    for (var key in commentModifiedData) {
      ar = key.split('_');
      sec_idx = ar[0];//section index, note we may have to use this to get section id and then setup form (for multiple section handling)
      std_id=ar[1];
      day_index=ar[2];
      per_id=ar[3];
      interval_num=ar[4];
      dt = cal_dates_arr[day_index];

      val = origDataMap[key];
      comment = commentModifiedData[key];
      if (tempDataMap[key] === undefined && comment !== undefined) {
        var data = '<input type="hidden" name="gridRecords['+index+'].studentId" value="'+std_id+'">'
              +'<input type="hidden" name="gridRecords['+index+'].date" value="'+dt+'">'
              +'<input type="hidden" name="gridRecords['+index+'].periodId" value="'+per_id+'">'
              +'<input type="hidden" name="gridRecords['+index+'].intervalNumber" value="'+interval_num+'">'
              +'<input type="hidden" name="gridRecords['+index+'].code" value="'+val+'">'
              +'<input type="hidden" name="gridRecords['+index+'].sectionId" value="'+sectionMap[sec_idx+'']+'">';

        data += '<input type="hidden" name="gridRecords['+index+'].comment" value="'+_.escape(comment)+'">';

        form_data += data;

        index++;
      }
    }

    if (isAdmin === false && todayIndex !== -1 && todayMarked === false) { // if it's teacher and we have today in date range but attendance was not change, so we need to fake one so that attendance taken is marked for today
      var origData = _origAttData[i];
      var studid=_sectionTodayEnrolledStudentMap[i];
      var ids = $j('[id^=att_'+i+'_'+studid+'_]');
      if (ids !== undefined && ids.length>0) {

        for (var n=0;n<ids.length;n++) {
          key = ids[n].id;
          ar = key.split('_');
          sec_idx = ar[1];//section index, note we may have to use this to get section id and then setup form (for multiple section handling)
          std_id=ar[2];
          day_index=ar[3];
          per_id=ar[4];
          interval_num=ar[5];
          dt = attendanceDate;

          if (day_index == todayIndex) {
            var k = key.substr(4);
            var val = origData[k];
            if (val === undefined) val = '';
            if (val !== undefined) {
              var data = '<input type="hidden" name="gridRecords['+index+'].studentId" value="'+std_id+'">'
                  +'<input type="hidden" name="gridRecords['+index+'].date" value="'+dt+'">'
                  +'<input type="hidden" name="gridRecords['+index+'].periodId" value="'+per_id+'">'
                  +'<input type="hidden" name="gridRecords['+index+'].intervalNumber" value="'+interval_num+'">'
                  +'<input type="hidden" name="gridRecords['+index+'].code" value="'+val+'">'
                  +'<input type="hidden" name="gridRecords['+index+'].sectionId" value="'+sectionMap[sec_idx+'']+'">';
              index++;
              form_data += data;
            }
          }
        }
      }
    }
  }


  if (form_data != '') {
    fld.html(form_data);
    return true;
  }

  return false;
  }


function handleAttDataChanged(changed, id, secIdx) {
  if (changed) {
    $j("#id_grid_submit_btn_top").removeAttr('disabled');
    $j("#id_grid_submit_btn").removeAttr('disabled');
    document.getElementById('id_div_savewarning').className='feedback-alert';

    if (id !== undefined && secIdx !== undefined)
      updateCommentIcon(id, secIdx);
  }
  else {
    var enrolled = false;
    for (var i=0;i<_sectionTodayEnrolledStudentMap.length;i++) {
      if (_sectionTodayEnrolledStudentMap[i]>0)
        enrolled=true;
    }

    if (todayIndex === -1 || isAdmin || (!enrolled)) {
      $j("#id_grid_submit_btn_top").attr('disabled', 'disabled');
      $j("#id_grid_submit_btn").attr('disabled', 'disabled');
    }
    document.getElementById('id_div_savewarning').className='hide';
  }
}

function handleSubmitClick() {
          if (!post_att_data()) {
              return false;
          }

          _ignoreBeforeUnload = true;
          document.getElementById('filterDataCommand').value = 'false';

          var fld = $j("#id_hidden_filter_post_data");
          if (fld === undefined) return false;
          var x = getMandatoryHiddenData();
          fld.html(x);

          $j('#att_form_filter').submit();
      }

      function handleMultiSectionClick(meetType, meetMode) {

          var fld = $j("#id_hidden_filter_post_data");
          if (fld === undefined) return false;
          var x = getMandatoryHiddenData(meetType, meetMode);
          fld.html(x);

  try{ // catch to suppress IE unspecified error when canceling the submit
            $j('#att_form_filter').submit();
          }
          catch(e) {}
      }

  function disableControlsForViewOnly() {
    $j("#id_grid_submit_btn_top").attr('disabled', 'disabled');
    $j("#id_grid_submit_btn").attr('disabled', 'disabled');
    $j("select[name='att_attcodelist']").attr('disabled', 'disabled');
  }

  function getAttSelection() {
  pu=document.getElementsByName('att_attcodelist')[0];
  if (pu === undefined) return '';
  b=pu.selectedIndex;
  c=pu[b].value;
  return c;
}

function sa(obj, navigating){
  ar = obj.id.split('_');
  if (_focusedGridIndex != undefined && _focusedGridIndex >= 0 && _focusedGridIndex != ar[1]) {// focus changed to another grid
    //editableGrid[_focusedGridIndex].restoreNormalView(false);// save and restore
    editableGrid[_focusedGridIndex].restore();
  }
  _focusedGridIndex=ar[1];
  editableGrid[_focusedGridIndex].navigateEditor(obj, navigating, getAttSelection());
}

function do_attMouseOver(o) {
  editableGrid[_focusedGridIndex].do_mouseOver(o);
}

function handleTooltip(o) {
  x = o.childNodes[0].innerHTML;
  if (x.indexOf('(') == -1) {
    x = x.replace('&nbsp;','');
    if (x != '') {
      pu=document.getElementsByName('att_attcodelist')[0];
      if (pu != undefined) {
        for (var i=1;i<pu.options.length;i++) {
          if (pu.options[i].value == x) {
            x = pu.options[i].text;
            break;
          }
        }
      }
    }
  }

  key = o.id;
  ar = key.split('_');
  s='';
  if (ar.length>4) {
    var secIndx=ar[1];
    var periodIntervals=periodIntervalsArray[secIndx];
    per_id=ar[4];
    intnum=ar[5];
    if (intnum>0) intnum = intnum-1;
    for (i=0;i<periodIntervals.length;i++) {
      if (periodIntervals[i].periodId == per_id) {
        s=periodIntervals[i].periodAbb;
        if (!isNaN(s))
          s=_period_p+periodIntervals[i].periodAbb;
        if (periodIntervals[i].intervals != undefined && periodIntervals[i].intervals.length>intnum)
          s = s+' '+periodIntervals[i].intervals[intnum];
        x = x+'   '+s;
        break;
      }
    }
  }
  return x;
}

var popup;

function changeDatePopupControlStatus(val, refresh) {
var rTPicker = popup.find('#reportingtermdatepicker');
var fromDatePicker = popup.find('#fromdatepicker');
var toDatePicker = popup.find('#todatepicker');
if (val == 0) {
  rTPicker.attr('disabled', 'disabled');
  fromDatePicker.removeAttr('disabled');
  toDatePicker.removeAttr('disabled');
}
else {
  rTPicker.removeAttr('disabled');
  fromDatePicker.attr('disabled', 'disabled');
  toDatePicker.attr('disabled', 'disabled');
  if (refresh) {
      updatePopupReportingTermRangeText(true);
  }
}

var startDate;
var endDate;
if (val == 0) {
  startDate = new Date(fromDatePicker.val());
  endDate = new Date(toDatePicker.val());
}
else {
  var x = rTPicker.val();
  if(x === undefined) {
      x = 0;
  }
  startDate = new Date(reportingTerms[x].startDate);
  endDate = new Date(reportingTerms[x].endDate);
}

var over60Days = ((endDate - startDate) / 1000 / 60 / 60 / 24 ) > 60;
if (over60Days) {
  $j('#warning-text-box').removeClass('hidden');
}
else {
  $j('#warning-text-box').addClass('hidden');
}
}

function updatePopupReportingTermRangeText() {
var x = popup.find('#reportingtermdatepicker').val();
if(x === undefined) x = 0;
popup.find('#from_text').html(reportingTerms[x].startDate);
popup.find('#to_text').html(reportingTerms[x].endDate);
}

function showDatePicker() {
popup = createPopupDiv();

var adhocStartDate = $j('#filterStartDate').val();
var adhocEndDate = $j('#filterEndDate').val();
popup.find('#fromdatepicker').val(adhocStartDate);
popup.find('#todatepicker').val(adhocEndDate);

var x = $j("#reportingTermType").val();
if(x === undefined || x == -1) {
  x = reportingTerms.length - 2;
  if (x<0) {
      x=0;
  }
}

var select = popup.find('#reportingtermdatepicker');
for (var i=0;i<reportingTerms.length;i++) {
  var option = $j('<option/>', {
      value: i,
      text: reportingTerms[i].name
  });
  select.append(option);
}
select.val(x);

var filterType = $j('#dateRangeFilterType').val();
if (filterType == 0) {
  popup.find('#adhocRadio').attr('checked', true);
}
else {
  popup.find('#reportingTermRadio').attr('checked', true);
}
updatePopupReportingTermRangeText();
changeDatePopupControlStatus(filterType, true);

var myButtons = [
  {
      text: pss_text('psx.ftl.teachers.attendancegrid.popup_update_button'),
      click:function () {
          updateSelectedDateRange();
      }
  },
  {
      text:pss_text('psx.ftl.teachers.attendancegrid.popup_cancel_button'),
      click:function () {
          psDialogClose();
      }
  }
];

psDialog({
  type: 'dialogM',
  title: pss_text('psx.ftl.teachers.attendancegrid.popup_title'),
  content: popup,
  buttons: myButtons
});
}

function updateSelectedDateRange() {
var adhocRadio = popup.find('#adhocRadio');
var reportingTermRadio = popup.find('#reportingTermRadio');

var fromDate = popup.find('#fromdatepicker').val();
var toDate = popup.find('#todatepicker').val();
var reportingTermIndex = popup.find('#reportingtermdatepicker').val();
var filterType;
if (adhocRadio.attr('checked') != undefined) {
  filterType = "0";
}
else if (reportingTermRadio.attr('checked') != undefined) {
  filterType = "1";
  var reportingTerm = reportingTerms[reportingTermIndex];
  fromDate = reportingTerm.startDate;
  toDate = reportingTerm.endDate;
}

var origStart = $j("#filterStartDate").val();
var origEnd = $j("#filterEndDate").val();
var origStartDate = new Date(origStart);
var origEndDate = new Date(origEnd);
var d1 = new Date(fromDate);
var d2 = new Date(toDate);

if (origStartDate.getTime() === d1.getTime() && origEndDate.getTime() === d2.getTime()) {
psDialogClose();
return;
}


$j("#reportingTermType").val(reportingTermIndex);
$j("#filterStartDate").val(fromDate);
$j("#filterEndDate").val(toDate);
$j("#dateRangeFilterType").val(filterType);

psDialogClose();

var fld = $j("#id_hidden_filter_post_data");
if (fld === undefined) return false;
var x = getMandatoryHiddenData();
fld.html(x);
$j("#att_form_filter").attr("action","attendance-grid.action");
$j('#att_form_filter').submit();
}

function createPopupDiv() {
var outerDiv = $j('<div/>', {width: '650px'});
outerDiv.html('' +
  '<div id="warning-text-box" class="feedback-alert hidden">' + pss_text('psx.ftl.teachers.attendancegrid.popup_warning_text') + '</div>' +
  '<h2>' + pss_text('psx.ftl.teachers.attendancegrid.popup_select_dates_to_display') + '</h2>' +
    '<fieldset>' +
          '<div>' +
              '<input id="adhocRadio" type="radio" name="popup_radio" onclick="changeDatePopupControlStatus(0, false)" value="0"><label>' + pss_text('psx.ftl.teachers.attendancegrid.popup_range') + '</label>' +
              '<span>' +
                '<p><label>' + pss_text('psx.ftl.teachers.attendancegrid.popup_from') + '</label>' +
                '<input id="fromdatepicker" class="psDateWidget" type="text" size="10" onchange="changeDatePopupControlStatus(0, false)"></p>' +
                '<p><label>' + pss_text('psx.ftl.teachers.attendancegrid.popup_to') + '</label>' +
                '<input id="todatepicker" class="psDateWidget" type="text" size="10" onchange="changeDatePopupControlStatus(0, false)"></p>' +
              '</span>' +
          '</div>' +
          '<div>' +
              '<input id="reportingTermRadio" type="radio" name="popup_radio" onclick="changeDatePopupControlStatus(1, true)" value="1"><label>' + pss_text('psx.ftl.teachers.attendancegrid.popup_reporting_term') + '</label>' +
              '<span>' +
                '<p><select id="reportingtermdatepicker" onchange="changeDatePopupControlStatus(1, true)" style="margin:0;"></select></p>' +
                '<p><label>' + pss_text('psx.ftl.teachers.attendancegrid.popup_from') + '</label>' +
                '<span id="from_text"></span></p>' +
                '<p><label>' + pss_text('psx.ftl.teachers.attendancegrid.popup_to') + '</label>' +
                '<span id="to_text"></span></p>' +
              '</span>' +
          '</div>' +
      '</fieldset>' +
  '</div>');

return outerDiv;
}

function massFillColumn(col, colNum){
var arr = $j(col).parent().attr('id').split('_');
index = arr[1].split('grid')[1];
editableGrid[index].setMassAttendanceForColumn(colNum);
}

function reset(){
loadingDialog();
refreshGrid(0, -1,-1);
handleAttDataChanged();
closeLoading();
}
