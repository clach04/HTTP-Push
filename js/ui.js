
var $createButton = $('#createButton');
var $createFormContainer = $('#createNewFields');
var $saveButton = $('#saveButton');
var $addButton = $('#addButton');
var $checkJsonButton = $('#jsonPostJsonInput');

var requestTimeout = 3000;

var currentList;
var newEntry = false;

(function() {
  document.getElementById('createNewFields').style.display = "none";
  document.getElementById('JsonPostFields').style.display = "none";
  //$('#validationFeedbackLabel').hide();

  initData();
  generateLists();

  $('#testResultsContainer').hide();
  $('#getFrame').hide();



})();

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

    newDeleteButton.className = "delete-item";
    newDeleteButton.onclick = function deleteLabelOnClick () {
      document.getElementById('reorderList').removeChild(this.parentNode);
      var updatedList = [];
      $('.item-draggable-list').children('label.item').each(function() {
        updatedList.push(currentList[this.id]);
      });
      currentList = updatedList;
    }
    newDeleteButton.style.visibility = "hidden";
    newDeleteButton.id = "deleteButton"+i.toString();

    newDragHandle.className = "item-draggable-handle";
    newDragHandleBar1.className = "item-draggable-handle-bar";
    newDragHandleBar2.className = "item-draggable-handle-bar";
    newDragHandleBar3.className = "item-draggable-handle-bar";

    newDragHandle.appendChild(newDragHandleBar1);
    newDragHandle.appendChild(newDragHandleBar2);
    newDragHandle.appendChild(newDragHandleBar3);

    newDragLabel.appendChild(newDeleteButton);

    newDragLabel.appendChild(newDragHandle);


    $('.item-draggable-list').append(newDragLabel);
    
  }

  var addItemDraggable = document.createElement('div');
  addItemDraggable.className = "item addNewButton";
  addItemDraggable.innerHTML = '<a href="#" onclick="showCreateDisplay();">Create a New Request</a>';


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
    $('#reorderTab').addClass("active");
    $('#pebbleSaveButton').show();
    $('#pebbleCancelButton').show();
}

function showCreateDisplay() {
    // Show the div that contains user entry fields
    reconcileList();
    generateLists();
    clearFields();
    document.getElementById('createNewFields').style.display = "block";
    document.getElementById('reorderFields').style.display = "none";

    $('#maintab').hide();
    $('#testResultsContainer').hide();
    $('#pebbleSaveButton').hide();
    $('#pebbleCancelButton').hide();
}

function showRemoveDisplay() {

    $('.item-draggable-list').children('label.item').each(function() {
      for (var i = 0; i < this.childNodes.length; i++) {
        var currentClass = this.childNodes[i].className;
        if (currentClass == "delete-item") {
          this.childNodes[i].style.visibility = "visible";
        } else if (currentClass == "item-draggable-handle") {
          this.childNodes[i].style.visibility = "hidden";
        }
      }
    });
}

function clearFields() {
  $('#displayedName').val('');
  $('#httpGetUrlInput').val('');
  $('#jsonPostJsonInput').val('');
}

function createNewEntry() {

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
    if (jsonSelected() || jsonPutSelected()) {
      currentList.push({
        "name": displayedName,
        "endpoint": endpointURL,
        "json": jsonString,
        "method": $( "a[name=tab-1].tab-button.active" ).attr('id')
      });
    } else {
        currentList.push({
        "name": displayedName,
        "endpoint": endpointURL,
        "json": "",
        "method": $( "a[name=tab-1].tab-button.active" ).attr('id')
      });
    }
    newEntry = true;
    showReorderDisplay();
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