
var $createButton = $('#createButton');
var $createFormContainer = $('#createNewFields');
var $saveButton = $('#saveButton');
var $addButton = $('#addButton');
var $checkJsonButton = $('#jsonPostJsonInput');

var requestTimeout = 3000;

var currentList;

var currentIndex = null;

var newEntry = false;

(function() {
  document.getElementById('createNewFields').style.display = "none";
  document.getElementById('JsonPostFields').style.display = "none";
  //$('#validationFeedbackLabel').hide();

  initData();
  generateLists();

  $('#testResultsContainer').hide();
  $('#getFrame').hide();

  $( "#templateList" )
    .change(function () {
      var selectedID = document.getElementById("templateList").options[document.getElementById("templateList").selectedIndex].id;

      $('#displayedName').val(currentList[selectedID]["name"]);
      $('#httpGetUrlInput').val(currentList[selectedID]["endpoint"]);
      $('#jsonPostJsonInput').val(currentList[selectedID]["json"]);


      $('#GET').removeClass("active");
      $('#PUT').removeClass("active");
      $('#POST').removeClass("active");
      $('#'+currentList[selectedID]["method"]).trigger("click");
      $('#'+currentList[selectedID]["method"]).addClass("active");

    });


})();

function generateTemplates(){
  $('#templateList').empty();
  var newTemplateEntry = document.createElement('option');
  newTemplateEntry.className = 'item-select-option';
  newTemplateEntry.id = "select";
  if (currentList.length == 0 || currentList == null) {
    newTemplateEntry.innerHTML = "No templates to choose from";
  } else { 
    newTemplateEntry.innerHTML = "Select a template";
  }
  $('#templateList').append(newTemplateEntry);
  for (var i=0; i < currentList.length; i++) {
    var newTemplateEntry = document.createElement('option');
    newTemplateEntry.id = i;
    newTemplateEntry.className = 'item-select-option';
    newTemplateEntry.innerHTML = currentList[i]['name'];
    $('#templateList').append(newTemplateEntry);
  }
}

function generateLists(){


  $('.item-draggable-list').empty();
  $('.item.addNewButton').remove();
  for (var i=0; i < currentList.length; i++) {

    // Create a row for the draggable list
    var newDragLabel = document.createElement('label');
    newDragLabel.className = "item";
    newDragLabel.innerHTML = currentList[i]["name"];
    newDragLabel.name = currentList[i]["name"];
    newDragLabel.id = i;

    var newDragHandle = document.createElement('div');
    var newDragHandleBar1 = document.createElement('div');
    var newDragHandleBar2 = document.createElement('div');
    var newDragHandleBar3 = document.createElement('div');

    var newDeleteButton = document.createElement('div');
    var newModifyButton = document.createElement('div');

    newDeleteButton.className = "delete-item";
    newModifyButton.className = "modify";
    
    newDeleteButton.onclick = function deleteLabelOnClick () {
      var indexToDelete = this.parentNode.id;

      console.log("indexToDelete: " + indexToDelete.toString());

      var updatedList = [];
      $('.item-draggable-list').children('label.item').each(function() {
        console.log("Checking: " + this.id.toString());
        if (this.id != indexToDelete) {updatedList.push(currentList[this.id]);}
        else {console.log("Skipping");}
      });
      currentList = updatedList;
      document.getElementById('reorderList').removeChild(this.parentNode);
      console.log(JSON.stringify(currentList));
      generateLists();
      $('.item-draggable-list').children('label.item').each(function() {
        for (var i = 0; i < this.childNodes.length; i++) {
          var currentClass = this.childNodes[i].className;
          if (currentClass == "delete-item") {
            this.childNodes[i].style.visibility = "visible";
          } else if (currentClass == "item-draggable-handle") {
            this.childNodes[i].style.visibility = "hidden";
          } else if (currentClass == "modify") {
            this.childNodes[i].style.visibility = "hidden";
          }
        }
      });
    }

    newModifyButton.onclick = function modifyLabelOnClick () {
      showCreateDisplay(parseInt(this.parentNode.id));
    }

    newDeleteButton.style.visibility = "hidden";
    newDeleteButton.id = "deleteButton"+i.toString();

    newModifyButton.style.visibility = "hidden";
    newModifyButton.id = "modifyButton"+i.toString();


    newDragHandle.className = "item-draggable-handle";
    newDragHandleBar1.className = "item-draggable-handle-bar";
    newDragHandleBar2.className = "item-draggable-handle-bar";
    newDragHandleBar3.className = "item-draggable-handle-bar";

    newDragHandle.appendChild(newDragHandleBar1);
    newDragHandle.appendChild(newDragHandleBar2);
    newDragHandle.appendChild(newDragHandleBar3);

    newDragLabel.appendChild(newDeleteButton);
    newDragLabel.appendChild(newModifyButton);

    newDragLabel.appendChild(newDragHandle);

    $('.item-draggable-list').append(newDragLabel);
    
  }

  var addItemDraggable = document.createElement('div');
  addItemDraggable.className = "item addNewButton";
  addItemDraggable.innerHTML = '<a href="#" onclick="showCreateDisplay(null);">Create a New Request</a>';


  $('.item-draggable-list').parent().append(addItemDraggable);

  // Reload slate to enable dynamic content 

}

