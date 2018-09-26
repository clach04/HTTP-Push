/* 
The UI heavily utilizes the nestable javascript library to allow users to drag and drop requests 
into folders. I had no idea that building out folders would be this mindnumbing. The code below
uses html as the datastructure within the nestable DOM. Data extraction is done to translate
folder heirarchy view to the more familiar JSON format. 
*/

var JsAppVersion = "4.0.0";

var $createButton = $('#createButton');
var $createFormContainer = $('#createNewFields');
var $saveButton = $('#saveButton');
var $addButton = $('#addButton');
var $checkJsonButton = $('#jsonPostJsonInput');

var requestTimeout = 3000;
var currentList;
var currentSettings;
var currentIndex = null;
var newEntry = false;

var hamburgerActive = false;

var DEFAULTS_CONTENT_TYPE = {
    "GET": "text/plain",
    "POST": "application/x-www-form-urlencoded",
    "PUT": "application/json"
};


(function() {

    $('#showFolderIconCheckbox').change(function() {
        if (this.checked) {
            alertify.closeLogOnClick(true).logPosition('top right').success("Folder icons enabled");
            currentSettings.showFolderIcon = true;
        } else {
            currentSettings.showFolderIcon = false;
        }
    });

    $('#showStatusBarCheckbox').change(function() {
        if (this.checked) {
            alertify.closeLogOnClick(true).logPosition('top right').success("Status Bar enabled");
            currentSettings.showStatusBar = true;
        } else {
            currentSettings.showStatusBar = false;
        }
    });

    $('#vibeDurationList').on('change', function() {
        alertify.closeLogOnClick(true).logPosition('top right').success("Vibration set to " + $('#vibeDurationList option:selected').text());
        currentSettings.vibration = parseInt(document.getElementById("vibeDurationList").options[document.getElementById("vibeDurationList").selectedIndex].value);
    })


    $('.action-button').on('click', function() {
        $(this).toggleClass('active');
    })

    new Clipboard('.btn');
    new Clipboard('.btcbtn');
    document.getElementById('createNewFields').style.display = "none";
    document.getElementById('JsonPostFields').style.display = "none";
    //$('#validationFeedbackLabel').hide();
    $('.tooltip-background').click(function(e) {
        e.stopPropagation();
    });
    $('.tooltip-background').hide();
    $('.update-background').hide();
    $('.hamburger-img').hide();
    $('.hamburger-label').hide();
    $('#headerAddFields').hide();
    $('#foregroundCloseButton').hide();
    $('#backgroundCloseButton').hide();
    $('#selectedCloseButton').hide();
    $('#statusBarCloseButton').hide();


    $('#backgroundColorPicker').colorPicker({
        animationSpeed: 300,
        opacity: false,
        renderCallback: function($elm, toggled) {
            if (toggled === true) {
                $('#foregroundColorPicker').hide();
                $('#selectedColorPicker').hide();
                $('#statusBarColorPicker').hide();
                disableBackgroundAfter(0, $("#backgroundColorPicker"));
                $('.tooltip-background').show();
                $('.backgroundFrame').each(function() {
                    $(this).css('z-index', '12');
                });

                $('.item-container').not(':hidden').each(function() {
                    $(this).css("pointer-events", "none");
                });

                setTimeout(function() {
                    $('html, body').animate({
                        scrollTop: $("#backgroundCloseButton").position().top - 10
                    }, 0, function() {});
                }, 100);
            } else if (toggled === false) {

                setTimeout(function() {
                    $('#foregroundColorPicker').show();
                    $('#selectedColorPicker').show();
                    $('#statusBarColorPicker').show();
                    $('#backgroundCloseButton').hide(300);
                    $('#foregroundCloseButton').hide(300);
                    $('#selectedCloseButton').hide(300);
                    $('#statusBarCloseButton').hide(300);
                    $('.tooltip-background').hide();
                    $('.backgroundFrame').each(function() {
                        $(this).css('z-index', '1');
                    });

                    document.activeElement.blur();
                    $("input").blur();

                    currentSettings.backgroundColor = rgb2hex($('#backgroundColorPicker').css('background-color'));
                    alertify.closeLogOnClick(true).logPosition('top right').success("Background color saved");
                    enableBackgroundAfter(300);
                }, 200);
            }
        },
        positionCallback: function($elm) {
            var $UI = this.$UI, // this is the instance; this.$UI is the colorPicker DOMElement
                position = $elm.offset(), // $elm is the current trigger that opened the UI
                gap = this.color.options.gap, // this.color.options stores all options
                top = $elm.offset().top + 70,
                left = 15;

            // $UI.appendTo('#somwhereElse');
            // do here your calculations with top and left and then...
            return { // the object will be used as in $('.something').css({...});
                left: left,
                top: top
            }
        }
    });
    $('#foregroundColorPicker').colorPicker({
        animationSpeed: 300,
        opacity: false,
        renderCallback: function($elm, toggled) {
            if (toggled === true) {
                $('#backgroundColorPicker').hide();
                $('#selectedColorPicker').hide();
                $('#statusBarColorPicker').hide();
                disableBackgroundAfter(0, $("#foregroundColorPicker"));
                $('.tooltip-background').show();
                $('.foregroundFrame').each(function() {
                    $(this).css('z-index', '12');
                });
                $('.item-container').not(':hidden').each(function() {
                    $(this).css("pointer-events", "none");
                });
                setTimeout(function() {
                    $('html, body').animate({
                        scrollTop: $("#foregroundCloseButton").position().top - 10
                    }, 0, function() {});
                }, 100);
            } else if (toggled === false) {
                setTimeout(function() {
                    $('#backgroundColorPicker').show();
                    $('#selectedColorPicker').show();
                    $('#statusBarColorPicker').show();
                    $('#backgroundCloseButton').hide(300);
                    $('#foregroundCloseButton').hide(300);
                    $('#selectedCloseButton').hide(300);
                    $('#statusBarCloseButton').hide(300);
                    $('.tooltip-background').hide();
                    $('.foregroundFrame').each(function() {
                        $(this).css('z-index', '1');
                    });
                    document.activeElement.blur();
                    $("input").blur();
                    currentSettings.foregroundColor = rgb2hex($('#foregroundColorPicker').css('background-color'));
                    alertify.closeLogOnClick(true).logPosition('top right').success("Text color saved");
                    enableBackgroundAfter(300);
                }, 200);
            }
        },
        positionCallback: function($elm) {
            var $UI = this.$UI, // this is the instance; this.$UI is the colorPicker DOMElement
                position = $elm.offset(), // $elm is the current trigger that opened the UI
                gap = this.color.options.gap, // this.color.options stores all options
                top = $elm.offset().top + 70,
                left = 15;

            // $UI.appendTo('#somwhereElse');
            // do here your calculations with top and left and then...
            return { // the object will be used as in $('.something').css({...});
                left: left,
                top: top
            }
        }
    });

    $('#selectedColorPicker').colorPicker({
        animationSpeed: 300,
        opacity: false,
        renderCallback: function($elm, toggled) {
            if (toggled === true) {
                $('#foregroundColorPicker').hide();
                $('#backgroundColorPicker').hide();
                $('#statusBarColorPicker').hide();
                disableBackgroundAfter(0, $("#selectedColorPicker"));
                $('.tooltip-background').show();
                $('.selectedFrame').each(function() {
                    $(this).css('z-index', '12');
                });
                $('.item-container').not(':hidden').each(function() {
                    $(this).css("pointer-events", "none");
                });
                $('#settingsPadding').css('padding-bottom', '50px');

                $('html, body').animate({
                    scrollTop: $("#selectedCloseButton").position().top - 10
                }, 500, function() {});
            } else if (toggled === false) {
                setTimeout(function() {
                    $('#foregroundColorPicker').show();
                    $('#backgroundColorPicker').show();
                    $('#statusBarColorPicker').show();
                    $('#backgroundCloseButton').hide(300);
                    $('#foregroundCloseButton').hide(300);
                    $('#selectedCloseButton').hide(300);
                    $('#statusBarCloseButton').hide(300);
                    $('.tooltip-background').hide();
                    $('.selectedFrame').each(function() {
                        $(this).css('z-index', '1');
                    });
                    document.activeElement.blur();
                    $("input").blur();
                    currentSettings.selectedColor = rgb2hex($('#selectedColorPicker').css('background-color'));
                    alertify.closeLogOnClick(true).logPosition('top right').success("Selected color saved");
                    enableBackgroundAfter(300);
                    $('#settingsPadding').css('padding-bottom', '0px');
                }, 200);
            }
        },
        positionCallback: function($elm) {
            var $UI = this.$UI, // this is the instance; this.$UI is the colorPicker DOMElement
                position = $elm.offset(), // $elm is the current trigger that opened the UI
                gap = this.color.options.gap, // this.color.options stores all options
                top = $elm.offset().top + 70,
                left = 15;

            // $UI.appendTo('#somwhereElse');
            // do here your calculations with top and left and then...
            return { // the object will be used as in $('.something').css({...});
                left: left,
                top: top
            }
        }
    });

    $('#statusBarColorPicker').colorPicker({
        animationSpeed: 300,
        opacity: false,
        renderCallback: function($elm, toggled) {
            if (toggled === true) {
                $('#foregroundColorPicker').hide();
                $('#selectedColorPicker').hide();
                $('#backgroundColorPicker').hide();
                disableBackgroundAfter(0, $("#statusBarColorPicker"));
                $('.tooltip-background').show();
                $('.statusBarFrame').each(function() {
                    $(this).css('z-index', '12');
                });
                $('.item-container').not(':hidden').each(function() {
                    $(this).css("pointer-events", "none");
                });
                $('#settingsPadding').css('padding-bottom', '50px');

                $('html, body').animate({
                    scrollTop: $("#statusBarCloseButton").position().top - 10
                }, 500, function() {});
            } else if (toggled === false) {
                setTimeout(function() {
                    $('#foregroundColorPicker').show();
                    $('#selectedColorPicker').show();
                    $('#backgroundColorPicker').show();
                    $('#backgroundCloseButton').hide(300);
                    $('#foregroundCloseButton').hide(300);
                    $('#selectedCloseButton').hide(300);
                    $('#statusBarCloseButton').hide(300);
                    $('.tooltip-background').hide();
                    $('.statusBarFrame').each(function() {
                        $(this).css('z-index', '1');
                    });
                    document.activeElement.blur();
                    $("input").blur();
                    currentSettings.selectedColor = rgb2hex($('#statusBarColorPicker').css('background-color'));
                    alertify.closeLogOnClick(true).logPosition('top right').success("Status Bar color saved");
                    enableBackgroundAfter(300);
                    $('#settingsPadding').css('padding-bottom', '0px');
                }, 200);
            }
        },
        positionCallback: function($elm) {
            var $UI = this.$UI, // this is the instance; this.$UI is the colorPicker DOMElement
                position = $elm.offset(), // $elm is the current trigger that opened the UI
                gap = this.color.options.gap, // this.color.options stores all options
                top = $elm.offset().top + 70,
                left = 15;

            // $UI.appendTo('#somwhereElse');
            // do here your calculations with top and left and then...
            return { // the object will be used as in $('.something').css({...});
                left: left,
                top: top
            }
        }
    });

    $(".more_info").click(function() {
        var $title = $(this).find(".title");
        if (!$title.length) {
            $(this).append('<span class="title">' + $(this).attr("title") + '</span>');
        } else {
            $title.remove();
        }
    });

    /*
    // Supply the number of hearts in the about fields
    $.ajax( {
      type: "GET",
      url: "http://pblweb.com/api/v1/hearts/567af43af66b129c7200002b.json",
      error: function(xhr, statusText) { $('#heartsLabel').html('Oops. Something went wrong.') },
      success: function(msg){ $('#heartsLabel').html(msg["hearts"])}
    });
    */

    $('#testResultsContainer').hide();
    $('#backupFields').hide();
    $('#reportFields').hide();
    $('#aboutFields').hide();
    $('#settingsFields').hide();
    $('#donateFields').hide();
    $('#changelogFields').hide();
    $('#getFrame').hide();
    $('#createNewFolderFields').hide();
    //<img src="/images/folder_demo.gif" dynsrc="/images/folder_demo.gif" loop=infinite alt="Folder and dragging demo">
    $("#update-tooltip").simpletip({
        fixed: true,
        content: '<a style="font-weight: bold;font-size:14px">NEW VERSION AVAILABLE</a><br><a style="color:black;">HTTP-Push has been updated to version 3.1.0. To apply new version, download the HTTP-PUSH app from the Pebble app store.</a><br/><br/><a style="font-weight: bold;font-size:14px">NEW FEATURES</a><br><a style="color:black;"><ul style=\"padding-left:20px\"><li>Vibration length now configurable</li><li>Restore requests from backup</li><li>Report bugs</li><li>View changelogs</li><li>Fixed crashing when request size too large</li><li>Fixed crash when assigning multiple nested folders</li></ul></a>',
        position: [0, '0'],
        persistent: true,
        showEffect: 'slide',
        hideEffect: 'none',
        onShow: function() {
            disableBackgroundAfter(0, null);
            $('.tooltip-background').show();
            $('html, body').animate({
                scrollTop: $("#update-tooltip").position().top - 10
            }, 1000, function() {});
            //this.update('<a style="font-weight: bold;font-size:14px">REORDER LIST</a><br><a style="color:black;">Drag and drop your HTTP requests in the order you want them to appear on your Pebble. Place requests into folders to organize your list. You can also place folders within folders.</a>');
        },
        onHide: function() {
            enableBackgroundAfter(300);
            $('.tooltip-background').hide();
        }
    });

    $("#vibration-tooltip").simpletip({
        fixed: true,
        content: '<a style="font-weight: bold;font-size:14px">VIBRATION LENGTH</a><br><a style="color:black;">Select how long vibrations last when receiving a response from a HTTP request. Select from 100, 300, and 500 milliseconds. Optionally, vibtrations can be disabled by selecting 0 milliseconds.</a>',
        position: [0, '0'],
        persistent: true,
        showEffect: 'slide',
        hideEffect: 'none',
        onShow: function() {
            disableBackgroundAfter(0, null);
            $('.tooltip-background').show();
            $('html, body').animate({
                scrollTop: $("#vibration-tooltip").position().top - 10
            }, 1000, function() {});
        },
        onHide: function() {
            enableBackgroundAfter(300);
            $('.tooltip-background').hide();
        }
    });

    $("#folder-icon-tooltip").simpletip({
        fixed: true,
        content: '<a style="font-weight: bold;font-size:14px">DISPLAY FOLDER ICON</a><br><a style="color:black;">Display a folder icon next in the rows which are folders on your Pebble Watch. This allows users to use visual queues to speed up navigation through the rows.</a>',
        position: [0, '0'],
        persistent: true,
        showEffect: 'slide',
        hideEffect: 'none',
        onShow: function() {
            disableBackgroundAfter(0, null);
            $('.tooltip-background').show();
            $('html, body').animate({
                scrollTop: $("#vibration-tooltip").position().top - 10
            }, 1000, function() {});
        },
        onHide: function() {
            enableBackgroundAfter(300);
            $('.tooltip-background').hide();
        }
    });

    $("#foreground-color-tooltip").simpletip({
        fixed: true,
        content: '<a style="font-weight: bold;font-size:14px">TEXT COLOR ON PEBBLE WATCH</a><br><a style="color:black;">If your Pebble supports color, you can select the text color here. The default value is WHITE. If your Pebble does not support Color, this value is ignored.</a>',
        position: [0, '0'],
        persistent: true,
        showEffect: 'slide',
        hideEffect: 'none',
        onShow: function() {
            disableBackgroundAfter(0, null);
            $('.tooltip-background').show();
            $('html, body').animate({
                scrollTop: $("#foreground-color-tooltip").position().top - 10
            }, 1000, function() {});
        },
        onHide: function() {
            enableBackgroundAfter(300);
            $('.tooltip-background').hide();
        }
    });

    $("#selected-color-tooltip").simpletip({
        fixed: true,
        content: '<a style="font-weight: bold;font-size:14px">SELECTED COLOR ON PEBBLE WATCH</a><br><a style="color:black;">If your Pebble supports color, you can select the selection highlight color here. If your Pebble does not support Color, this value is ignored.</a>',
        position: [0, '0'],
        persistent: true,
        showEffect: 'slide',
        hideEffect: 'none',
        onShow: function() {
            disableBackgroundAfter(0, null);
            $('.tooltip-background').show();
            $('html, body').animate({
                scrollTop: $("#foreground-color-tooltip").position().top - 10
            }, 1000, function() {});
        },
        onHide: function() {
            enableBackgroundAfter(300);
            $('.tooltip-background').hide();
        }
    });

    $("#status-bar-color-tooltip").simpletip({
        fixed: true,
        content: '<a style="font-weight: bold;font-size:14px">STATUS BAR COLOR ON PEBBLE WATCH</a><br><a style="color:black;">If your Pebble supports color, you can select the background color of your status bar. If your Pebble does not support Color, this value is ignored.</a>',
        position: [0, '0'],
        persistent: true,
        showEffect: 'slide',
        hideEffect: 'none',
        onShow: function() {
            disableBackgroundAfter(0, null);
            $('.tooltip-background').show();
            $('html, body').animate({
                scrollTop: $("#status-bar-color-tooltip").position().top - 10
            }, 1000, function() {});
        },
        onHide: function() {
            enableBackgroundAfter(300);
            $('.tooltip-background').hide();
        }
    });

    $("#background-color-tooltip").simpletip({
        fixed: true,
        content: '<a style="font-weight: bold;font-size:14px">BACKGROUND COLOR ON PEBBLE WATCH</a><br><a style="color:black;">If your Pebble supports color, you can select background text color here. The default value is BLACK. If your Pebble does not support Color, this value is ignored.</a>',
        position: [0, '0'],
        persistent: true,
        showEffect: 'slide',
        hideEffect: 'none',
        onShow: function() {
            disableBackgroundAfter(0, null);
            $('.tooltip-background').show();
            $('html, body').animate({
                scrollTop: $("#background-color-tooltip").position().top - 10
            }, 1000, function() {});
        },
        onHide: function() {
            enableBackgroundAfter(300);
            $('.tooltip-background').hide();
        }
    });

    $("#backup-save-tooltip").simpletip({
        fixed: true,
        content: '<a style="font-weight: bold;font-size:14px">SAVE BACKUP DATA</a><br><a style="color:black;">Copy the entire text from the \"COPY DATA\" field and save it to any location. You may save the text to your phone in a notepad, email it to yourself, save it to your server, and so on. The data can be pasted in the \"LOAD DATA\" field later to restore the request list from text. Use the \"Select All\" button to highlight the entire data content.</a>',
        position: [0, '0'],
        persistent: true,
        showEffect: 'slide',
        hideEffect: 'none',
        onShow: function() {
            disableBackgroundAfter(0, null);
            $('.tooltip-background').show();
            $('html, body').animate({
                scrollTop: $("#backup-save-tooltip").position().top - 10
            }, 1000, function() {});
        },
        onHide: function() {
            enableBackgroundAfter(300);
            $('.tooltip-background').hide();
        }
    });


    $("#show-status-bar-tooltip").simpletip({
        fixed: true,
        content: '<a style="font-weight: bold;font-size:14px">DISPLAY STATUS BAR</a><br><a style="color:black;">When enabled, a status bar will appear at the top of your pebble watch. The status bar contains the time.</a>',
        position: [0, '0'],
        persistent: true,
        showEffect: 'slide',
        hideEffect: 'none',
        onShow: function() {
            disableBackgroundAfter(0, null);
            $('.tooltip-background').show();
            $('html, body').animate({
                scrollTop: $("#backup-save-tooltip").position().top - 10
            }, 1000, function() {});
        },
        onHide: function() {
            enableBackgroundAfter(300);
            $('.tooltip-background').hide();
        }
    });

    $("#donate-tooltip").simpletip({
        fixed: true,
        content: '<a style="font-weight: bold;font-size:14px">FOR THE COMMUNITY</a><br><a style="color:black;">Support the developers of HTTP-PUSH. The app is made completely free by the community and for the community. Consider motivating the developers by supplying coffee and beer!</a>',
        position: [0, '0'],
        persistent: true,
        showEffect: 'slide',
        hideEffect: 'none',
        onShow: function() {
            disableBackgroundAfter(0, null);
            $('.tooltip-background').show();
            $('html, body').animate({
                scrollTop: $("#donate-tooltip").position().top - 10
            }, 1000, function() {});
        },
        onHide: function() {
            enableBackgroundAfter(300);
            $('.tooltip-background').hide();
        }
    });
    $("#github-tooltip").simpletip({
        fixed: true,
        content: '<a style="font-weight: bold;font-size:14px">FOLLOW ON GITHUB</a><br><a style="color:black;">Show your support by following the project on Github! This allows developers know people are interested and actively using the application.</a>',
        position: [0, '0'],
        persistent: true,
        showEffect: 'slide',
        hideEffect: 'none',
        onShow: function() {
            disableBackgroundAfter(0, null);
            $('.tooltip-background').show();
            $('html, body').animate({
                scrollTop: $("#github-tooltip").position().top - 10
            }, 1000, function() {});
        },
        onHide: function() {
            enableBackgroundAfter(300);
            $('.tooltip-background').hide();
        }
    });

    $("#content-type-tooltip").simpletip({
        fixed: true,
        content: '<a style="font-weight: bold;font-size:14px">CONTENT TYPE</a><br><a style="color:black;">Choose a Content-Type for your request.<br><br>When <b>application/x-www-form-urlencoded</b> is selected, content in the JSON field is parameterized and placed in the body of the request. For example the JSON input {"a":"b","c":"d"} will be converted to "a=b,c=d" when the request is made.<br><br>Selecting <b>application/json</b> will simply use content of the JSON input field as the body of the request.<br><br>Specify the Content-Type here to override the Content-Type dropbdown below.</a>',
        position: [0, '0'],
        persistent: true,
        showEffect: 'slide',
        hideEffect: 'none',
        onShow: function() {
            disableBackgroundAfter(0, null);
            $('.tooltip-background').show();
            $('html, body').animate({
                scrollTop: $("#content-type-tooltip").position().top - 10
            }, 1000, function() {});
        },
        onHide: function() {
            enableBackgroundAfter(300);
            $('.tooltip-background').hide();
        }
    });

    $("#headers-tooltip").simpletip({
        fixed: true,
        content: '<a style="font-weight: bold;font-size:14px">Headers</a><br><a style="color:black;">Optionally configure custom headers. Headers are added using the method <em>XMLHttpRequest.setRequestHeader(key,val)</em>. Ensure that the endpoint URL is secure before adding authorization headers. Specifying a Content-Type header will override the content-type drop down selection.<br><br>Header values that are created/modified with and existing header name will be appended with a comma to the already-existing header key.</a>',
        position: [0, '0'],
        persistent: true,
        showEffect: 'slide',
        hideEffect: 'slide',
        onShow: function() {
            disableBackgroundAfter(0, null);
            $('.tooltip-background').show();
            $('html, body').animate({
                scrollTop: $("#headers-tooltip").position().top - 10
            }, 1000, function() {});
        },
        onHide: function() {
            enableBackgroundAfter(300);
            $('.tooltip-background').hide();
        }
    });

    $("#header-add").simpletip({
        fixed: true,
        content: '',
        position: [0, '0'],
        persistent: true,
        focus: true,
        hidden: false,
        showEffect: 'slide',
        hideEffect: 'none',
        onShow: function() {
            $('#headerKeyInput').blur();
            disableBackgroundAfter(0, null);
            $('.tooltip-background').show();
            $('html, body').animate({
                scrollTop: $("#header-add").position().top - 10
            }, 1000, function() {});
            //this.update('<a style="font-weight: bold;font-size:14px">REORDER LIST</a><br><a style="color:black;">Drag and drop your HTTP requests in the order you want them to appear on your Pebble. Place requests into folders to organize your list. You can also place folders within folders.</a>');
        },
        onHide: function() {
            enableBackgroundAfter(300);
            $('.tooltip-background').hide();
        }
    });
    //[{"type":"folder","name":"Living Room","list":[{"type":"request","name":"Lights","endpoint":"http://10.0.0.1:8090/livingroomlights","json":"","method":"GET","toDelete":false}],"toDelete":false}]
    $("#backup-load-tooltip").simpletip({
        fixed: true,
        content: '<a style="font-weight: bold;font-size:14px">LOAD BACKUP DATA</a><br><a style="color:black;">Paste the data as text into the \"LOAD DATA\" field and press the \"Load Data\" button to restore your data. An alert will be displayed if the format of the text entered is invalid.</a><br><br><a style="font-weight: bold;font-size:14px">EXAMPLES</a><br><a style="color:black;">[{"type":"folder", "name":"Living Room", "list":[{"type":"request", "name":"Lights", "endpoint":"http://10.0.0.1:8090/livingroomlights", "json":"", "method":"GET", "toDelete":false}], "toDelete":false}]</a>',
        position: [0, '0'],
        persistent: true,
        showEffect: 'slide',
        hideEffect: 'none',
        onShow: function() {
            disableBackgroundAfter(0, null);
            $('.tooltip-background').show();
            $('html, body').animate({
                scrollTop: $("#backup-load-tooltip").position().top - 10
            }, 1000, function() {});
        },
        onHide: function() {
            enableBackgroundAfter(300);
            $('.tooltip-background').hide();
        }
    });

    $("#report-tooltip").simpletip({
        fixed: true,
        content: '<a style="font-weight: bold;font-size:14px">REPORT A BUG</a><br><a style="color:black;">Contact the developer of HTTP-PUSH about any issue you\'ve encountered. Currently the only method to contact the developer is through email. Keep in mind that the more details you can provide about the problem, the easier it is to fix the issue.</a>',
        position: [0, '0'],
        persistent: true,
        showEffect: 'slide',
        hideEffect: 'none',
        onShow: function() {
            disableBackgroundAfter(0, null);
            $('.tooltip-background').show();
            $('html, body').animate({
                scrollTop: $("#report-tooltip").position().top - 10
            }, 1000, function() {});
        },
        onHide: function() {
            enableBackgroundAfter(300);
            $('.tooltip-background').hide();
        }
    });

    $("#reorder-tooltip").simpletip({
        fixed: true,
        content: '<a style="font-weight: bold;font-size:14px">REORDER LIST</a><br><a style="color:black;">Drag and drop your HTTP requests in the order you want them to appear on your Pebble. Place requests into folders to organize your list. You can also place folders within folders.</a><br><br><a style="font-weight: bold;font-size:14px">EXAMPLES</a><br><a id="amazing"></a><img id="reorder-demo">',
        position: [0, '0'],
        persistent: true,
        showEffect: 'slide',
        hideEffect: 'none',
        onShow: function() {
            $('.multi-action').hide();
            disableBackgroundAfter(0, null);
            //$("#reorder-tooltip").css("pointer-events", "auto");
            $('.tooltip-background').show();
            $('html, body').animate({
                scrollTop: $("#reorder-tooltip").position().top - 10
            }, 1000, function() {});
            //this.update('<a style="font-weight: bold;font-size:14px">REORDER LIST</a><br><a style="color:black;">Drag and drop your HTTP requests in the order you want them to appear on your Pebble. Place requests into folders to organize your list. You can also place folders within folders.</a>');
        },
        onHide: function() {
            $('.multi-action').show();
            enableBackgroundAfter(300);
            $('.tooltip-background').hide();
        }
    });

    //Preload the preloader gif


    $("#folder-name-tooltip").simpletip({
        fixed: true,
        content: '<a style="font-weight: bold;font-size:14px">FOLDER DISPLAY NAME</a><br><a style="color:black;">Enter the name of the folder that will be displayed on your pebble. Shorten as necessary so that it fits on your pebble screen. Maximum length is 30 characters.</a><br><br><a style="font-weight: bold;font-size:14px">EXAMPLES</a><br><a style="color:black;">Living Room<br>Kitchen<br>Sound System</a>',
        position: [0, '0'],
        persistent: true,
        showEffect: 'slide',
        hideEffect: 'none',
        onShow: function() {
            disableBackgroundAfter(0, null);
            $('.tooltip-background').show();
            $('html, body').animate({
                scrollTop: $("#folder-name-tooltip").position().top - 10
            }, 1000, function() {});
        },
        onHide: function() {
            enableBackgroundAfter(300);
            $('.tooltip-background').hide();
        }
    });



    $("#v4_0-tooltip").simpletip({
        fixed: true,
        content: '<a style="font-weight: bold;font-size:14px">NEW VERSION AVAILABLE</a><br><a style="color:black;">HTTP-Push has been updated to version 4.0.0. To apply new version, download the HTTP-PUSH app from the Pebble app store.</a><br/><br/><a style="font-weight: bold;font-size:14px">NEW FEATURES</a><br><a style="color:black;"><ul style=\"padding-left:20px\"><li>Customize http headers</li><li>Added DELETE, OPTIONS, HEAD</li><li>Button to copy backups to clipboard</li><li>Watch color support</li><li>Status bar with time</li><li>Minor text fixes</li></ul></a>',
        position: [0, 0],
        persistent: true,
        showEffect: 'slide',
        hideEffect: 'none',
        onShow: function() {
            disableBackgroundAfter(0, null);
            $('.tooltip-background').show();
            $('html, body').animate({
                scrollTop: 0
            }, 1000, function() {});
        },
        onHide: function() {
            enableBackgroundAfter(300);
            $('.tooltip-background').hide();
        }
    });

    $("#template-tooltip").simpletip({
        fixed: true,
        content: '<a style="font-weight: bold;font-size:14px">TEMPLATE SELECTION</a><br><a style="color:black;">Populate the fields below with the values of an existing request. Use this option to avoid having to enter the same values over and over.</a>',
        position: [0, '0'],
        persistent: true,
        showEffect: 'slide',
        hideEffect: 'none',
        onShow: function() {
            disableBackgroundAfter(0, null);
            $('.tooltip-background').show();
            $('html, body').animate({
                scrollTop: $("#template-tooltip").position().top - 10
            }, 1000, function() {});
        },
        onHide: function() {
            enableBackgroundAfter(300);
            $('.tooltip-background').hide();
        }
    });


    $("#request-name-tooltip").simpletip({
        fixed: true,
        content: '<a style="font-weight: bold;font-size:14px">REQUEST DISPLAY NAME</a><br><a style="color:black;">Enter the name of the request that will be displayed on your pebble. Shorten as necessary so that it fits on your pebble screen. Maximum length is 30 characters.</a><br><br><a style="font-weight: bold;font-size:14px">EXAMPLES</a><br><a style="color:black;">Open the Garage Door<br>Feed Fish<br>Volume Up<br>Toggle TV</a>',
        position: [0, '0'],
        persistent: true,
        showEffect: 'slide',
        hideEffect: 'none',
        onShow: function() {
            disableBackgroundAfter(0, null);
            $('.tooltip-background').show();
            $('html, body').animate({
                scrollTop: $("#request-name-tooltip").position().top - 10
            }, 1000, function() {});
        },
        onHide: function() {
            enableBackgroundAfter(300);
            $('.tooltip-background').hide();
        }
    });

    $("#response-notification-tooltip").simpletip({
        fixed: true,
        content: '<a style="font-weight: bold;font-size:14px">NOTIFICATION STYLE</a><br><a style="color:black;">Enable to receive the response content in a fullscreen notification popup on your Pebble watch. If disabled, the response will be displayed under the request name.</a>',
        position: [0, '0'],
        persistent: true,
        showEffect: 'slide',
        hideEffect: 'none',
        onShow: function() {
            disableBackgroundAfter(0, null);
            $('.tooltip-background').show();
            $('html, body').animate({
                scrollTop: $("#request-name-tooltip").position().top - 10
            }, 1000, function() {});
        },
        onHide: function() {
            enableBackgroundAfter(300);
            $('.tooltip-background').hide();
        }
    });

    $("#response-content-tooltip").simpletip({
        fixed: true,
        content: '<a style="font-weight: bold;font-size:14px">RESPONSE CONTENT</a><br><a style="color:black;">Choose the content that is displayed on the Pebble watch after receiving a successful response.</a>',
        position: [0, '0'],
        persistent: true,
        showEffect: 'slide',
        hideEffect: 'none',
        onShow: function() {
            disableBackgroundAfter(0, null);
            $('.tooltip-background').show();
            $('html, body').animate({
                scrollTop: $("#request-name-tooltip").position().top - 10
            }, 1000, function() {});
        },
        onHide: function() {
            enableBackgroundAfter(300);
            $('.tooltip-background').hide();
        }
    });

    $("#server-tooltip").simpletip({
        fixed: true,
        content: '<a style="font-weight: bold;font-size:14px">TROUBLESHOOTING CALLS</a><br><a style="color:black;">Requests made from this page must be <b>CORS</b> compliant. However, calls made from the watch does not. For this reason, calls made from clicking the Test button may fail on the configuration page but work when the request is triggered on the watch itself. If this is the first time testing the request, try saving the request to your Pebble watch and testing it on the watch.<br><br>To allow calls to be testable on the configuration page, make sure the server includes the necessary <b>Access-Control-Allow</b> headers in the response. Also note that the server must be able to handle <b>OPTIONS</b> method type to accept pre-flight calls.</a>',
        position: [0, 0],
        persistent: true,
        showEffect: 'slide',
        hideEffect: 'none',
        onShow: function() {
            disableBackgroundAfter(0, null);
            $('.tooltip-background').show();
            $('html, body').animate({
                scrollTop: 0
            }, 500, function() {});
        },
        onHide: function() {
            enableBackgroundAfter(300);
            $('.tooltip-background').hide();
        }
    });

    $("#request-response-tooltip").simpletip({
        fixed: true,
        content: '<a style="font-weight: bold;font-size:14px">REQUEST RESPONSE SELECTOR</a><br><a style="color:black;">Select the request tab to configure the content of your HTTP Request. Select the response tab to configure how the result of the HTTP request is displayed back onto your Pebble watch.</a>',
        position: [0, '0'],
        persistent: true,
        showEffect: 'slide',
        hideEffect: 'none',
        onShow: function() {
            disableBackgroundAfter(0, null);
            $('.tooltip-background').show();
            $('html, body').animate({
                scrollTop: 0
            }, 1000, function() {});
        },
        onHide: function() {
            enableBackgroundAfter(300);
            $('.tooltip-background').hide();
        }
    });

    $("#request-type-tooltip").simpletip({
        fixed: true,
        content: '<a style="font-weight: bold;font-size:14px">REQUEST TYPE</a><br><a style="color:black;">Select the http method that is used for the request. Methods POST, PUT, DELETE, and OPTIONS includes an additional input field for JSON data.</a>',
        position: [0, '0'],
        persistent: true,
        showEffect: 'slide',
        hideEffect: 'none',
        onShow: function() {
            disableBackgroundAfter(0, null);
            $('.tooltip-background').show();
            $('html, body').animate({
                scrollTop: $("#request-type-tooltip").position().top - 10
            }, 1000, function() {});
        },
        onHide: function() {
            enableBackgroundAfter(300);
            $('.tooltip-background').hide();
        }
    });

    $("#http-response-tooltip").simpletip({
        fixed: true,
        content: '<a style="font-weight: bold;font-size:14px">HTTP RESPONSE</a><br><a style="color:black;">If the server returns a status of 200, the http response body will be pasted below. If the server returns a value other than 200, nothing will be displayed.</a>',
        position: [0, '0'],
        persistent: true,
        showEffect: 'slide',
        hideEffect: 'none',
        onShow: function() {
            disableBackgroundAfter(0, null);
            $('.tooltip-background').show();
            $('html, body').animate({
                scrollTop: $("#request-type-tooltip").position().top - 10
            }, 1000, function() {});
        },
        onHide: function() {
            enableBackgroundAfter(300);
            $('.tooltip-background').hide();
        }
    });

    $("#endpoint-url-tooltip").simpletip({
        fixed: true,
        content: '<a style="font-weight: bold;font-size:14px">REQUEST ENDPOINT URL</a><br><a style="color:black;">An HTTP GET request will be sent to the URL entered above. Ensure that the webserver is listening on the port and context specified.</a><br><br><a style="font-weight: bold;font-size:14px">EXAMPLES</a><br><a style="color:black;">http://1.1.1.1:81/example.aspx<br>http://myhomepage.com/ws.do</a>',
        position: [0, '0'],
        persistent: true,
        showEffect: 'slide',
        hideEffect: 'none',
        onShow: function() {
            disableBackgroundAfter(0, null);
            $('.tooltip-background').show();
            $('html, body').animate({
                scrollTop: $("#endpoint-url-tooltip").position().top - 10
            }, 1000, function() {});
        },
        onHide: function() {
            enableBackgroundAfter(300);
            $('.tooltip-background').hide();
        }
    });

    $("#json-tooltip").simpletip({
        fixed: true,
        content: '<a style="font-weight: bold;font-size:14px">JSON DATA INPUT</a><br><a style="color:black;">Enter the JSON content as a string. Check the formatting of your input by clicking "Check Format". When checking format, the input field will flash green to indicate that the input is valid. Red indicates invalid JSON formatting. Whitespace is ignored.<br><br>Use the format below:<br>{<br>  "key" : "value",<br>  "key" : "value",<br>    ...<br>  }</a><br><br><a style="font-weight: bold;font-size:14px">EXAMPLES</a><br><a style="color:black;">{"mode":"signal","state":"on","channel":"tv"}<br>{"environment":"test","start":true,"device":"tv"}</a>',
        position: [0, '-200'],
        persistent: true,
        showEffect: 'slide',
        hideEffect: 'none',
        onShow: function() {
            disableBackgroundAfter(0, null);
            $('.tooltip-background').show();
            $('html, body').animate({
                scrollTop: $("#json-tooltip").position().top - 210
            }, 1000, function() {});
        },
        onHide: function() {
            enableBackgroundAfter(300);
            $('.tooltip-background').hide();
        }
    });


    $("#templateList")
        .change(function() {
            var selectedID = document.getElementById("templateList").options[document.getElementById("templateList").selectedIndex].id;
            var entryData = extractData(selectedID);

            $('#displayedName').val(entryData["name"]);
            $('#httpGetUrlInput').val(entryData["endpoint"]);
            $('#jsonPostJsonInput').val(entryData["json"]);


            $("#contentTypeList option:contains(" + entryData["contenttype"] + ")").prop('selected', true);

            // per v4.0.0
            // before v4.0.0 there were no headers
            if (entryData["headers"] !== undefined) {
                clearHeaderFields();
                headerArrayToHtml(entryData["headers"]);
            } else {
                clearHeaderFields();
            }

            $("#requestTypeList option:contains(" + entryData["method"] + ")").prop('selected', true);
            if (jsonIncluded()) {
                showJsonPostForm();
            } else {
                showHttpGetForm();
            }

        });

    $("#requestTypeList")
        .change(function() {
            if (jsonIncluded()) {
                showJsonPostForm();
            } else {
                showHttpGetForm();
            }
        });

    /*
    Setting up the DD list
    */

    var updateOutput = function(e) {
        var list = e.length ? e : $(e.target),
            output = list.data('output');
        if (window.JSON) {
            output.val(window.JSON.stringify(list.nestable('serialize'))); //, null, 2));
        } else {
            output.val('JSON browser support required for this demo.');
        }
    };

    // activate Nestable for list 1
    $('#nestable').nestable({
            group: 1,
            noDragClass: 'dd-nodrag',
            expandBtnHTML: '<button class="dd-action" data-action="expand" type="button"><i class="glyphicon glyphicon-chevron-right glyphicon-offset"></i></button>',
            collapseBtnHTML: '<button class="dd-action" data-action="collapse" type="button"><i class="glyphicon glyphicon-chevron-down glyphicon-offset"></i></button>',
            customActions: {
                'remove': function(item, button) {
                    if (item.hasClass('dd-deleted')) {
                        item.data('isDeleted', false).removeClass('dd-deleted');
                        button.html('<i class="glyphicon glyphicon-remove glyphicon-offset"></i>');
                    } else {
                        item.data('isDeleted', true).addClass('dd-deleted');
                        button.html('undo');
                    }
                }
            }
        })
        .on('change', updateOutput);

    var updateList = [];

    // output initial serialised data
    updateOutput($('#nestable').data('output', $('#nestable-output')));

    initData();
    generateLists();

    if (currentList.length < 1) {
        //$("#reorderFields").hide();
        $('#emptyMessageField').show();
    }

})();

