document.getElementById("login").onclick = function() {
    // Make sure we have permission
    FB.login(getUserData, {scope: 'read_mailbox'});
}

// These are global variables, we're cheating a little here
// Of type Thread, defined by FB https://developers.facebook.com/docs/graph-api/reference/v2.2/thread
var thread;
var user_data;
var friend_name = "";
var all_threads;

// Get the user's name, locale, etc.
// This is the callback from the login button onclic
function getUserData() {
    FB.api("/me", getInbox);
}

// Get all messages in inbox
// This is the callback from getUserData()
function getInbox(response) {
    if (response.error) {
        handleError(response.error);
        return;
    }

    user_data = response;
    // Won't return more than 50, that's max
    FB.api("/me/inbox", {limit: 50 }, displayFriends);
}

// Let the user choose the friend he/she likes.
// This is the callback from getInbox()
function displayFriends(response) {
    if (response.error) {
        handleError(response.error);
        return;
    }

    // Tell the user to pick a person
    displayInstructions();

    // all_threads = the 50 most recently updated chat threads
    all_threads = response.data;
    
    // for each, add to the friend list
    all_threads.forEach(function(thread) {

        // only if it's a one-on-one conversation
        if (thread.to.data.length == 2)
            addToFriendsList(thread);
    } );
}

// Tell the user to choose "Who's the One"
function displayInstructions() {
    // Vanilla JS, sorry
    document.getElementById("login").style.display = "none";
    var all_friends_element = document.querySelector("#friendList ul");
    var instructions_element = document.createElement("p");
    instructions_element.className = "instructions";
    var instructions_text_element = document.createTextNode("WHO IS IT?");

    instructions_element.appendChild(instructions_text_element);
    all_friends_element.appendChild(instructions_element);
}

// Add the person's name from the given thread to the list
function addToFriendsList(thread) {
    // Vanilla JS, sorry
    var participants = thread.to.data;
    var other_person_index = participants[0].name == user_data.name ? 1 : 0;
    var other_person = participants[other_person_index];

    var all_friends_element = document.querySelector("#friendList ul");

    var friend_list_element = document.createElement("li");
    var friend_link_element = document.createElement("a");
    friend_link_element.href = "#";

    var friend_name_element = document.createElement("p");
    friend_name_element.className = "friendName"

    var friend_text_element = document.createTextNode(other_person.name);
    var friend_image_element = document.createElement("img");
    friend_image_element.src = "https://graph.facebook.com/" + other_person.id + "/picture?height=100&height=100";

    friend_link_element.appendChild(friend_image_element);
    friend_name_element.appendChild(friend_text_element);
    friend_link_element.appendChild(friend_name_element);
    friend_list_element.appendChild(friend_link_element);
    all_friends_element.appendChild(friend_list_element);
}

function handleError(error) {
    alert("ERROR: " + error.message);
}