function reconcileList() {
  var updatedList = [];
  if (newEntry) {
    updatedList = currentList;
    console.log(updatedList);
    newEntry = false;
  } else if (reorderCompleted()) {
    console.log(updatedList);
    $('.item-draggable-list').children('label.item').each(function() {
      updatedList.push(currentList[this.id]);
    });
  } else {
    updatedList = currentList;
  }
  currentList = updatedList;
}


function initData() {
  if (!(localStorage.getItem("array")===null)) {
    console.log("Found existing list. Loading localStorage.");
    console.log(localStorage['array']);
    currentList = JSON.parse(localStorage['array']);

  } else {
    // This will be the default infomation with example data
    // Useful in helping newcomers learn what type of input is acceptable
    console.log("localStorage is null. Using default data.");
    currentList = [];
    /*[
      {
        "name" : "Example HTTP GET",
        "endpoint": "https://example.com:8080/endpoint", 
        "json": ""
      },
      {
        "name" : "Example JSON POST",
        "endpoint": "https://example.com:8080/jsonendpoint",
        "json": '{"key":"value","key":"value"}'
      },
      {
        "name" : "Example2 JSON POST",
        "endpoint": "https://example2.com:8080/jsonendpoint",
        "json": '{"key":"value","key":"value"}'
      }
    ];*/
  }
  showMainTab();
}
function reorderCompleted() {
  return $( "a[name=tab-2].tab-button.active" ).html() == "Reorder";
}
function createCompleted() {
  return $( "a[name=tab-2].tab-button.active" ).html() == "Create";
}

function jsonSelected() {
  return $( "a[name=tab-1].tab-button.active" ).html() == "POST JSON";
}
function jsonPutSelected() {
  return $( "a[name=tab-1].tab-button.active" ).html() == "PUT JSON";
}

