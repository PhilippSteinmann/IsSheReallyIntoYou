// When the user clicks on the "FIND OUT" button...
document.getElementById("start-button").onclick = function() {
    // Ask for permission to read the mailbox
    FB.login(getUserData, {scope: 'read_mailbox'});
}

// These are global variables.

// Before the user chooses a friend, this contains 50 most recent threads
var all_threads;

// Of type Thread, defined by FB at https://developers.facebook.com/docs/graph-api/reference/v2.2/thread
var thread;

// Basic data like name, gender, locale.
// Called in getUserData() through "/me"
var user_data;

// Nice to have
var friend_name = "";

// Array of objects. Important properties: `created_time`, `from`, `message`
var messages = [];
var fromOther=[];
var fromYou=[];

// The messages used to entertain the user while we fetch messages & compute stuff.
// We save the timer so that we can cancel it when the computation is finished.
var loading_messages_timer;
var loading_messages = ["Crunching Numbers...", "Contacting Friends...", "Reading Diaries...", "Analyzing Facial Expressions..."];




var MAX_MESSAGES_TO_LOAD = 400;

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

    // Get 50 most recent threads. 50 is the max.
    FB.api("/me/inbox", {limit: 50 }, displayFriends);
}

// List friends, and let the user choose the friend he/she likes.
// This is the callback from getInbox()
function displayFriends(response) {
    if (response.error) {
        handleError(response.error);
        return;
    }

    // Hide start button, display instructions
    prepareFriendList();

    // all_threads = the 50 most recent chat threads
    all_threads = response.data;

    // for each, add to the friend list
    all_threads.forEach(function(thread, thread_index) {
        // only if it's a one-on-one conversation
        if (thread.to.data.length == 2)
            addToFriendsList(thread_index);
    } );

    // Set click listeners on the list
    listenForClicks();
}

// Hide start button, display instructions
// Called by displayFriends()
function prepareFriendList() {
    // Vanilla JS, sorry
    document.getElementById("start-button").style.display = "none";
    var all_friends_element = document.querySelector("#friendList ul");
    var instructions_element = document.createElement("p");
    instructions_element.className = "instructions";
    var instructions_text_element = document.createTextNode("WHO IS IT?");

    instructions_element.appendChild(instructions_text_element);
    all_friends_element.appendChild(instructions_element);
}

// Add the person's name from the given thread to the list
// Called by displayFriends()
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

// Set click listeners
// Called by displayFriends()
function listenForClicks() {
    var all_links = document.querySelectorAll("#friendList li");

    // For every list item, specify what happens when user clicks on it
    for (var i = 0; i < all_links.length; i++) {
        var elem = all_links[i];
        elem.onclick = function() {
            friend_name = this.getAttribute("data-name");
            var thread_index = this.getAttribute("data-thread-index");
            // "Crunching numbers", etc
            showLoadingScreen();

            // We only get 25 messages per thread. We need to load more.
            loadAllMessages(thread_index);
            analyzeMessages
        }
    }
}

function showLoadingScreen() {
    // Hide the friend list
    document.getElementById("friendList").style.display = "none";

    // From http://tobiasahlin.com/spinkit/
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
    loading_messages_timer = window.setInterval(changeLoadingMessage, 2400);
}

// Called at a regular interval
function changeLoadingMessage() {
    var loading_message_element = document.getElementById("loading");
    var current_message_index = loading_message_element.getAttribute("data-message-index");

    // Without the parseInt() current_message_index is string.
    // 30 minutes of terrible debugging
    var new_message_index = (parseInt(current_message_index, 10) + 1) % loading_messages.length;
    loading_message_element.setAttribute("data-message-index", new_message_index);
    loading_message_element.textContent = loading_messages[new_message_index];
}

function loadAllMessages(thread_index) {
    thread = all_threads[thread_index];
    messages = thread.comments.data;
    loadPageOfMessages(thread.comments.paging.next);
}

// Messages are divided up into pages.
// Each page contains a reference to the next (older) page
function loadPageOfMessages(url) {
    if (url== "")
        return;

    if (messages.length + 25 > MAX_MESSAGES_TO_LOAD)
        return;

    // Response is in JSON format
    var response_object = JSON.parse(getURL(url));
    var page_of_messages = response_object.data;
    messages.push.apply(messages, page_of_messages);

    if (messages.length + 25 <= MAX_MESSAGES_TO_LOAD && response_object.paging)
        loadPageOfMessages(response_object.paging.next);
}


// Not used, but useful for testing
function displayLoadedMessages() {
    var ul = document.createElement("ul");
    var li, text;
    messages.forEach(function(message) {
        li = document.createElement("li");
        text = document.createTextNode(message.from.name + ": " + message.message);
        li.appendChild(text);
        ul.appendChild(li);
    } );
    document.querySelector("#content").appendChild(ul);
}

function handleError(error) {
    alert("ERROR: " + error.message);
}
function analyzeMessages(){
    splitOther();
    var fromOtherIndex=indexOther();
    var fromTimeBetIndex=timeBetIndex();
}

function timeBetIndex(){
  
}

function splitOther(){
  messages.forEach(function(message){
    if (message.from.name==friend_name){
      fromOther.push(message);
    }
    else {
      fromYou.push(message);
    }
  });
}

function indexOther(){
  var n=(fromOther.length*100)/messages.length;
  return Math.floor(n/20)+1

}
// http://stackoverflow.com/a/4033310/805556
function getURL(url)
{
    var xmlHttp = null;

    xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, false);
    xmlHttp.send(null);
    return xmlHttp.responseText;
}
