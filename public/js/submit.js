/* global addLines author createEditor currentLesson parseLesson */

var verifying = false;
var time = new Date();

function submit() {

//customize this prompt in the style.css possibly
  var bool = 0;
  var explaination = prompt("Please explain your reasoning for your answer: ", "");
  while(bool == 0){
    if (explaination == null || explaination == "") {
      bool = 0;
      explaination = prompt("Please explain your reasoning before pressing ok: ", "");
    }
    else {
      bool = 1;
    }
  }

//add a thing for simple mistakes makes a popup, does not verify
//check where data is saved to be sent so we can save and send the answer
    /* Protect against multiple requests */
    if (verifying) {
        return;
    }
    lock();

    var data = {};
    data.module = currentLesson.module;
    data.name = currentLesson.name;
    data.author = author;
    //data.author = "user.googleId;"   //make userid
    data.milliseconds = getTime();
    data.code = createEditor.getValue();
    data.explaination = explaination;
    //need to get the answer from the multiple choice
    $.postJSON("/verify", data, (results) => {
        if (results.lines !== undefined) {
            addLines(results.lines);
        }

        if (results.status == "trivial") {
            unlock("Sorry, not the intended answer. Try again!");
        } else if (results.status == "unparsable") {
            unlock("<b>Syntax error.</b> <br>Check each of the following: <br>1. Did you fill out all confirm assertions? <br>2. Is there a semicolon at the end of each assertion? <br>3. Did you use the correct variable names?");
        } else if (results.status == "failure") {
            if ("problem" in results) {
                unlock("Sorry, not correct. Try this other lesson!");
                parseLesson(results.problem);
            } else {
                unlock("<b>Wrong answer.</b> <br>Check each of the following: <br>1. Did you read the reference material? <br>2. Do you understand the distinction between input and output values?");
            }
        } else if (results.status == "success") {
            unlock("Correct! On to the next lesson.");
            parseLesson(results.problem);
        } else {
            unlock("Something went wrong.");
        }
    });
}

function lock() {
    verifying = true;
    $("#right .footette").attr("class", "footetteDisabled");
}

function unlock(message) {
    $("#dialog-message").html(message);
    $("#dialog-box").dialog("open");
    verifying = false;
    $("#right .footetteDisabled").attr("class", "footette");
    createEditor.focus();
}

/*
    Gets the number of milliseconds since the last time this function was
    called, or since the page loaded if it is the first call.
*/
function getTime() {
    var endTime = new Date();
    var result = endTime.getTime() - time.getTime();
    time = endTime;
    return result;
}

/*
    Really, why does this not exist?
*/
$.postJSON = (url, data, callback) => {
    return $.ajax({
        type: "POST",
        url: url,
        contentType: "application/json",
        data: JSON.stringify(data),
        dataType: "json",
        success: callback
    });
};