function testHttp() {
  var displayedName = $('#displayedName').val();
  var endpointURL = $('#httpGetUrlInput').val();
  var jsonString = $('#jsonPostJsonInput').val();



  if (displayedName == null || displayedName == "")
  {
      animateRed($('#displayedName').parent());

  } else if (endpointURL == null || endpointURL == "") {
      animateRed($('#httpGetUrlInput').parent());
  } else if ((jsonString == null || jsonString == "") && jsonSelected()) {
      animateRed($('#jsonPostJsonInput'));
  } else {
    $('#testButton').addClass('pendingResponse');
    $('#testButton').val('');
    //console.log("JSON String: " + jsonString);
    //console.log(JSON.parse(jsonString));
    
    if (jsonSelected()) {

  /*
        $.ajax({
        dataType: "jsonp",
        url: "http://api.openweathermap.org/data/2.5/forecast/city",
        jsonCallback: 'jsonp',
    data: { id: "524901", APPID: "da0bd1a46046c9f4d18a3fca969929b1" },
        cache: false,
        success: function (data) {
          alert(JSON.stringify(data));
        }
      });
  */

      $.ajax({
        method: "POST",
        url: endpointURL,
        data: JSON.parse(jsonString),
        dataType: "json",
        success: function(data){
          $('#testResults').html(JSON.stringify(data));
          $('#testResultsContainer').show();
          $('#testButton').removeClass('pendingResponse');
          $('#testButton').val('Test');
          $('html, body').animate({
              scrollTop: $("#testResultsContainer").offset().top
          }, 1000);
        },
        failure: function(errMsg) {
          $('#testResults').html(JSON.stringify(errMsg));
          $('#testResultsContainer').show();
          $('#testButton').removeClass('pendingResponse');
          $('#testButton').val('Test');
          $('html, body').animate({
              scrollTop: $("#testResultsContainer").offset().top
          }, 1000);
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.log(jqXHR);
          var respStatus = jqXHR.status;
          var respText = jqXHR.responseText;
          var respStatusText = jqXHR.statusText;
          var results = respStatus + " " + respStatus + ": " + respText;

          if (respStatus == 0) {
            results = results + " Encountered an error. Make sure Access-Control-Allow-Origin is configured.";
          }

          $('#testResults').html(results);
          $('#testResultsContainer').show();
          $('#testButton').removeClass('pendingResponse');
          $('#testButton').val('Test');
          $('html, body').animate({
              scrollTop: $("#testResultsContainer").offset().top
          }, 1000);
        }
      });
    }
    else if (jsonPutSelected()) {

      var xhr = new XMLHttpRequest();
      xhr.open('PUT', endpointURL);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onload = function() {
        console.log("Received response from server");
          if (xhr.status === 200) {
            $('#testResults').html(JSON.stringify(xhr.responseText));
            $('#testResultsContainer').show();
            $('#testButton').removeClass('pendingResponse');
            $('#testButton').val('Test');
            $('html, body').animate({
                scrollTop: $("#testResultsContainer").offset().top
            }, 1000);
              //var userInfo = JSON.parse(xhr.responseText);
          } else {
            $('#testResults').html(JSON.stringify(xhr.statusText ));
            $('#testResultsContainer').show();
            $('#testButton').removeClass('pendingResponse');
            $('#testButton').val('Test');
            $('html, body').animate({
                scrollTop: $("#testResultsContainer").offset().top
            }, 1000);
          }
      };
      xhr.onreadystatechange = function (oEvent) {  
        console.log("Received response for PUT request");
        if (xhr.readyState === 4) {  
          if (xhr.status === 200) {  
            $('#testResults').html(JSON.stringify(xhr.responseText));
            $('#testResultsContainer').show();
            $('#testButton').removeClass('pendingResponse');
            $('#testButton').val('Test');
            $('html, body').animate({
                scrollTop: $("#testResultsContainer").offset().top
            }, 1000);
          } else if (xhr.status === 0) {
            $('#testResults').html("Encountered an error. Make sure Access-Control headers are configured. " + JSON.stringify(xhr.responseText ));
            $('#testResultsContainer').show();
            $('#testButton').removeClass('pendingResponse');
            $('#testButton').val('Test');
            $('html, body').animate({
                scrollTop: $("#testResultsContainer").offset().top
            }, 1000);
          } else {
            $('#testResults').html("Encountered an error " + JSON.stringify(xhr.responseText ));
            $('#testResultsContainer').show();
            $('#testButton').removeClass('pendingResponse');
            $('#testButton').val('Test');
            $('html, body').animate({
                scrollTop: $("#testResultsContainer").offset().top
            }, 1000);
          } 
        }  
      }; 

      xhr.send(jsonString);
      console.log("Sending Put request: " + jsonString);


      //xhr.send(JSON.stringify({"mode":"signal","state":"on","channel":"tv"}));

    } else {



      $.ajax({
        method: "GET",
        url: endpointURL,
        success: function(data){
          $('#testResults').html(JSON.stringify(data));
          $('#testResultsContainer').show();
          $('#testButton').removeClass('pendingResponse');
          $('#testButton').val('Test');
          $('html, body').animate({
              scrollTop: $("#testResultsContainer").offset().top
          }, 1000);
          //alert(JSON.stringify(data));
        },
        failure: function(errMsg) {
          $('#testResults').html(JSON.stringify(errMsg));
          $('#testResultsContainer').show();
          $('#testButton').removeClass('pendingResponse');
          $('#testButton').val('Test');
          $('html, body').animate({
              scrollTop: $("#testResultsContainer").offset().top
          }, 1000);
        },
        error: function(jqXHR, textStatus, errorThrown) {
          if (jqXHR.status == 0) {
              document.getElementById('getFrame').src = endpointURL;

              $('#testResults').html("Encountered an error. The Access-Control-Allow-Origin header may not be configured.");
              $('#testResultsContainer').show();
              $('#testButton').removeClass('pendingResponse');
              $('#testButton').val('Test');
              $('html, body').animate({
                  scrollTop: $("#testResultsContainer").offset().top
              }, 1000);
          }
        }
      });
    }
  }
}

