var createEditor;

function injectCreate(id) {
    $("#" + id).load("create/html/createHTML", function() {
        injectCreateEditor();
        generateAuthor();
    });
}

function injectCreateEditor() {
    Range = ace.require('ace/range').Range;

    createEditor = ace.edit("editor");
    createEditor.setTheme("ace/theme/github");
    createEditor.getSession().setMode("ace/mode/");

    createEditor.getSession().on('change', removeAllVCMarkers);
    createEditor.setFontSize(18);
}