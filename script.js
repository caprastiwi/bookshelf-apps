const storageKey = "STORAGE_KEY";

const addForm = document.getElementById("addBookForm");

function StorageCheck() {
  return typeof Storage !== "undefined";
}

addForm.addEventListener("submit", function (event) {
  const title = document.getElementById("inputBookTitle").value;
  const author = document.getElementById("inputBookAuthor").value;
  const year = parseInt(document.getElementById("inputBookYear").value);
  const isComplete = document.getElementById("inputBookIsComplete").checked;
  const idTemp = document.getElementById("inputBookTitle").name;
  
  if (idTemp !== "") {
    const bookData = GetBookList();
    for (let index = 0; index < bookData.length; index++) {
      if (bookData[index].id == idTemp) {
        bookData[index].title = title;
        bookData[index].author = author;
        bookData[index].year = year;
        bookData[index].isComplete = isComplete;
      }
    }
    localStorage.setItem(storageKey, JSON.stringify(bookData));
    ResetForm();
    RenderBookList(bookData);
    return;
  }

  const id = JSON.parse(localStorage.getItem(storageKey)) === null ? 0 + Date.now() : JSON.parse(localStorage.getItem(storageKey)).length + Date.now();
  const newBook = {
    id: id,
    title: title,
    author: author,
    year: year,
    isComplete: isComplete,
  };

  PutBookList(newBook);
  const bookData = GetBookList();
  RenderBookList(bookData);
});

function openForm() {
  const openForm = document.getElementById("addBookForm");
  const searchBtn = document.getElementById("searchBar");

  if (openForm.style.display === "block") {
    openForm.style.display = "none";
  } else {
    openForm.style.display = "block";
    searchBtn.style.display = "none";
  }
}

function cancelForm() {
  const openForm = document.getElementById("addBookForm");
  ResetForm();
  openForm.style.display = "none";
}

function openSearchBar() {
  const searchBtn = document.getElementById("searchBar");
  const openForm = document.getElementById("addBookForm");
  
  if (searchBtn.style.display === "block") {
    searchBtn.style.display = "none";
    ResetForm();
  } else {
    searchBtn.style.display = "block";
    openForm.style.display = "none";
  }
}

searchBook.addEventListener("submit", function (event) {
  event.preventDefault();
  const bookData = GetBookList();
  if (bookData.length === 0) {
    return;
  }
  const title = document.getElementById("searchBookTitle").value;
  if (title === null) {
    RenderBookList(bookData);
    return;
  }
  const bookList = SearchBookList(title);
  RenderBookList(bookList);
});

function SearchBookList(title) {
  const bookData = GetBookList();
  if (bookData.length === 0) {
    return;
  }
  const bookList = [];

  for (let index = 0; index < bookData.length; index++) {
    const tempTitle = bookData[index].title.toLowerCase();
    const tempTitleTarget = title.toLowerCase();
    if (bookData[index].title.includes(title) || tempTitle.includes(tempTitleTarget)) {
      bookList.push(bookData[index]);
    }
  }
  return bookList;
}

function PutBookList(data) {
  if (StorageCheck()) {
    let bookData = [];
    if (localStorage.getItem(storageKey) !== null) {
      bookData = JSON.parse(localStorage.getItem(storageKey));
    }
    bookData.push(data);
    localStorage.setItem(storageKey, JSON.stringify(bookData));
  }
}

function RenderBookList(bookData) {
  if (bookData === null) {
    return;
  }

  const ongoing = document.getElementById("ongoingList");
  const complete = document.getElementById("completeList");

  ongoing.innerHTML = "";
  complete.innerHTML = "";
  for (let book of bookData) {
    const id = book.id;
    const title = book.title;
    const author = book.author;
    const year = book.year;
    const isComplete = book.isComplete;

    let bookItem = document.createElement("article");
    bookItem.classList.add("book-item");
    bookItem.innerHTML = "<h3 name = " + id + ">" + title + "</h3>";
    bookItem.innerHTML += "<p>Author: " + author + "</p>";
    bookItem.innerHTML += "<p>Year: " + year + "</p>";

    let actionItem = document.createElement("div");
    actionItem.classList.add("action");

    const moveBtn = CreateMoveBtn(book, function (event) {
      isCompleteHandler(event.target.parentElement.parentElement);
      const bookData = GetBookList();
      ResetForm();
      RenderBookList(bookData);
    });

    const deleteBtn = CreateDeleteBtn(function (event) {
      DeleteItem(event.target.parentElement.parentElement);
      const bookData = GetBookList();
      ResetForm();
      RenderBookList(bookData);
    });

    actionItem.append(moveBtn, deleteBtn);
    bookItem.append(actionItem);

    if (isComplete === false) {
      ongoing.append(bookItem);
      bookItem.childNodes[0].addEventListener("click", function (event) {
        UpdateItem(event.target.parentElement);
      });
      continue;
    }

    complete.append(bookItem);
    bookItem.childNodes[0].addEventListener("click", function (event) {
      UpdateItem(event.target.parentElement);
    });
  }
}

