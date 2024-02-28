
const BOOK_ID = 'bookId';
const STORAGE_KEY = 'BOOKSELF_APP';
const RENDER_EVENT = 'render-book'
const SAVED_EVENT = 'save-book'
const LOAD_EVENT = 'load-book'
const UPDATE_STATUS = 'update-status-book'
const DELETE_EVENT = 'delete-book'
const UPDATE_BOOK = 'update-book'

const uncompleteBookList = document.getElementById('unfinished-booklist');
const completeBookList = document.getElementById('finished-booklist')

let books = [];

// cek dukungan browser 
function checkStorage() {
    if (typeof (Storage) === undefined) {
        alert('Browser anda tidak mendukung local storage');
        return false;
    } return true
}

// load data
function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);
    if (data !== null) {
        books = data;
    }
    document.dispatchEvent(new Event(LOAD_EVENT));
}

// toast
function toast(text, color) {
    const toast = document.createElement("div");
    toast.setAttribute('id', 'toast')
    toast.innerText = ` ${text}`;
    toast.style.backgroundColor = color
    toast.style.color = 'white'
    const body = document.body
    body.append(toast)

    setTimeout(function () {
        toast.remove()
    }, 2000)
}

// refresh data buku
function refreshDataFromBooks() {
    isCompleteBook(false, uncompleteBookList, books);
    isCompleteBook(true, completeBookList, books);
}

// save data ke localStorage
function saveData() {
    if (checkStorage()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
    }
}

//update data storage
function updateDataToStorage() {
    if (checkStorage()) {
        saveData();
    }
}
// buat data object book
function createBookObject(title, author, year, isComplete) {
    return {
        id: +new Date(),
        title,
        author,
        year,
        isComplete,
    }

}

//tambahkan buku
function addBook() {
    let isComplete = false;
    const form = document.getElementById('input-book')
    const title = document.getElementById('judul').value
    const author = document.getElementById('penulis').value
    const year = parseInt(document.getElementById('tahun').value)
    const complete = document.getElementById('complete')
    if (complete.checked) {
        isComplete = true
    }
    const bookObject = createBookObject(title, author, year, isComplete);
    books.push(bookObject);
    updateDataToStorage()
    form.reset()
    document.dispatchEvent(new Event(RENDER_EVENT));
}

// render buku
function renderBook(bookElement, boolean) {
    const listElement = document.createElement('li');
    const container = document.createElement("div");
    container.classList.add(`${bookElement.id}`);

    const title = document.createElement('h4');
    title.innerText = `Judul : ${bookElement.title}`;

    const author = document.createElement('p');
    author.innerText = `Author: ${bookElement.author}`;

    const year = document.createElement('p');
    year.innerText = `Tahun Terbit: ${bookElement.year}`;

    const deleteBook = document.createElement('button');
    deleteBook.innerText = 'Hapus Buku';
    deleteBook.addEventListener('click', (event) => {
        openDialog(event.target.parentElement)

    })

    const completeBook = document.createElement('button');
    completeBook.innerText = 'Selesai dibaca'
    completeBook.addEventListener('click', (event) => {
        addBookIsComplete(event.target.parentElement)
    })

    const undoCompleteBook = document.createElement('button');
    undoCompleteBook.innerText = 'Belum selesai dibaca'
    undoCompleteBook.addEventListener('click', (event) => {
        undoBookIsComplete(event.target.parentElement)
    })

    const editBook = document.createElement('button')
    editBook.innerText = "Edit Buku"
    editBook.addEventListener('click', (event) => {
        editBookIsComplete(event.target.parentElement)
    })

    container.append(title, author, year);
    if (boolean) {
        container.append(undoCompleteBook, deleteBook, editBook);
    } else {
        container.append(completeBook, deleteBook, editBook)
    }
    listElement.append(container)

    return listElement
}

//cari buku
function searchBook() {
    const search = document.getElementById('search').value
    const data = (books.filter((book) => {
        return book.title.toLowerCase().includes(search.toLowerCase())
    }))
    uncompleteBookList.innerHTML = '';
    completeBookList.innerHTML = '';
    isCompleteBook(true, completeBookList, data);
    isCompleteBook(false, uncompleteBookList, data);


}
// open dialog delete
function openDialog(parentElement) {
    document.getElementById("dialog-container").style.display = "block";

    const confirmDelete = document.getElementById('confirm');
    confirmDelete.addEventListener('click', () => {
        removeBook(parentElement)
        document.getElementById("dialog-container").style.display = "none";
    })
    const cancelDelete = document.getElementById('cancel');
    cancelDelete.addEventListener('click', () => {
        document.getElementById("dialog-container").style.display = "none";
    })
}