var isDragging = false;
$("label.item")
.mousedown(function() {
    isDragging = false;
})
.mousemove(function() {
    isDragging = true;
    //alert('asdf');
 })
.mouseup(function() {
    isDragging = false;
});

function verifyJson() {
    var validationLabel = document.getElementById('validationFeedbackLabel');
    console.log("Input : " + $('#jsonPostJsonInput').val());
    if (IsJsonString($('#jsonPostJsonInput').val())) {
      console.log("valid");
      animateGreen($('#jsonPostJsonInput'));
    } else {
      console.log("invalid");
      animateRed($('#jsonPostJsonInput'));
    }
  }

function resetAfterCreation() {
    document.getElementById('createNewFields').style.display = "none";
}

function showReorderDisplay() {
    reconcileList();
    generateLists();
    clearFields();
    document.getElementById('createNewFields').style.display = "none";
    document.getElementById('reorderFields').style.display = "block";
    $('.item-draggable-list').children('label.item').each(function() {
      for (var i = 0; i < this.childNodes.length; i++) {
        var currentClass = this.childNodes[i].className;
        if (currentClass == "delete-item") {
          this.childNodes[i].style.visibility = "hidden";
        } else if (currentClass == "item-draggable-handle") {
          this.childNodes[i].style.visibility = "visible";
        }
      }
    });
    showMainTab();
    $('#removeTab').removeClass("active");
    $('#modifyTab').removeClass("active");
    $('#reorderTab').addClass("active");
    $('#pebbleSaveButton').show();
    $('#pebbleCancelButton').show();
    $('footer').show();
}

function showCreateDisplay(usingIndex) {
    // Show the div that contains user entry fields

    reconcileList();
    generateLists();
    clearFields();

    generateTemplates();


    $('#modifyExistingButton').hide();
    $('#createNewButton').show();

    if (usingIndex != null) {

      currentIndex = usingIndex;

      $('#createNewButton').hide();
      $('#modifyExistingButton').show();

      //$('#'+currentList[usingIndex]["method"]).trigger('click');
      $('#GET').removeClass("active");
      $('#PUT').removeClass("active");
      $('#POST').removeClass("active");
      $('#'+currentList[usingIndex]["method"]).trigger("click");
      $('#'+currentList[usingIndex]["method"]).addClass("active");


      $('#displayedName').val(currentList[usingIndex]["name"]);
      $('#httpGetUrlInput').val(currentList[usingIndex]["endpoint"]);
      $('#jsonPostJsonInput').val(currentList[usingIndex]["json"]);
    }

    document.getElementById('createNewFields').style.display = "block";
    document.getElementById('reorderFields').style.display = "none";

    $('#maintab').hide();
    $('#testResultsContainer').hide();
    $('#pebbleSaveButton').hide();
    $('#pebbleCancelButton').hide();
    $('footer').hide();
}

function showRemoveDisplay() {

    reconcileList();
    generateLists();
    clearFields();

    $('.item-draggable-list').children('label.item').each(function() {
      for (var i = 0; i < this.childNodes.length; i++) {
        var currentClass = this.childNodes[i].className;
        if (currentClass == "delete-item") {
          this.childNodes[i].style.visibility = "visible";
        } else if (currentClass == "item-draggable-handle") {
          this.childNodes[i].style.visibility = "hidden";
        } else if (currentClass == "modify") {
          this.childNodes[i].style.visibility = "hidden";
        }
      }
    });
    $('footer').show();
}

function showModifyDisplay() {

    reconcileList();
    generateLists();
    clearFields();

    generateTemplates();

    document.getElementById('createNewFields').style.display = "none";
    document.getElementById('reorderFields').style.display = "block";

    $('.item-draggable-list').children('label.item').each(function() {
      for (var i = 0; i < this.childNodes.length; i++) {
        var currentClass = this.childNodes[i].className;
        if (currentClass == "modify") {
          this.childNodes[i].style.visibility = "visible";
        } else if (currentClass == "delete-item") {
          this.childNodes[i].style.visibility = "hidden";
        } else if (currentClass == "item-draggable-handle") {
          this.childNodes[i].style.visibility = "hidden";
        }
      }
    });

    showMainTab();
    $('#removeTab').removeClass("active");
    $('#reorderTab').removeClass("active");
    $('#modifyTab').addClass("active");
    $('#pebbleSaveButton').show();
    $('#pebbleCancelButton').show();
    $('footer').show();
}