function disableBackgroundAfter(ms, exceptThis) {
    setTimeout(function() {
        $('.item-container').not(':hidden').each(function() {
            $(this).css("pointer-events", "none");
        });
        $('.tooltip-background').css("pointer-events", "auto");
        exceptThis.css("pointer-events", "auto");
    }, ms);
}

function enableBackgroundAfter(ms) {

    setTimeout(function() {
        $('.item-container').not(':hidden').each(function() {
            $(this).css("pointer-events", "auto");
        });
        if ($(".cp-color-picker").is(":visible")) {
            $('.cp-color-picker').toggle();
        }
    }, ms);
}

function preload(arrayOfImages) {
    $(arrayOfImages).each(function() {
        $('<img/>')[0].src = this;
        // Alternatively you could use:
        // (new Image()).src = this;
    });
}


function generateRequestList(currentList) {
    var currentLevelList = [];

    for (var i = 0; i < currentList.length; i++) {
        if (currentList[i]["children"] === undefined) { // request
            currentLevelList.push(currentList[i])
        } else { // if folder
            var nextList = generateRequestList(currentList[i]["children"]);
            for (var o = 0; o < nextList.length; o++) {
                currentLevelList.push(nextList[o]);
            }
        }
    }
    return currentLevelList;
}

function generateTemplates() {
    $('#templateList').empty();
    console.log(JSON.stringify($('#nestable').nestable('serialize')));
    var serializedRequestList = generateRequestList($('#nestable').nestable('serialize'));

    console.log(JSON.stringify(serializedRequestList));

    var newTemplateEntry = document.createElement('option');
    newTemplateEntry.className = 'item-select-option';
    newTemplateEntry.id = "select";
    if (currentList.length == 0 || currentList == null) {
        newTemplateEntry.innerHTML = "No templates to choose from";
    } else {
        newTemplateEntry.innerHTML = "Select a template";
    }
    $('#templateList').append(newTemplateEntry);

    for (var i = 0; i < serializedRequestList.length; i++) {
        var newTemplateEntry = document.createElement('option');
        newTemplateEntry.id = serializedRequestList[i]['id'];
        newTemplateEntry.className = 'item-select-option';
        newTemplateEntry.innerHTML = serializedRequestList[i]['name'];
        $('#templateList').append(newTemplateEntry);
    }
}