function GetBookList() {
  if (StorageCheck) {
    return JSON.parse(localStorage.getItem(storageKey));
  }
  return [];
}

function ResetForm() {
  document.getElementById("inputBookTitle").value = "";
  document.getElementById("inputBookAuthor").value = "";
  document.getElementById("inputBookYear").value = "";
  document.getElementById("inputBookIsComplete").checked = false;
  document.getElementById("searchBookTitle").value = "";
}

function isCompleteHandler(itemElement) {
  const bookData = GetBookList();
  if (bookData.length === 0) {
    return;
  }

  const title = itemElement.childNodes[0].innerText;
  const titleNameAttribut = itemElement.childNodes[0].getAttribute("name");
  for (let index = 0; index < bookData.length; index++) {
    if (bookData[index].title === title && bookData[index].id == titleNameAttribut) {
      bookData[index].isComplete = !bookData[index].isComplete;
      break;
    }
  }
  localStorage.setItem(storageKey, JSON.stringify(bookData));
}

function CreateMoveBtn(book, eventListener) {
  const isFinished = book.isComplete ? "On-going" : "Complete";
  const moveBtn = document.createElement("button");
  moveBtn.classList.add("status");
  moveBtn.innerText = "Move to " + isFinished;
  moveBtn.addEventListener("click", function (event) {
    eventListener(event);
  });
  return moveBtn;
}

function MoveBtnHandler(parentElement) {
  let book = isCompleteHandler(parentElement);
  book.isComplete = !book.isComplete;
}

function CreateDeleteBtn(eventListener) {
  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("delete");
  deleteBtn.innerText = "Delete";
  deleteBtn.addEventListener("click", function (event) {
    eventListener(event);
  });
  return deleteBtn;
}

function DeleteItem(itemElement) {
  const bookData = GetBookList();
  if (bookData.length === 0) {
    return;
  }

  const titleNameAttribut = itemElement.childNodes[0].getAttribute("name");
  for (let index = 0; index < bookData.length; index++) {
    if (bookData[index].id == titleNameAttribut) {
      bookData.splice(index, 1);
      break;
    }
  }
  localStorage.setItem(storageKey, JSON.stringify(bookData));
}

function UpdateItem(itemElement) {
  if (itemElement.id === "ongoingList" || itemElement.id === "completeList") {
    return;
  }

  const bookData = GetBookList();
  if (bookData.length === 0) {
    return;
  }

  document.getElementById("searchBar").style.display = "none";
  document.getElementById("addBookForm").style.display = "block";

  const title = itemElement.childNodes[0].innerText;
  const author = itemElement.childNodes[1].innerText.slice(9, itemElement.childNodes[1].innerText.length);
  const getYear = itemElement.childNodes[2].innerText.slice(7, itemElement.childNodes[2].innerText.length);
  const year = parseInt(getYear);
  const isComplete = itemElement.childNodes[3].childNodes[0].innerText.length === "Selesai di baca".length ? false : true;

  const id = itemElement.childNodes[0].getAttribute("name");
  document.getElementById("inputBookTitle").value = title;
  document.getElementById("inputBookTitle").name = id;
  document.getElementById("inputBookAuthor").value = author;
  document.getElementById("inputBookYear").value = year;
  document.getElementById("inputBookIsComplete").checked = isComplete;

  for (let index = 0; index < bookData.length; index++) {
    if (bookData[index].id == id) {
      bookData[index].id = id;
      bookData[index].title = title;
      bookData[index].author = author;
      bookData[index].year = year;
      bookData[index].isComplete = isComplete;
    }
  }
  localStorage.setItem(storageKey, JSON.stringify(bookData));
}

window.addEventListener("load", function () {
  if (StorageCheck) {
    if (localStorage.getItem(storageKey) !== null) {
      const bookData = GetBookList();
      RenderBookList(bookData);
    }
  } else {
    alert("Browser tidak mendukung Web Storage");
  }
});