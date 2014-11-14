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
var loading_messages_timer;
var loading_messages = ["Crunching Numbers...", "Contacting Friends...", "Reading Diaries..."];
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
    all_threads.forEach(function(thread, thread_index) {

        // only if it's a one-on-one conversation
        if (thread.to.data.length == 2)
            addToFriendsList(thread_index);
    } );
    listenForClicks();
}

// Tell the user to choose "Who's the One"
function displayInstructions() {
    // Vanilla JS, sorry
    document.getElementById("login").style.display = "none";
    var all_friends_element = document.querySelector("#friendList ul");
    var instructions_element = document.createElement("p");
    instructions_element.className = "instructions";
    var instructions_text_element = document.createTextNode("WHICH ONE?");

    instructions_element.appendChild(instructions_text_element);
    all_friends_element.appendChild(instructions_element);
}

// Add the person's name from the given thread to the list
function addToFriendsList(thread_index) {
    var thread = all_threads[thread_index];
    var participants = thread.to.data;
    var other_person_index = participants[0].name == user_data.name ? 1 : 0;
    var other_person = participants[other_person_index];

    // Vanilla JS, sorry
    var all_friends_element = document.querySelector("#friendList ul");

    var friend_list_element = document.createElement("li");
    friend_list_element.setAttribute("data-name", other_person.name);
    friend_list_element.setAttribute("data-thread-index", thread_index);

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

function listenForClicks() {
    var all_links = document.querySelectorAll("#friendList a")
    for (var i = 0; i < all_links.length; i++) {
        var elem = all_links[i];
        elem.onclick = function() {
            var name = this.getAttribute("data-name");
            var thread_index = this.getAttribute("data-thread-index");
            showLoadingScreen();
            analyzeContent();
        }
    }
}

function showLoadingScreen() {
    document.getElementById("friendList").style.display = "none";
    var loadingScreenHTML = "\
<p id='loading' data-message-index='0'>Crunching Numbers...</p>\
<div class='spinner'>\
      <div class='rect1'></div>\
      <div class='rect2'></div>\
      <div class='rect3'></div>\
      <div class='rect4'></div>\
      <div class='rect5'></div>\
    </div>\
</div>";
    document.getElementById("loading-screen").innerHTML = loadingScreenHTML;
    loading_messages_timer = setInterval(changeLoadingMessage, 1400);
}

function changeLoadingMessage() {
    var loading_message_element = document.getElementById("loading");
    var current_message_index = loading_message_element.getAttribute("data-message-index");
    var new_message_index = (current_message_index + 1) % loading_messages.length;
    loading_message_element.setAttribute("data-message-index", new_message_index);
    loading_message_element.innerText = loading_messages[new_message_index];
}

function analyzeContent() {

}

function handleError(error) {
    alert("ERROR: " + error.message);
}