function generateRequestHtml(entryName, entryId, parentNode, markDeleted) {
    var liClassName = "dd-item dd-nonest";

    if (markDeleted) {
        liClassName = liClassName + " dd-deleted";
    }

    var newLi = document.createElement('li');
    newLi.setAttribute("class", liClassName);
    newLi.setAttribute("data-id", entryId);
    $(newLi).data('name', entryName);

    var newRemoveButton = document.createElement('button');
    newRemoveButton.setAttribute("class", "dd-action pull-right");
    newRemoveButton.setAttribute("type", "button");
    newRemoveButton.setAttribute("data-action", "remove");
    newRemoveButton.setAttribute("title", "Remove");

    var newRemoveIcon = document.createElement('i');
    newRemoveIcon.setAttribute("class", "glyphicon glyphicon-remove glyphicon-offset");

    var newModifyButton = document.createElement('button');
    newModifyButton.setAttribute("class", "dd-action pull-right");
    newModifyButton.setAttribute("type", "button");
    newModifyButton.setAttribute("title", "Modify");

    newModifyButton.onclick = function modifyLabelOnClick() {
        var thisIndex = this.parentNode.getAttribute("data-id");
        showCreateDisplay(thisIndex);
    }

    var newModifyIcon = document.createElement('i');
    newModifyIcon.setAttribute("class", "glyphicon glyphicon-cog glyphicon-offset");

    var newHandle = document.createElement('div');
    newHandle.setAttribute("class", "dd-handle");
    newHandle.innerHTML = entryName;

    if (markDeleted) {
        newRemoveButton.innerHTML = 'undo';
        $(newLi).data('isDeleted', true);
    } else {
        newRemoveButton.appendChild(newRemoveIcon);
    }
    newModifyButton.appendChild(newModifyIcon);

    newLi.appendChild(newRemoveButton);
    newLi.appendChild(newModifyButton);
    newLi.appendChild(newHandle);

    parentNode.append(newLi);

}

