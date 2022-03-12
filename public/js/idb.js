//create var to hold db connection

let db;

//establish connection to db called 'budget_tracker' set to version 1

const request = indexedDB.open('budget_tracker', 1);

request.onupgradedneeded = function(event) {
    //save a reference to the database
    const db = event.target.result;
    //create an object store (table) called new_budget set it to having an auto incrementing primary key
    db.createObjectStore('new_budget', { autoIncrement: true});
};

request.onsuccess = function(event) {
    db = event.target.result;

    if(navigator.onLine) {
        uploadBudget();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['new_budget'], 'readwrite');

    //access the object store for 'new_budget'
    const budgetObjectStore = transaction.objectStore('new_budget');

    //add record to store with add method
    budgetObjectStore.add(record);
}

function uploadBudget() {
    const transaction = db.transaction(['new_budget'], 'readwrite');

    const budgetObjectStore = transaction.objectStore('new_budget');

    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function() {
        if(getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            }).then(response => response.json())
            .then(serverResponse => {
                if(serverResponse.message) {
                    throw new Error(serverResponse);
                }
               
            const transaction = db.transaction(['new_budget'], 'readwrite');

            const budgetObjectStore = transaction.objectStore('new_budget');

            budgetObjectStore.clear();

            alert('all save budgets have been submitted');
        })
        .catch(err => {
            console.log(err)
        })
    }
}
};

window.addEventListener('online', uploadBudget);