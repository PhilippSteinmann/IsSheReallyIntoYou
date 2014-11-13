document.getElementById("login").onclick = function() {
    // Get friend name from input box
    friendName = document.getElementById("friend-name").value;

    // Make sure we have permission
    FB.login(getInbox, {scope: 'read_mailbox'});
}

// These are global variables, we're cheating a little here
friendName = "";
inbox = [];

function getInbox(response) {
    // Get all messages in inbox
    FB.api("/me/inbox", inboxCallBack);
}

function inboxCallBack(response) {
    if (response.error) {
        handleError(response.error);
        return;
    }

    inbox = response.data;
    var message, participants;

    // Loop through messages in inbox to find correct ID
    for (var i = 0; i < inbox.length; i++) {
        message = inbox[i];
        participants = message.to.data;

        // For everybody who participated in this chat...
        for (var x = 0; x < participants.length; x++) {
            // If it's the right person...
            if (participants[x].name == friendName) {
                var messageID = message.id;
                getMessageContent(messageID);
            }
        }
    }
}

function getMessageContent(messageID) {
    FB.api("/" + messageID, messageCallBack);
}

function messageCallBack(response) {
    if (response.error) {
        handleError(response.error);
        return;
    }
    alert("GOT RESPONSE: " + response);
}

function handleError(error) {
    alert("ERROR: " + error.message);
}