function generateFolderHtml(folderName, folderId, parentNode, markDeleted) {
    var liClassName = "dd-item";

    if (markDeleted) {
        liClassName = liClassName + " dd-deleted";
    }

    var newLi = document.createElement('li');
    newLi.setAttribute("class", liClassName);
    newLi.setAttribute("data-id", folderId);

    var newRemoveButton = document.createElement('button');
    newRemoveButton.setAttribute("class", "dd-action pull-right");
    newRemoveButton.setAttribute("type", "button");
    newRemoveButton.setAttribute("data-action", "remove");
    newRemoveButton.setAttribute("title", "Remove");

    var newRemoveIcon = document.createElement('i');
    newRemoveIcon.setAttribute("class", "glyphicon glyphicon-remove glyphicon-offset");

    var newModifyButton = document.createElement('button');
    newModifyButton.setAttribute("class", "dd-action pull-right");
    newModifyButton.setAttribute("type", "button");
    newModifyButton.setAttribute("title", "Modify");

    newModifyButton.onclick = function modifyLabelOnClick() {
        var thisIndex = this.parentNode.getAttribute("data-id");
        showCreateDisplay(thisIndex);
    }

    var newModifyIcon = document.createElement('i');
    newModifyIcon.setAttribute("class", "glyphicon glyphicon-cog glyphicon-offset");

    var newExpandButton = document.createElement('button');
    newExpandButton.setAttribute("class", "dd-action");
    newExpandButton.setAttribute("data-action", "expand");
    newExpandButton.setAttribute("type", "button");
    newExpandButton.setAttribute("id", "custom");

    var newExpandIcon = document.createElement('i');
    newExpandIcon.setAttribute("class", "glyphicon glyphicon-chevron-right glyphicon-offset");

    var newCollapseButton = document.createElement('button');
    newCollapseButton.setAttribute("class", "dd-action");
    newCollapseButton.setAttribute("data-action", "collapse");
    newCollapseButton.setAttribute("type", "button");
    newCollapseButton.setAttribute("id", "custom");

    var newCollapseIcon = document.createElement('i');
    newCollapseIcon.setAttribute("class", "glyphicon glyphicon-chevron-down glyphicon-offset");


    var newFolderIcon = document.createElement('i');
    newFolderIcon.setAttribute("class", "glyphicon glyphicon-folder-open glyphicon-offset");
    newFolderIcon.style = 'padding-left: 5px;';

    var newHandle = document.createElement('div');
    newHandle.setAttribute("class", "dd-handle");
    newHandle.innerHTML = "<i class='glyphicon glyphicon-folder-open glyphicon-offset'></i>" + "    " + folderName;

    var newOl = document.createElement('ol');
    newOl.setAttribute("class", "dd-list");

    if (markDeleted) {
        newRemoveButton.innerHTML = 'undo';
        $(newLi).data('isDeleted', true);
    } else {
        newRemoveButton.appendChild(newRemoveIcon);
    }

    newModifyButton.appendChild(newModifyIcon);


    newExpandButton.appendChild(newExpandIcon);
    newCollapseButton.appendChild(newCollapseIcon);

    newLi.appendChild(newRemoveButton);
    newLi.appendChild(newModifyButton);

    newLi.appendChild(newExpandButton);
    newLi.appendChild(newCollapseButton);

    newLi.appendChild(newHandle);
    newLi.appendChild(newOl);

    //newHandle.appendChild(newFolderIcon);

    parentNode.append(newLi);


    return $(newOl);

}

