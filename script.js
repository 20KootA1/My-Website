// Get elements
const button = document.getElementById("add-post");
const postsDiv = document.getElementById("posts");
const boldBtn = document.getElementById("bold-btn");
const italicBtn = document.getElementById("italic-btn");
const contentBox = document.getElementById("post-content");
const darkModeToggle = document.getElementById("dark-mode-toggle");
const colourPicker = document.getElementById("text-colour");
const imageInput = document.getElementById("image-input");
const searchInput = document.getElementById("search-input");

// Load saved posts + dark mode on page load
window.onload = function () {
    const savedPosts = JSON.parse(localStorage.getItem("blogPosts")) || [];
    savedPosts.forEach(post => displayPost(post));

    const darkMode = localStorage.getItem("darkMode");
    if (darkMode === "enabled") {
        document.body.classList.add("dark-mode");
    }
};

// Publish button
if (button) {
    button.addEventListener("click", function () {
        const title = document.getElementById("post-title").value;
        const content = contentBox.value;
        const colour = colourPicker ? colourPicker.value : "#000000";

        if (title === "" || content === "") {
            alert("Please fill in both fields");
            return;
        }

        const formattedContent = formatText(content);

        let imageURL = "";
        if (imageInput && imageInput.files.length > 0) {
            imageURL = URL.createObjectURL(imageInput.files[0]);
        }

        const postData = {
            title: title,
            content: formattedContent,
            colour: colour,
            image: imageURL,
            date: new Date().toLocaleString()
        };

        savePost(postData);
        displayPost(postData);

        // Clear inputs
        document.getElementById("post-title").value = "";
        contentBox.value = "";
        if (imageInput) imageInput.value = "";
    });
}

// Bold button
if (boldBtn) {
    boldBtn.addEventListener("click", function () {
        wrapText("**", "**");
    });
}

// Italic button
if (italicBtn) {
    italicBtn.addEventListener("click", function () {
        wrapText("*", "*");
    });
}

// Dark mode toggle
if (darkModeToggle) {
    darkModeToggle.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")) {
            localStorage.setItem("darkMode", "enabled");
        } else {
            localStorage.setItem("darkMode", "disabled");
        }
    });
}

// Wrap selected text (for bold/italic)
function wrapText(startTag, endTag) {
    const start = contentBox.selectionStart;
    const end = contentBox.selectionEnd;
    const text = contentBox.value;

    const selectedText = text.substring(start, end);
    const newText =
        text.substring(0, start) +
        startTag + selectedText + endTag +
        text.substring(end);

    contentBox.value = newText;
}

// Convert markdown-style formatting to HTML
function formatText(text) {
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");
    return text;
}

// Display post with edit & delete
function displayPost(postData) {
    const post = document.createElement("div");
    post.classList.add("post");

    post.innerHTML = `
        <h3>${postData.title}</h3>
        <small>${postData.date}</small>
        <p style="color: ${postData.colour};">${postData.content}</p>
        ${postData.image ? `<img src="${postData.image}" class="post-image">` : ""}
        <br>
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
        <hr>
    `;

    // Delete button (removes from screen + localStorage)
    const deleteBtn = post.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", function () {
        post.remove();
        deletePost(postData);
    });

    // Edit button
    const editBtn = post.querySelector(".edit-btn");
    editBtn.addEventListener("click", function () {
        const newTitle = prompt("Edit title:", postData.title);
        const newContent = prompt("Edit content:", postData.content);

        if (newTitle && newContent) {
            postData.title = newTitle;
            postData.content = formatText(newContent);
            updatePosts();
            postsDiv.innerHTML = "";
            loadPosts();
        }
    });

    postsDiv.appendChild(post);
}

// Save post to localStorage
function savePost(post) {
    let posts = JSON.parse(localStorage.getItem("blogPosts")) || [];
    posts.push(post);
    localStorage.setItem("blogPosts", JSON.stringify(posts));
}

// Delete post from localStorage
function deletePost(postToDelete) {
    let posts = JSON.parse(localStorage.getItem("blogPosts")) || [];
    posts = posts.filter(post =>
        !(post.title === postToDelete.title &&
          post.content === postToDelete.content &&
          post.date === postToDelete.date)
    );
    localStorage.setItem("blogPosts", JSON.stringify(posts));
}

// Reload posts from storage
function loadPosts() {
    const savedPosts = JSON.parse(localStorage.getItem("blogPosts")) || [];
    savedPosts.forEach(post => displayPost(post));
}

// Update storage after editing
function updatePosts() {
    const allPosts = [];
    document.querySelectorAll(".post").forEach(postElement => {
        const title = postElement.querySelector("h3").innerText;
        const content = postElement.querySelector("p").innerHTML;
        const date = postElement.querySelector("small").innerText;
        const colour = postElement.querySelector("p").style.color;

        allPosts.push({ title, content, date, colour, image: "" });
    });
    localStorage.setItem("blogPosts", JSON.stringify(allPosts));
}

if (searchInput) {
    searchInput.addEventListener("input", function () {
        const searchText = searchInput.value.toLowerCase();

        const allPosts = document.querySelectorAll(".post");

        allPosts.forEach(post => {
            const title = post.querySelector("h3").innerText.toLowerCase();
            const content = post.querySelector("p").innerText.toLowerCase();

            if (title.includes(searchText) || content.includes(searchText)) {
                post.style.display = "block";
            } else {
                post.style.display = "none";
            }
        });
    });
}