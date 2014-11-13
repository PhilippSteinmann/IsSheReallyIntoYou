document.getElementById("login").onclick = function() {
    // Get friend name from input box
    friendName = document.getElementById("friend-name").value;

    // Make sure we have permission
    FB.login(getInbox, {scope: 'read_mailbox'});
}

// These are global variables, we're cheating a little here
friendName = "";
// Of type Thread, defined by FB https://developers.facebook.com/docs/graph-api/reference/v2.2/thread
var thread;

function getInbox(response) {
    // Get all messages in inbox
    FB.api("/me/inbox", inboxCallBack);
}

function inboxCallBack(response) {
    if (response.error) {
        handleError(response.error);
        return;
    }

    var inbox = response.data;
    var message, participants;

    // Loop through messages in inbox to find thread
    for (var i = 0; i < inbox.length; i++) {
        currentTrhead = inbox[i];
        participants = currentThread.to.data;

        // For everybody who participated in this chat...
        for (var x = 0; x < participants.length; x++) {
            // If it's the right person...
            if (participants[x].name == friendName) {
                thread = currentThread;
            }
        }
    }
    analyzeThread();
}

function analyzeThread() {
    // First 25 messages, not sure how to get more
    var messages = thread.comments.data;
}

function handleError(error) {
    alert("ERROR: " + error.message);
}