function clearFields() {
  $('#displayedName').val('');
  $('#httpGetUrlInput').val('');
  $('#jsonPostJsonInput').val('');
}

function modifyExistingEntry() {

  var displayedName = $('#displayedName').val();
  var endpointURL = $('#httpGetUrlInput').val();
  var jsonString = $('#jsonPostJsonInput').val();
  var methodType = $( "a[name=tab-1].tab-button.active" ).attr('id');

  if (displayedName == null || displayedName == "")
  {
      animateRed($('#displayedName').parent());

  } else if (endpointURL == null || endpointURL == "") {
      animateRed($('#httpGetUrlInput').parent());
  } else if ((jsonString == null || jsonString == "") && jsonSelected()) {
      animateRed($('#jsonPostJsonInput'));
  } else {
    if (jsonSelected() || jsonPutSelected()) {
      currentList[currentIndex]["name"] = displayedName;
      currentList[currentIndex]["endpoint"] = endpointURL;
      currentList[currentIndex]["json"] = jsonString;
      currentList[currentIndex]["method"] = methodType;
    } else {
      currentList[currentIndex]["name"] = displayedName;
      currentList[currentIndex]["endpoint"] = endpointURL;
      currentList[currentIndex]["json"] = "";
      currentList[currentIndex]["method"] = methodType;

    }
    newEntry = true;
    showModifyDisplay();
    $('#removeTab').removeClass("active");
    $('#reorderTab').removeClass("active");
    $('#modifyTab').addClass("active");

  }
}

function createNewEntry() {

  var displayedName = $('#displayedName').val();
  var endpointURL = $('#httpGetUrlInput').val();
  var jsonString = $('#jsonPostJsonInput').val();
  var methodType = $( "a[name=tab-1].tab-button.active" ).attr('id');

  if (displayedName == null || displayedName == "")
  {
      animateRed($('#displayedName').parent());

  } else if (endpointURL == null || endpointURL == "") {
      animateRed($('#httpGetUrlInput').parent());
  } else if ((jsonString == null || jsonString == "") && jsonSelected()) {
      animateRed($('#jsonPostJsonInput'));
  } else {
    if (jsonSelected() || jsonPutSelected()) {
      currentList.push({
        "name": displayedName,
        "endpoint": endpointURL,
        "json": jsonString,
        "method": methodType
      });
    } else {
        currentList.push({
        "name": displayedName,
        "endpoint": endpointURL,
        "json": "",
        "method": methodType
      });
    }
    newEntry = true;
    showReorderDisplay();
    $('#modifyTab').removeClass("active");
    $('#removeTab').removeClass("active");
    $('#reorderTab').addClass("active");

  }
}

function sendToPebble() {

}

function sendClose(){

}

  function getConfigData() {
 
    var options = {
      'array': currentList
    };

    // Save for next launch
    localStorage['array'] = JSON.stringify(options['array']);

    console.log('Got options: ' + JSON.stringify(options));
    return options;
  }

  function getQueryParam(variable, defaultValue) {
    var query = location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (pair[0] === variable) {
        return decodeURIComponent(pair[1]);
      }
    }
    return defaultValue || false;
  }

function sendClose(saveChanges) {
  console.log("Sending close");

  if (saveChanges) {
    reconcileList();

    // Set the return URL depending on the runtime environment
    var return_to = getQueryParam('return_to', 'pebblejs://close#');
    document.location = return_to + encodeURIComponent(JSON.stringify(getConfigData()));
  } else {
    var return_to = getQueryParam('return_to', 'pebblejs://close#');
    document.location = return_to;
  }
}


function showMainTab() {
  if (currentList.length > 0) {
    document.getElementById('maintab').style.display = "block";
  } else {
    document.getElementById('maintab').style.display = "none";
  }
}

function showHttpGetForm() {
    document.getElementById('JsonPostFields').style.display = "none";

}

function showJsonPostForm() {
    document.getElementById('JsonPostFields').style.display = "block";
}

function hasClass(element, cls) {
    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}