function generateList(parentNode, nextList, ddIndex) {

    for (var i = 0; i < nextList.length; i++) {
        var markDelete = nextList[i]["toDelete"];
        if (nextList[i]["type"] == null || //If null, mean's it's before folders 
            nextList[i]["type"] == 'request') { //feature was added. And should be 
            //treated as a request
            //createListHtml(nextList[i]["name"],i);
            generateRequestHtml(nextList[i]["name"], (ddIndex ? ddIndex + "-" : "") + i.toString(), parentNode, markDelete);
        } else if (nextList[i]["type"] == 'folder') {
            var nextRoot = null;
            if (nextList[i]["list"] === undefined || nextList[i]["list"] == []) {
                nextRoot = generateFolderHtml(nextList[i]["name"], (ddIndex ? ddIndex + "-" : "") + i.toString(), parentNode, markDelete);
            } else {
                nextRoot = generateFolderHtml(nextList[i]["name"], (ddIndex ? ddIndex + "-" : "") + i.toString(), parentNode, markDelete);
            }

            $('button[data-action=expand]').hide();
            //$('button[data-action=collapse]').hide();

            //createListHtml("(Folder) " + nextList[i]["name"],i);
            var nestedList = nextList[i]["list"];

            console.log("going to consume folder content: " + JSON.stringify(nestedList));

            generateList(nextRoot, nestedList, (ddIndex ? ddIndex + "-" : "") + i.toString());
        }
    }
}

function generateLists() {

    var rootNode = $('#dd-root');

    rootNode.empty();
    $('.item.addNewButton').remove();

    console.log("Current List at Root!:")
    console.log(JSON.stringify(currentList));

    generateList(rootNode, currentList, "");

    // Reload slate to enable dynamic content 

}

function extractData(indexString) {
    var indexArray = indexString.split("-");
    var currentListIndex = JSON.parse(JSON.stringify(currentList));

    for (var i = 0; i < indexArray.length; i++) {
        if (currentListIndex["type"] == "folder") {
            currentListIndex = currentListIndex["list"][parseInt(indexArray[i])];
        } else {
            currentListIndex = currentListIndex[parseInt(indexArray[i])];
        }
    }

    //console.log("Extract returning: " + JSON.stringify(currentListIndex));
    return currentListIndex;
}

function extractDataReference(indexString) {
    var indexArray = indexString.split("-");
    var currentListIndex = currentList;

    for (var i = 0; i < indexArray.length; i++) {
        if (currentListIndex["type"] == "folder") {
            currentListIndex = currentListIndex["list"][parseInt(indexArray[i])];
        } else {
            currentListIndex = currentListIndex[parseInt(indexArray[i])];
        }
    }

    //console.log("Extract returning: " + JSON.stringify(currentListIndex));
    return currentListIndex;
}

function reconcileFolder(nextList, purgeDeleted) {

    var currentLevelList = []

    for (var i = 0; i < nextList.length; i++) {

        var currentId = nextList[i]["id"].toString();
        var currentChild = nextList[i]["children"];
        var currentNode = $("li[data-id='" + currentId + "']");

        var markedForDeletion = (nextList[i]["isDeleted"] == undefined) ? false : nextList[i]["isDeleted"];

        if (purgeDeleted && markedForDeletion) {
            continue;
        }

        console.log("Evaluating: " + currentId.toString());
        console.log(" and CurrentList: " + JSON.stringify(currentList));

        if (currentNode.hasClass('dd-nonest')) { // Request
            //currentLevelList.push(dataListLevel[currentId]);
            console.log("Extracting request: " + JSON.stringify(extractData(currentId)));
            var currentListToHTML = extractData(currentId);
            currentListToHTML["toDelete"] = markedForDeletion;
            currentLevelList.push(currentListToHTML);
        } else { // Folder

            // Get previous state of currentList
            var tempFolder = extractData(currentId);
            tempFolder["toDelete"] = markedForDeletion;
            console.log("tempFolder: " + JSON.stringify(tempFolder));

            // Recurse thru child
            console.log("child: " + JSON.stringify(currentChild));
            if (currentChild == undefined || currentChild == []) {
                tempFolder["list"] = [];
            } else {

                tempFolder["list"] = reconcileFolder(currentChild, purgeDeleted);
            }
            console.log("tempFolder[\"list\"]: " + JSON.stringify(tempFolder["list"]));
            currentLevelList.push(tempFolder);
            //currentList[currentId]["list"] = reconcileFolder(nextList[i]["children"],dataListLevel[i]["list"]);
            //currentLevelList.push(dataListLevel[currentId]);
        }
    }
    console.log(" returning currentLevelist: " + JSON.stringify(currentLevelList));
    return currentLevelList;
}

function reconcileList(purgeDeleted) {
    var updatedList = [];
    var iteratingFolder = false;
    var currentFolder = null;
    if (newEntry) {
        updatedList = currentList;
        newEntry = false;
    } else {
        var serializedList = $('#nestable').nestable('serialize');
        console.clear();
        console.log(" === Serialized before: " + JSON.stringify(serializedList));
        console.log(" === Currentlist before: " + JSON.stringify(currentList));
        updatedList = reconcileFolder(serializedList, purgeDeleted);
    }
    currentList = updatedList;
    console.log(" === Currentlist after: " + JSON.stringify(currentList));



    if (currentList.length == 0) {
        if ($('#reorderFields').is(":visible")) $('#reorderFields').hide();
        $('#emptyMessageField').show();
    } else {
        if (!$('#reorderFields').is(":visible")) $('#reorderFields').show();
        $('#emptyMessageField').hide();
    }

}

function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}

function colorsDisabled() {

    return getURLParameter("color") == "false";
}

function disableColorPickers() {
    $('#colorPickerFields').hide();
}