//hapus buku
function removeBook(parentElement) {
    const BookId = parentElement.classList.value
    const bookIndex = books.findIndex((book) => book.id == BookId)
    if (bookIndex !== -1) {
        books.splice(bookIndex, 1);
        parentElement.parentElement.remove()
        updateDataToStorage()
        document.dispatchEvent(new Event(DELETE_EVENT))
    }


}

// edit buku
function editBookIsComplete(parentElement) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const BookId = parentElement.classList.value
    const filteredBook = books.filter((book) => { return book.id == BookId })

    const btnSimpan = document.getElementById('simpan')
    const form = document.querySelector('.form-container')
    const title = document.getElementById('judul')
    const author = document.getElementById('penulis')
    const year = document.getElementById('tahun')
    const complete = document.getElementById('complete')
    title.value = filteredBook[0].title
    author.value = filteredBook[0].author
    year.value = filteredBook[0].year
    complete.checked = filteredBook[0].isComplete

    const btnCancel = document.createElement("button")
    btnCancel.innerText = "Batal"

    const btnUpdate = document.createElement("button")
    btnUpdate.innerText = "Update Buku"

    btnSimpan.remove()
    form.append(btnUpdate, btnCancel)

    btnCancel.addEventListener('click', (event) => {
        event.preventDefault()
        form.parentElement.reset()
        btnUpdate.remove()
        btnCancel.remove()
        form.append(btnSimpan)
    })

    btnUpdate.addEventListener('click', (event) => {
        event.preventDefault()
        filteredBook[0].title = title.value
        filteredBook[0].author = author.value
        filteredBook[0].year = year.value
        complete.checked ? filteredBook[0].isComplete = true : filteredBook[0].isComplete = false
        updateDataToStorage()
        document.dispatchEvent(new Event(UPDATE_BOOK))
        setTimeout(() => window.location.reload(), 2000)
    })
}



// ubah status buku ke true
function addBookIsComplete(parentElement) {
    const BookId = parentElement.classList.value
    const bookIndex = books.findIndex((book) => book.id == BookId)
    if (bookIndex !== -1) {
        books[bookIndex].isComplete = true
        completeBookList.append(renderBook(books[bookIndex], true))
        parentElement.parentElement.remove()
        updateDataToStorage()
        document.dispatchEvent(new Event(UPDATE_STATUS))
    }


}

// ubah status buku ke false
function undoBookIsComplete(parentElement) {
    const BookId = parentElement.classList.value
    const bookIndex = books.findIndex((book) => book.id == BookId)
    if (bookIndex !== -1) {
        books[bookIndex].isComplete = false
        uncompleteBookList.append(renderBook(books[bookIndex], false))
        parentElement.parentElement.remove()
        updateDataToStorage()
        document.dispatchEvent(new Event(UPDATE_STATUS))
    }

}

// render buku
function isCompleteBook(boolean, parentElement, data) {
    const bookFilter = data.filter((book) => book.isComplete == boolean)
    for (const bookStatus of bookFilter) {
        const bookElement = renderBook(bookStatus, boolean);
        parentElement.append(bookElement)
    }

}

//event
document.addEventListener(RENDER_EVENT, () => {
    uncompleteBookList.innerHTML = '';
    completeBookList.innerHTML = '';
    isCompleteBook(true, completeBookList, books)
    isCompleteBook(false, uncompleteBookList, books)
})

document.addEventListener(LOAD_EVENT, () => {
    refreshDataFromBooks()
})

document.addEventListener(SAVED_EVENT, () => {
    toast('Success tersimpan', 'green')
})

document.addEventListener(UPDATE_STATUS, () => {
    toast('Status berhasil diupdate', 'blue');
})

document.addEventListener(DELETE_EVENT, () => {
    toast('Buku berhasil dihapus', 'red');
})

document.addEventListener(UPDATE_BOOK, () => {
    toast('Buku berhasil diupdate', 'green');
})

//load
document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('input-book')
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
        document.dispatchEvent(new Event(SAVED_EVENT));
    });

    if (checkStorage()) {
        loadDataFromStorage();
    }
});