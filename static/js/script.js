document.getElementById("login").onclick = function() {
     FB.login(init, {scope: 'read_mailbox,user_friends'});
}

var friendsObject;
friends = [];

function init(response) {
    FB.api("/me/friends", friendsCallBack);
}

function friendsCallBack(response) {
    if (response.error) {
        handleError(response.error);
        return;
    }

    friendsObject = response;
}

function handleError(error) {
    alert("ERROR: " + error.message);
}
