/* global ace approved author createEditor resetTime verifying */

var currentLesson;

function loadLesson(filePath) {
    $.getJSON(filePath, function (data) {
        currentLesson = data;

        $("#left .header td").html(data.lesson);

        $("#left .reference td").html(data.referenceMaterial);
        if (data.type == "tutorial") {
            $("#left .activity td").html(data.activity);
            $("#right .headette").addClass("button");
            $("#right .headette td")
                .html("Click here for quick video instructions")
                .off("click")
                .click(function () {
                    window.open(data.screenCapture, "_blank");
                });

        } else if (data.type == "lesson" || data.type == "challenge") {
            $("#left .activity td").html("Please complete the <b>Confirm</b> assertion(s) and check correctness.");
            $("#right .headette").removeClass("button");
            $("#right .headette td").html("").off("click");

        } else if (data.type == "end") {
            $("#left .activity td").html(data.activity);

        } else {
            $("#left .activity td").html("This should never appear.");
            $("#right .headette").removeClass("button");
            $("#right .headette td").html("").off("click");
        }

        $.get(data.code, function (data) {
            createEditor.setValue(data);
            createEditor.selection.moveCursorToPosition({
                row: 0,
                column: 0
            });

            createEditor.getSession().setUndoManager(new ace.UndoManager());
            createEditor.getSession().getUndoManager().reset();
        });
    });
}

function endSurvey() {
    $("#dialog-message").html("<b>AuthorID:</b> " + author + "</br>Use the number above and complete the survey on Canvas.");
    $("#dialog-box").dialog("open");
}

function reloadLesson() {
    loadLesson(currentLesson.self);
}

function nextLessonButton() {
    if (!approved) {
        $("#dialog-message").html("You may only progress when your code has been approved.");
        $("#dialog-box").dialog("open");
        createEditor.focus();
        return;
    }

    nextLessonAndSuccess();
}

function nextLessonAndFailure() {
    if (currentLesson.nextLessonOnFailure == "") {
        return;
    }

    if (currentLesson.nextLessonOnFailure == currentLesson.self) {
        return;
    }

    loadLesson(currentLesson.nextLessonOnFailure);
    resetTime();
}

function nextLessonAndSuccess() {
    if (currentLesson.nextLessonOnSuccess == "") {
        return;
    }

    loadLesson(currentLesson.nextLessonOnSuccess);
    resetTime();
}

function prevLesson() {
    verifying = false;
    if (currentLesson.previousLesson == "") {
        return;
    }

    loadLesson(currentLesson.previousLesson);
    resetTime(); // Might need to remove this when we change the "next" button.
}