function initData() {

    currentSettings = localStorage.settings;
    console.log("localStorage.settings: " + currentSettings);

    if (colorsDisabled()) {
        disableColorPickers();
    }

    // if localStorage is null, check http localStorage
    // if http localStorage is null, start new
    if (currentSettings === null || currentSettings === undefined) {
        currentSettings = {};
        currentSettings.vibration = 100;
        currentSettings.selectedColor = "A12E37"
        currentSettings.foregroundColor = "FFFFFF"
        currentSettings.backgroundColor = "FFFFFF"
        currentSettings.statusBarColor = "A12E37"
        $('#backgroundColorPicker').css("background-color", "#" + currentSettings.backgroundColor);
        $('#foregroundColorPicker').css("background-color", "#" + currentSettings.foregroundColor);
        $('#selectedColorPicker').css("background-color", "#" + currentSettings.selectedColor);
        $('#statusBarColorPicker').css("background-color", "#" + currentSettings.statusBarColor);

        $('#backgroundColorPicker').val("#" + currentSettings.backgroundColor);
        $('#foregroundColorPicker').val("#" + currentSettings.foregroundColor);
        $('#selectedColorPicker').val("#" + currentSettings.selectedColor);
        $('#statusBarColorPicker').val("#" + currentSettings.statusBarColor);

        localStorage.settings = JSON.stringify(currentSettings);

    } else {
        currentSettings = JSON.parse(currentSettings);
        switch (currentSettings.vibration) {
            case 100:
                document.getElementById("vibeDurationList").selectedIndex = 0;
                break;
            case 300:
                document.getElementById("vibeDurationList").selectedIndex = 1;
                break;
            case 500:
                document.getElementById("vibeDurationList").selectedIndex = 2;
                break;
            case 0:
                document.getElementById("vibeDurationList").selectedIndex = 3;
                break;
            default:
                document.getElementById("vibeDurationList").selectedIndex = 0;
        }
        if (currentSettings.backgroundColor) {
            $('#backgroundColorPicker').css("background-color", "#" + currentSettings.backgroundColor);
            $('#backgroundColorPicker').val("#" + currentSettings.backgroundColor);
        } else {
            $('#backgroundColorPicker').css("background-color", "#FFFFFF");
            $('#backgroundColorPicker').val("#FFFFFF");
        }
        if (currentSettings.foregroundColor) {
            $('#foregroundColorPicker').css("background-color", "#" + currentSettings.foregroundColor);
            $('#foregroundColorPicker').val("#" + currentSettings.foregroundColor);
        } else {
            $('#foregroundColorPicker').css("background-color", "#FFFFFF");
            $('#foregroundColorPicker').val("#FFFFFF");
        }
        if (currentSettings.selectedColor) {
            $('#selectedColorPicker').css("background-color", "#" + currentSettings.selectedColor);
            $('#selectedColorPicker').val("#" + currentSettings.selectedColor);
        } else {
            $('#selectedColorPicker').css("background-color", "#A12E37");
            $('#selectedColorPicker').val("#A12E37");
        }
        if (currentSettings.statusBarColor) {
            $('#statusBarColorPicker').css("background-color", "#" + currentSettings.statusBarColor);
            $('#statusBarColorPicker').val("#" + currentSettings.statusBarColor);
        } else {
            $('#statusBarColorPicker').css("background-color", "#A12E37");
            $('#statusBarColorPicker').val("#A12E37");
        }
        if (currentSettings.showFolderIcon) {
            $('#showFolderIconCheckbox').prop('checked', currentSettings.showFolderIcon);
        } else {
            $('#showFolderIconCheckbox').prop('checked', false);
        }
        if (currentSettings.showStatusBar) {
            $('#showStatusBarCheckbox').prop('checked', currentSettings.showStatusBar);
        } else {
            $('#showStatusBarCheckbox').prop('checked', false);
        }
    }


    var visitedVersion = localStorage.getItem(JsAppVersion);
    var isFirstTimeSeeingCurrentUpdate = visitedVersion === null;

    if (isFirstTimeSeeingCurrentUpdate) {
        localStorage[JsAppVersion] = "oh hai mark";
        $("#v4_0-tooltip").click();
    }

    if (!(localStorage.getItem("array") === null)) {
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

    if (currentList.length == 0) {
        if ($('#reorderFields').is(":visible")) $('#reorderFields').hide();
    } else {
        if (!$('#reorderFields').is(":visible")) $('#reorderFields').show();
    }
}

function jsonIncluded() {
    var currentRequestType = $('#requestTypeList option:selected').text();
    return (
        currentRequestType == "POST" ||
        currentRequestType == "PUT" ||
        currentRequestType == "DELETE" ||
        currentRequestType == "OPTIONS"
    );
}

function clickRequestTab() {
    $('#Response').removeClass("active");
    $('#Request').trigger("click");
    $('#Request').addClass("active");
}

function testHttp() {
    $('#testResults').html('');
    $('#testResultsContainer').slideUp("500");
    var displayedName = $('#displayedName').val();
    var endpointURL = $('#httpGetUrlInput').val();
    var jsonString = $('#jsonPostJsonInput').val();
    var contentType = $('#contentTypeList option:selected').text();
    var method = $('#requestTypeList option:selected').text();
    var headers = headerHtmlToArray();

    console.log("HEADERS:");
    console.log(JSON.stringify(headers));

    var xhr = new XMLHttpRequest();
    xhr.open(method, endpointURL, true);
    xhr.timeout = 10000;

    var overrideContentType = false;

    // append all the headers in the request
    for (var i = 0; i < headers.length; i++) {
        for (var key in headers[i]) {
            key = key.trim();
            val = headers[i][key].trim();
            if (key && val) {
                console.log("Setting header: " + key + ": " + val);
                xhr.setRequestHeader(key, val);
            }
            if (key.toLowerCase() == "content-type") {
                overrideContentType = true;
            }
        }
    }

    if (endpointURL == null || endpointURL == "") {
        clickRequestTab();
        alertify.closeLogOnClick(true).logPosition('top right').error("Endpoint URL must be specified");
        animateRed($('#httpGetUrlInput').parent());
    } else if ((jsonString == null || jsonString == "") && jsonIncluded()) {
        clickRequestTab();
        alertify.closeLogOnClick(true).logPosition('top right').error("JSON empty! Try \"{}\" if you want an empty JSON");
        animateRed($('#jsonPostJsonInput'));
    } else if (jsonIncluded() && !verifyJson($('#jsonPostJsonInput').val(), true)) {
        clickRequestTab();
        animateRed($('#jsonPostJsonInput'));
        //animateRed($('#jsonPostJsonInput'));

    } else {
        $('#testButton').addClass('pendingResponse');
        $('#testButton').val('');

        if (jsonIncluded()) {
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    console.log("Received response from POST:")
                    console.log(JSON.stringify(xhr.responseText));

                    if (xhr.status == 200) {
                        console.log("Successful request made");
                        alertify.closeLogOnClick(true).logPosition('top right').success("Server returned a promising response");
                        var responseText = JSON.stringify(xhr.responseText);
                        if (responseText == "") {
                            $('#testResults').html("<em>Empty Response</em>");
                        } else {
                            $('#testResults').text(JSON.stringify(xhr.responseText));
                        }
                        $('#testResultsContainer').show();
                        $('html, body').animate({
                            scrollTop: $("#testResultsContainer").offset().top
                        }, 1000);
                    } else {
                        alertify.closeLogOnClick(true).closeLogOnClick(true).logPosition('top right').error("Server returned an error<br><b>Click here</b> for tips", function(ev) {

                            //$("#endpoint-url-tooltip").show();

                            // The click event is in the
                            // event variable, so you can use
                            // it here.
                            ev.preventDefault();
                            $('#server-tooltip').click();

                        });
                    }
                    $('#testButton').removeClass('pendingResponse');
                    $('#testButton').val('Test');
                }
            };


            if (contentType == "application/x-www-form-urlencoded") {
                // converts json body to a parameterized string
                // example: {'a':'b','c':'d'} => "a=b&c=d"
                // this is prone to runtime error since this behavior is particular to this app
                var strToJson = JSON.parse(jsonString);
                jsonString = Object.keys(strToJson).map(function(k) {
                    return encodeURIComponent(k) + '=' + encodeURIComponent(strToJson[k])
                }).join('&');
                console.log("XMLHttpRequest sending parameterized json: " + jsonString);
            } else {
                console.log("XMLHttpRequest sending json: " + jsonString);
            }


            if (!overrideContentType) {
                xhr.setRequestHeader('Content-Type', contentType);
            }

            try {
                xhr.send(jsonString);
            } catch (err) {
                $('#testResults').html(JSON.stringify(err));
                $('#testResultsContainer').show();
                $('#testButton').removeClass('pendingResponse');
                $('#testButton').val('Test');
                $('html, body').animate({
                    scrollTop: $("#testResultsContainer").offset().top
                }, 1000);
                console.log("Error sending XMLHttpRequest: " + JSON.stringify(err));
            }

        } else { // GET and HEAD
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    console.log("Received response from GET:")
                    console.log(JSON.stringify(xhr.responseText));

                    if (xhr.status == 200) {
                        console.log("Successful request made");
                        alertify.closeLogOnClick(true).logPosition('top right').success("Server returned a promising response");
                        var responseText = JSON.stringify(xhr.responseText);
                        if (responseText == "") {
                            $('#testResults').html("<em>Empty Response</em>");
                        } else {
                            $('#testResults').text(JSON.stringify(xhr.responseText));
                        }
                        $('#testResultsContainer').show();
                        $('html, body').animate({
                            scrollTop: $("#testResultsContainer").offset().top
                        }, 1000);
                    } else {
                        alertify.closeLogOnClick(true).logPosition('top right').error("Server returned an error<br><b>Click here</b> for tips", function(ev) {

                            $('#server-tooltip').click();
                            //$("#endpoint-url-tooltip").show();

                            // The click event is in the
                            // event variable, so you can use
                            // it here.
                            ev.preventDefault();

                        });
                    }
                    $('#testButton').removeClass('pendingResponse');
                    $('#testButton').val('Test');
                }
            };

            if (!overrideContentType) {
                xhr.setRequestHeader('Content-Type', contentType);
            }

            try {
                xhr.send(null);
            } catch (err) {
                $('#testResults').html(JSON.stringify(err));
                $('#testResultsContainer').show();
                $('#testButton').removeClass('pendingResponse');
                $('#testButton').val('Test');
                $('html, body').animate({
                    scrollTop: $("#testResultsContainer").offset().top
                }, 1000);
                console.log("Error sending XMLHttpRequest: " + JSON.stringify(err));
            }

            /*

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
                  });*/
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

function verifyJson(jsonString, notify) {
    var validationLabel = document.getElementById('validationFeedbackLabel');
    console.log("Input : " + jsonString);
    if (IsJsonString(jsonString)) {
        console.log("valid");
        if (notify) {
            alertify.closeLogOnClick(true).logPosition('top right').success("Valid JSON");
        }
        return true;
        //animateGreen($('#jsonPostJsonInput'));
    } else {
        console.log("invalid");
        if (notify) {
            alertify.closeLogOnClick(true).logPosition('top right').error("Invalid JSON");
        }
        //animateRed($('#jsonPostJsonInput'));
        return false;
    }
}

function resetAfterCreation() {
    document.getElementById('createNewFields').style.display = "none";
}


function showReorderDisplay() {
    reconcileList(false);
    generateLists();
    clearFields();
    summonFAB();
    document.getElementById('createNewFields').style.display = "none";
    document.getElementById('createNewFolderFields').style.display = "none";

    $('#pebbleSaveButton').show();
    $('#hamburger-menu').show();
    closeHamburger();
    $('footer').show();

    if (currentList.length == 0) {
        $('#emptyMessageField').hide();
    }
}


function showCreateFolderDisplay() {
    dismissFAB();
    reconcileList(false);
    generateLists();
    clearFields();

    $('#modifyExistingFolderButton').hide();
    $('#createNewFolderButton').show();
    $('#createNewFolderFields').show();

    document.getElementById('reorderFields').style.display = "none";

    $('#testResultsContainer').hide();
    $('#pebbleSaveButton').hide();
    $('#hamburger-menu').hide();
    $('footer').hide();
    $('#emptyMessageField').hide();
}

function clearHamburgerDisplay() {

    $('#aboutFields').hide();
    $('#settingsFields').hide();
    $('#donateFields').hide();
    $('#reportFields').hide();
    $('#changelogFields').hide();
    $('#backupFields').hide();
}

function showHamburgerDisplay(option) {

    if (option == "backup") {
        reconcileList(false);
        generateLists();
    }

    clearFields();
    dismissFAB();

    // load field with data
    $('#saveData').val(JSON.stringify(generateBackupString()));

    $('#modifyExistingFolderButton').hide();
    clearHamburgerDisplay();
    $('#' + option + 'Fields').show();

    document.getElementById('reorderFields').style.display = "none";

    $('#testResultsContainer').hide();
    $('#pebbleSaveButton').hide();
    $('#emptyMessageField').hide();
    $('footer').hide();

}


function generateBackupString() {

    var compiledLocalstorage = {};

    if (currentList) { compiledLocalstorage.array = currentList; }
    if (currentSettings) { compiledLocalstorage.settings = currentSettings; }

    return compiledLocalstorage;

}


