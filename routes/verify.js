var express = require('express')
var router = express.Router()
var WebSocket = require('ws')

router.post('/verify', (req, res) => {
    // Check for all necessary fields
    if ( !('authorID' in req.body && 'milliseconds' in req.body && 'code' in req.body) ) {
        res.status(400)
        res.send('Requires authorID, milliseconds, and code fields.')
        return
    }

    // Check for trivials
    var trivials = checkForTrivials(req.body.code)
    if (trivials.overall == 'failure') {
        res.json({
            'status': 'trivial',
            'lines': trivials.confirms,
            'problem': ''
        })

        return
    }

    // Verify VCs
    var vcs = {}
    var ws = new WebSocket('wss://resolve.cs.clemson.edu/teaching/Compiler?job=verify2&project=Teaching_Project')

    ws.on('open', () => {
        ws.send(encode(req.body.code))
    })

    ws.on('message', (message) => {
        message = JSON.parse(message)
        if (message.status == 'error' || message.status == '') {
            res.json({
                'status': 'unparsable',
                'problem': ''
            })
            ws.close()
        }
        else if (message.status == 'processing') {
            var regex = new RegExp('^Proved')
            if (regex.test(message.result.result)) {
                vcs[message.result.id] = 'success'
            } else {
                vcs[message.result.id] = 'failure'
            }
        }
        else if (message.status == 'complete') {
            var lineNums = decode(message.result)

            var lines = mergeVCsAndLineNums(vcs, lineNums.vcs)

            res.json({
                'status': lines.overall,
                'lines': lines.lines,
                'problem': ''
            })
            ws.close()
        }
    })
})



/*
    Checks for any trivial answers the student may provide, such as "Confirm
    true", "Confirm I = I", or "Confirm I /= I + 1". Returns a list of lines
    and an indicator of trivial or not for each line. Note: may not perfectly
    check for all possible trivials.
*/
function checkForTrivials(content) {
    var lines = content.split("\n")
    var confirms = []
    var overall = 'success'
    var regex
    var i

    // Find all the confirm or ensures statements, with their line numbers
    regex = new RegExp("Confirm [^;]*;|ensures [^;]*;", "mg")
    for (i = 0; i < lines.length; i++) {
        var confirm = lines[i].match(regex)
        if (confirm) {
            confirms.push({lineNum: i+1, text: confirm[0], status: 'success'})
        }
    }

    if (confirms.length == 0) {
        return {confirms: [], overall: 'failure'}
    }

    for (i = 0; i < confirms.length; i++) {
        // Remove the "Confirm " and "ensures " so that we can find the variable names
        var statement = confirms[i].text
        statement = statement.substr(8)

        // Search for an illegal "/="
        regex = new RegExp("/=")
        if (statement.search(regex) > -1) {
            overall = 'failure'
            confirms[i].status = "failure"
            continue
        }

        // Split the string at the conditional, first looking for >= and <=
        regex = new RegExp(">=|<=")
        var parts = statement.split(regex)
        if (parts.length > 2) {
            overall = 'failure'
            confirms[i].status = "failure"
            continue
        }

        // If there is no >= or <=
        if (parts.length == 1) {
            regex = new RegExp("=")
            parts = statement.split(regex)
            if (parts.length > 2) {
                overall = 'failure'
                confirms[i].status = "failure"
                continue
            }
        }

        // If there is no >=, <=, or =
        if (parts.length == 1) {
            regex = new RegExp(">|<")
            parts = statement.split(regex)
            if (parts.length != 2) {
                overall = 'failure'
                confirms[i].status = "failure"
                continue
            }
        }

        // Find the variables used on the left side. If there are none, mark it correct.
        var left = parts[0]
        var right = parts[1]
        regex = new RegExp("[a-zA-Z]", "g")
        var variables = left.match(regex)
        if (variables === null) {
            overall = 'failure'
            confirms[i].status = "failure"
            continue
        }

        // Search for these variables on the right side
        var j
        for (j = 0; j < variables.length; j++) {
            var variable = variables[j]
            regex = new RegExp(" " + variable, "g")
            if (right.search(regex) > -1) {
                overall = 'failure'
                confirms[i].status = "failure"
                continue
            }
        }
    }

    // Get rid of the text field
    for (var confirm of confirms) {
        delete confirm.text
    }

    return {confirms: confirms, overall: overall}
}

/*
    Take the output of all the "processing" steps of the verifier, and combine
    it with the output of the "complete" step. The result is an object with two
    fields: overall and lines. overall tells you if all the VCs proved. lines is
    an array of objects with two fields each, lineNum and status. If there are
    multiple VCs on one line, then it only says the line is proven if all of
    the VCs on that line are proven.
*/
function mergeVCsAndLineNums(provedList, lineNums) {
    var overall = 'success'
    var lines = {}

    for (var vc of lineNums) {
        if (provedList[vc.vc] != 'success') {
            overall = 'failure'
        }

        if (lines[vc.lineNum] != 'failure') {
            lines[vc.lineNum] = provedList[vc.vc]
        }
    }

    // Convert from hashtable to array
    var lineArray = []
    for (var entry of Object.entries(lines)) {
        lineArray.push({'lineNum': entry[0], 'status': entry[1]})
    }

    return {'overall': overall, 'lines': lineArray}
}

/*
    Don't ask, just accept.
*/
function encode(data) {
    var regex1 = new RegExp(" ", "g")
    var regex2 = new RegExp("/+", "g")

    var content = encodeURIComponent(data)
    content = content.replace(regex1, "%20")
    content = content.replace(regex2, "%2B")

    var json = {}

    json.name = "BeginToReason"
    json.pkg = "User"
    json.project = "Teaching_Project"
    json.content = content
    json.parent = "undefined"
    json.type = "f"

    return JSON.stringify(json)
}

function decode(data) {
    var regex1 = new RegExp("%20", "g")
    var regex2 = new RegExp("%2B", "g")
    var regex3 = new RegExp("<vcFile>(.*)</vcFile>", "g")
    var regex4 = new RegExp("\n", "g")

    var content = decodeURIComponent(data)
    content = content.replace(regex1, " ")
    content = content.replace(regex2, "+")
    content = content.replace(regex3, "$1")
    content = decodeURIComponent(content)
    content = decodeURIComponent(content)
    content = content.replace(regex4, "")

    var obj = JSON.parse(content)

    return obj;
}

module.exports = router
