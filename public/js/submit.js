/* global addLines author createEditor currentLesson parseLesson */

var verifying = false;
var time = new Date();

function submit() {

  console.log("submitting");

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
    //data.author = user.googleId;   //make userid
    data.milliseconds = getTime();
    data.code = createEditor.getValue();
    //need to get the answer from the multiple choice
    $.postJSON("/verify", data, (results) => {
        if (results.lines !== undefined) {
            addLines(results.lines);
        }

        if (results.status == "trivial") {
            unlock("Sorry, not the intended answer. Try again!");
        } else if (results.status == "unparsable") {
            unlock("Syntax error. Check each of the following: \r\n1. Did you fill out all confirm assertions?\r\n 2. Is there a semicolon at the end of each assertion? \r\n3. Did you use the correct variable names?");
        } else if (results.status == "failure") {
            if ("problem" in results) {
                unlock("Sorry, not correct. Try this other lesson!");
                parseLesson(results.problem);
            } else {
                unlock("Sorry, not correct. Try again!");
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