function showCreateDisplay(usingIndex) {
    // Show the div that contains user entry fields

    dismissFAB();
    reconcileList(false);
    generateLists();

    var isRequest = false;

    if (usingIndex == null || usingIndex === undefined) {
        isRequest = true;
    } else {
        usingIndex = extractDataReference(usingIndex);
        if (usingIndex["type"] == "request") {
            isRequest = true;
        }
    }

    clearFields();
    generateTemplates();


    if (usingIndex != null) { // modifying

        currentIndex = usingIndex;
        currentType = usingIndex["type"];

        $('#createNewButton').hide();
        $('#createNewFolderButton').hide();
        $('#modifyExistingButton').show();
        $('#modifyExistingFolderButton').show();

        if (currentType == "folder") {

            $('#folderDisplayedName').val(usingIndex["name"]);

        } else if (currentType = "request") {

            $("#requestTypeList option:contains(" + usingIndex["method"] + ")").prop('selected', true);
            if (jsonIncluded()) {
                showJsonPostForm();
            } else {
                showHttpGetForm();
            }

            $('#displayedName').val(usingIndex["name"]);
            $('#httpGetUrlInput').val(usingIndex["endpoint"]);
            $('#jsonPostJsonInput').val(usingIndex["json"]);

            // per v4.0.0
            // before v4.0.0 there were no headers
            if (usingIndex["headers"] !== undefined) {
                headerArrayToHtml(usingIndex["headers"]);
            }
            // per v4.0.0
            // before v4.0.0 there were no content-type
            if (usingIndex["contenttype"] !== undefined) {
                $("#contentTypeList option:contains(" + usingIndex["contenttype"] + ")").prop('selected', true);
            }
            // per v4.0.0
            // before v4.0.0 there were no notification
            if (usingIndex["notify"] !== undefined) {

                $('#notificationCheckbox').prop('checked', usingIndex["notify"]);
            }
            // per v4.0.0
            // before v4.0.0 there were no notification
            if (usingIndex["showFolderIcon"] !== undefined) {

                $('#showFolderIconCheckbox').prop('checked', usingIndex["showFolderIcon"]);
            }
            // per v4.0.0
            // before v4.0.0 there were no notification
            if (usingIndex["response"] !== undefined) {
                $("#responseContentList option:contains(" + usingIndex["response"] + ")").prop('selected', true);
            }
        }
    } else { // Creating new
        $('#modifyExistingButton').hide();
        $('#modifyExistingFolderButton').hide();
        $('#createNewButton').show();
        $('#createNewFolderButton').show();
    }

    $('#testResultsContainer').hide();
    $('#pebbleSaveButton').hide();
    $('#hamburger-menu').hide();
    $('footer').hide();
    $('#emptyMessageField').hide();

    document.getElementById('reorderFields').style.display = "none";

    if (isRequest) { // show request fields

        document.getElementById('createNewFields').style.display = "block";

    } else { // show folder fields 

        document.getElementById('createNewFolderFields').style.display = "block";

    }

}

function showRemoveDisplay() {

    reconcileList(false);
    generateLists();
    clearFields();
}

function showModifyDisplay() {

    summonFAB();
    reconcileList(false);
    generateLists();
    clearFields();

    generateTemplates();

    document.getElementById('createNewFields').style.display = "none";

    $('#createNewFolderFields').hide();
    $('#backupFields').hide();
    $('#reportFields').hide();
    $('#aboutFields').hide();
    $('#settingsFields').hide();
    $('#donateFields').hide();
    $('#changelogFields').hide();

    $('#pebbleSaveButton').show();
    $('#hamburger-menu').show();
    closeHamburger();

    $('footer').show();
}

function clearFields() {
    $('#displayedName').val('');
    $('#httpGetUrlInput').val('');
    $('#jsonPostJsonInput').val('{}');
    $('#folderDisplayedName').val('');

    clearHeaderFields();

    $("#contentTypeList option:contains(application/x-www-form-urlencoded)").prop('selected', true);
    $("#requestTypeList option:contains(GET)").prop('selected', true);
    $("#requestTypeList option:contains(GET)").trigger("click");
    $("#requestTypeList option:contains(GET)").click();
    $("#responseContentList option:contains(Status Code)").prop('selected', true);
    $('#notificationCheckbox').prop('checked', false);
    showHttpGetForm();
    clickRequestTab();
}

function modifyExistingFolder() {

    var folderDisplayedName = $('#folderDisplayedName').val();

    if (folderDisplayedName == null || folderDisplayedName == "") {
        animateRed($('#folderDisplayedName').parent());
        alertify.closeLogOnClick(true).logPosition('top right').error("Folder Name cannot be empty");


    } else {
        currentIndex["type"] = 'folder';
        currentIndex["name"] = folderDisplayedName;
        newEntry = true;
        showReorderDisplay();
        alertify.closeLogOnClick(true).logPosition('top right').success("Successfully modified a folder");
    }
}

function modifyExistingEntry() {

    var displayedName = $('#displayedName').val().replace(/_/g, " ").trim();
    var endpointURL = $('#httpGetUrlInput').val();
    var jsonString = $('#jsonPostJsonInput').val();
    var methodType = $('#requestTypeList option:selected').text();
    var contentType = $('#contentTypeList option:selected').text();
    var notify = $('#notificationCheckbox').prop('checked');
    var response = $('#responseContentList option:selected').text().trim();

    if (displayedName == null || displayedName == "") {
        animateRed($('#displayedName').parent());
        alertify.closeLogOnClick(true).logPosition('top right').error("Display Name cannot be empty");
    } else if (endpointURL == null || endpointURL == "") {
        animateRed($('#httpGetUrlInput').parent());
        alertify.closeLogOnClick(true).logPosition('top right').error("Endpoint URL must be specified");
    } else if ((jsonString == null || jsonString == "") && jsonIncluded()) {
        animateRed($('#jsonPostJsonInput'));
        alertify.closeLogOnClick(true).logPosition('top right').error("JSON not found. If you want an empty JSON, try \"{}\"");
    } else {

        if (!jsonIncluded()) { jsonString = ""; }

        currentIndex["type"] = 'request';
        currentIndex["name"] = displayedName;
        currentIndex["endpoint"] = endpointURL;
        currentIndex["json"] = jsonString;
        currentIndex["method"] = methodType;
        currentIndex["headers"] = headerHtmlToArray();
        currentIndex["contenttype"] = contentType;
        currentIndex["notify"] = notify;
        currentIndex["response"] = response;

        newEntry = true;
        showModifyDisplay();
        alertify.closeLogOnClick(true).logPosition('top right').success("Successfully modified a request");
    }
}

function createNewFolder() {

    var folderDisplayedName = $('#folderDisplayedName').val();

    if (folderDisplayedName == null || folderDisplayedName == "") {
        alertify.closeLogOnClick(true).logPosition('top right').error("Folder Name cannot be empty");
        animateRed($('#folderDisplayedName').parent());

    } else {
        currentList.push({
            "type": 'folder',
            "name": folderDisplayedName,
            "list": []
        });
        newEntry = true;
        showReorderDisplay();
        alertify.closeLogOnClick(true).logPosition('top right').success("Successfully created a new folder");
    }
}

function clearHeaderFields() {
    $('#headerList').children().each(function() {
        $(this).remove();
    });
}

function headerHtmlToArray() {
    var headerArray = [];
    $('#headerList').children().each(function() {
        var header = {};
        var headerKey = $(this).find('label[name=headerKey]').html().trim();
        var headerVal = $(this).find('label[name=headerVal]').html().trim();
        header[headerKey] = headerVal;
        headerArray.push(header);
    });
    return headerArray;
}

function headerArrayToHtml(headerArray) {
    for (var i = 0, len = headerArray.length; i < len; i++) {
        for (var key in headerArray[i]) {
            addHeaderHTML($('#headerList'), key, headerArray[i][key]);
        }
    }
}

function createNewEntry() {

    var displayedName = $('#displayedName').val().replace(/_/g, " ").trim();
    var endpointURL = $('#httpGetUrlInput').val().trim();
    var jsonString = $('#jsonPostJsonInput').val().trim();
    var methodType = $('#requestTypeList option:selected').text().trim();
    var contentType = $('#contentTypeList option:selected').text().trim();
    var notify = $('#notificationCheckbox').prop('checked');
    var response = $('#responseContentList option:selected').text().trim();

    if (!jsonString) { jsonString = "{}" };

    if (displayedName == null || displayedName == "") {
        clickRequestTab();
        alertify.closeLogOnClick(true).logPosition('top right').error("Display Name cannot be empty");
        animateRed($('#displayedName').parent());

    } else if (endpointURL == null || endpointURL == "") {
        clickRequestTab();
        animateRed($('#httpGetUrlInput').parent());
        alertify.closeLogOnClick(true).logPosition('top right').error("Endpoint URL must be specified");
    } else if (!verifyJson(jsonString, false) && jsonIncluded()) {
        animateRed($('#jsonPostJsonInput'));
        clickRequestTab();
    } else {
        if (jsonIncluded()) {
            currentList.push({
                "type": 'request',
                "name": displayedName,
                "endpoint": endpointURL,
                "json": jsonString,
                "method": methodType,
                "headers": headerHtmlToArray(),
                "contenttype": contentType,
                "notify": notify,
                "response": response
            });
        } else {
            currentList.push({
                "type": 'request',
                "name": displayedName,
                "endpoint": endpointURL,
                "json": "",
                "method": methodType,
                "headers": headerHtmlToArray(),
                "contenttype": contentType,
                "notify": notify,
                "response": response
            });
        }
        newEntry = true;
        showReorderDisplay();
        alertify.closeLogOnClick(true).logPosition('top right').success("Successfully created a new request");

    }
}


function saveVibration() {


    currentSettings.vibration = parseInt(document.getElementById("vibeDurationList").options[document.getElementById("vibeDurationList").selectedIndex].value);

    localStorage.settings = JSON.stringify(currentSettings);
    showModifyDisplay();
}

function loadBackupData() {

    var loadSuccessful = setConfigData($('#loadData').val());

    if (loadSuccessful) {

        newEntry = true;
        showModifyDisplay();
        $('#loadData').val('');
    }
}

function setConfigData(stringData) {

    var success = false;

    try {
        stringData = JSON.parse(stringData);
        if (Array.isArray(stringData)) {
            console.log("Array type detected. Using pre 4.0.0.0 loading sequence")
            console.log("---:" + JSON.stringify(stringData));
            localStorage.array = JSON.stringify(stringData);
            currentList = stringData;
            success = true;
        } else {
            console.log("Non Array type detected. Using post 4.0.0.0 loading sequence")
            console.log("---:" + JSON.stringify(stringData.array));
            if (stringData.array) {
                localStorage.array = JSON.stringify(stringData.array);
                currentList = stringData.array;
            }
            if (stringData.settings) {
                if (stringData.settings.vibration) {
                    currentSettings.vibration = stringData.settings.vibration;
                    switch (currentSettings.vibration) {
                        case 100:
                            document.getElementById("vibeDurationList").selectedIndex = 0;
                            break;
                        case 300:
                            document.getElementById("vibeDurationList").selectedIndex = 1;
                            break;
                        case 500:
                            document.getElementById("vibeDurationList").selectedIndex = 2;
                            break;
                        case 0:
                            document.getElementById("vibeDurationList").selectedIndex = 3;
                            break;
                        default:
                            document.getElementById("vibeDurationList").selectedIndex = 0;
                    }
                }
                if (stringData.settings.foregroundColor) {
                    $('#foregroundColorPicker').css("background-color", "#" + stringData.settings.foregroundColor);
                    currentSettings.foregroundColor = stringData.settings.foregroundColor;
                }
                if (stringData.settings.backgroundColor) {
                    $('#backgroundColorPicker').css("background-color", "#" + stringData.settings.backgroundColor);
                    currentSettings.backgroundColor = stringData.settings.backgroundColor;
                }
                if (stringData.settings.selectedColor) {
                    $('#selectedColorPicker').css("background-color", "#" + stringData.settings.selectedColor);
                    currentSettings.selectedColor = stringData.settings.selectedColor;
                }
                if (stringData.settings.statusBarColor) {
                    $('#statusBarColorPicker').css("background-color", "#" + stringData.settings.statusBarColor);
                    currentSettings.statusBarColor = stringData.settings.statusBarColor;
                }
                if (stringData.settings.showFolderIcon) {
                    $('#showFolderIconCheckbox').prop('checked', stringData.settings.showFolderIcon);
                    currentSettings.showFolderIcon = stringData.settings.showFolderIcon;
                }
                if (stringData.settings.showStatusBar) {
                    $('#showStatusBarIconCheckbox').prop('checked', stringData.settings.showStatusBar);
                    currentSettings.showStatusBar = stringData.settings.showStatusBar;
                }
            }
            success = true;
        }
    } catch (e) {
        alert('Format of the data to load is invalid');
        alert(e);
    }

    return success;

}

// Returns HEX val with rgb input (example output "FFFFFF")
function rgb2hex(rgb) {
    if (rgb.search("rgb") == -1) {
        return rgb;
    } else {
        rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);

        function hex(x) {
            return ("0" + parseInt(x).toString(16)).slice(-2);
        }
        return hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    }
}

function getConfigData() {

    currentSettings.vibration = parseInt(document.getElementById("vibeDurationList").options[document.getElementById("vibeDurationList").selectedIndex].value);
    currentSettings.foregroundColor = rgb2hex($('#foregroundColorPicker').css('background-color'));
    currentSettings.backgroundColor = rgb2hex($('#backgroundColorPicker').css('background-color'));
    currentSettings.selectedColor = rgb2hex($('#selectedColorPicker').css('background-color'));
    currentSettings.statusBarColor = rgb2hex($('#statusBarColorPicker').css('background-color'));
    currentSettings.showFolderIcon = $('#showFolderIconCheckbox').prop('checked');
    currentSettings.showStatusBar = $('#showStatusBarCheckbox').prop('checked');

    var options = {
        'array': currentList,
        'settings': currentSettings
    };

    // Save for next launch
    localStorage.array = JSON.stringify(currentList);

    localStorage.settings = JSON.stringify(currentSettings);

    //console.log('Got options: ' + JSON.stringify(options));
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
        reconcileList(true);

        // Set the return URL depending on the runtime environment
        var return_to = getQueryParam('return_to', 'pebblejs://close#');
        document.location = return_to + encodeURIComponent(JSON.stringify(getConfigData()));
    } else {
        var return_to = getQueryParam('return_to', 'pebblejs://close#');
        document.location = return_to;
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

function toggleHamburger() {
    if ($('.hamburger.hamburger--arrow').hasClass("is-active")) { // CLOSE OPTIONS
        $('.hamburger.hamburger--arrow').removeClass("is-active")
        $("#hamburger-content").animate({
            width: "0px"
        }, 500, function() {});
        $('#ham-back').animate({ width: "0%" }, 500);
        $('#backupButton').animate({ width: "0%" }, 500);
        $('#settingsButton').animate({ width: "0%" }, 500);
        $('#reportButton').animate({ width: "0%" }, 500);
        $('#donateButton').animate({ width: "0%" }, 500);
        $('#aboutButton').animate({ width: "0%" }, 500);
        $('#changelogButton').animate({ width: "0%" }, 500);
        $('.hamburger-img').animate({ width: "0px" }, 500);
        $('.hamburger-label').hide();
        showModifyDisplay();
    } else {
        $('.hamburger.hamburger--arrow').addClass("is-active") // OPEN OPTIONS
        $("#hamburger-content").animate({
            width: "100%"
        }, 500, function() {});
        $('#ham-back').animate({ width: "100%" }, 500);
        $('#backupButton').animate({ width: "15.5%" }, 500);
        $('#settingsButton').animate({ width: "15.5%" }, 500);
        $('#reportButton').animate({ width: "15.5%" }, 500);
        $('#donateButton').animate({ width: "15.5%" }, 500);
        $('#aboutButton').animate({ width: "15.5%" }, 500);
        $('#changelogButton').animate({ width: "15.5%" }, 500);
        $('.hamburger-img').animate({ width: "14px" }, 500); // global
        $('.hamburger-label').show();
    }
}

function closeHamburger() {
    if ($('.hamburger.hamburger--arrow').hasClass("is-active")) { // CLOSE OPTIONS
        $('.hamburger.hamburger--arrow').removeClass("is-active")
        $("#hamburger-content").css("width", "0px");
        $('#ham-back').css("width", "0%");
        $('#backupButton').css("width", "0%");
        $('#settingsButton').css("width", "0%");
        $('#reportButton').css("width", "0%");
        $('#donateButton').css("width", "0%");
        $('#aboutButton').css("width", "0%");
        $('#changelogButton').css("width", "0%");
        $('.hamburger-img').css("width", "0px");
        $('.hamburger-label').hide();
    }
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function showAddHeaderForm() {
    $('.tooltip-background').show();
    $('#updateHeaderButton').hide();
    $('#removeHeaderButton').hide();
    $('#createHeaderButton').show();
    $('#addHeaderLabel').html('ADD HEADER');


    $('html, body').animate({
        scrollTop: $("#headers-tooltip").position().top - 10
    }, 500);
    $("#headerAddFields").slideDown("500");
}


var currentHeader;

function showModifyHeaderForm(currentElement) {
    currentHeader = currentElement;
    $('#updateHeaderButton').show();
    $('#createHeaderButton').hide();
    $('#removeHeaderButton').show();
    $('#addHeaderLabel').html('MODIFY HEADER');
    $('#headerKeyInput').val('');
    $('#headerValInput').val('');
    $('#headerKeyInput').attr("placeholder", "Key");
    var currentKey = currentElement.find("[name=headerKey]").html();
    var currentVal = currentElement.find("[name=headerVal]").html();

    $('#headerKeyInput').val(currentKey);
    $('#headerValInput').val(currentVal);

    $('.tooltip-background').show();
    $('#updateHeaderButton').show();
    $('#createHeaderButton').hide();
    $('html, body').animate({
        scrollTop: $("#headers-tooltip").position().top - 10
    }, 500);
    $("#headerAddFields").slideDown("500");
}

function headerExists(headerName) {
    headerName = formatHeaderTagID(headerName);
    var exists = $('#' + headerName).length;
    var existsAs = $('#' + headerName);
    if (exists) {
        return existsAs;
    } else {
        return null;
    }
}


function addHeader(key, val) {
    if (!key) {
        animateRed($('#headerKeyInput'));
    } else if (!val) {
        animateRed($('#headerValInput'));
    } else {

        console.log("Checking headerExists");

        var headerKeyExists = headerExists(key);

        if (key.trim().toLowerCase() == "content-type") {
            alertify.closeLogOnClick(true).alert("Specifying a Content-Type overrides the Content-Type dropdown");
        } else if (key.trim().toLowerCase() == "authorization" && !($('#httpGetUrlInput').val().trim().toLowerCase().startsWith("https:"))) {
            alertify.closeLogOnClick(true).alert("Make sure to secure your endpoint with SSL when using authorization headers.");

        }

        if (headerKeyExists) {
            console.log("appending comma separated value");
            var headerValElement = headerKeyExists.find("[name=headerVal]");
            var previousHeaderVal = headerValElement.html();
            var newHeaderVal = previousHeaderVal + ", " + val
            headerValElement.html(newHeaderVal);

        } else {
            console.log("Appending html");
            addHeaderHTML($('#headerList'), key, val);

        }
        hideAddHeaderForm();
        animateGreen($('#' + formatHeaderTagID(key)));
    }
}

function updateHeader(key, val) {
    if (!key) {
        animateRed($('#headerKeyInput'));
    } else if (!val) {
        animateRed($('#headerValInput'));
    } else {


        if (key.trim().toLowerCase() == "content-type") {
            alertify.closeLogOnClick(true).alert("Specifying a Content-Type overrides the Content-Type dropdown");
        } else if (key.trim().toLowerCase() == "authorization" && !($('#httpGetUrlInput').val().trim().toLowerCase().startsWith("https:"))) {
            alertify.closeLogOnClick(true).alert("Make sure to secure your endpoint with SSL when using authorization headers.");

        }

        currentHeader.find("[name=headerKey]").html(key)
        currentHeader.find("[name=headerVal]").html(val)
        headerKeyAfterModify = formatHeaderTagID(key);
        currentHeader.attr("id", headerKeyAfterModify);
        hideAddHeaderForm();
        animateGreen($('#' + headerKeyAfterModify));
    }
}

function removeHeader(key) {
    alertify.closeLogOnClick(true).confirm("Are you sure you want to remove " + key + "?", function() {
        $('#' + formatHeaderTagID(key)).remove();
    });
    hideAddHeaderForm();
}

function formatHeaderTagID(headerKey) {
    return "header-" + headerKey.toLowerCase().trim();
}

function addHeaderHTML(listElement, key, val) {
    var formattedID = formatHeaderTagID(key);
    listElement.append("<div id='" + formattedID + "' name='headerRow' onclick='(showModifyHeaderForm($(\"#" + formattedID + "\")))' class='item-container-content headerRow'>\
                      <label name='headerKey' class='headerRowLeft'>" + key + "</label>\
                      <label name='headerVal' class='headerRowRight'>" + val + "</label>\
                  </div>");
}

function hideAddHeaderForm() {
    $('#headerAddFields').hide();
    $('#headerKeyInput').val('');
    $('#headerValInput').val('');
    $('#headerKeyInput').attr("placeholder", "Key");
    $('.tooltip-background').hide();
}

function tooltipBackgroundClicked() {
    hideAddHeaderForm();
    $('.action-button').removeClass('active');
    $('.action-button').removeClass('action-button-open');
    $('a[tooltip="Add Request"]').hide();
    $('a[tooltip="Add Folder"]').hide();
    $('#backgroundCloseButton').hide();

}



function resetData() {
    alertify.confirm("All configurations will be reset.", function() {
        localStorage.clear();
        window.location = "https://" + window.location.hostname;
    });
}

function dismissFAB() {

    $('.action-button').removeClass('active');
    $('.action-button').removeClass('action-button-open');
    $('a[tooltip="Add Request"]').hide();
    $('a[tooltip="Add Folder"]').hide();
    $('.tooltip-background').hide();
    $('.multi-action').hide();
}

function summonFAB() {
    $('.multi-action').show();
}

function addFABclicked() {
    if ($('.action-button').hasClass('active')) {
        $('.action-button').removeClass('action-button-open');
        $('a[tooltip="Add Request"]').hide();
        $('a[tooltip="Add Folder"]').hide();
        $('.tooltip-background').hide();
    } else {
        $('.action-button').addClass('action-button-open');
        $('a[tooltip="Add Request"]').show();
        $('a[tooltip="Add Folder"]').show();
        $('.tooltip-background').show();
    }
}


function leavingPageWarning(url) {
    alertify.confirm("You're about to leave the page! Any changes you have not saved will be lost.", function() {
        window.location = url;
    });
    //return confirm("You're about to leave the page. Make sure to save any changes before proceeding!");
}



function paypalWarning() {
    alertify.confirm("You're about to leave the page! Any changes you have not saved will be lost.", function() {
        $('#paypalButton').click();
    });
}

function showRequestFields() {
    $('#requestFields').show();
}