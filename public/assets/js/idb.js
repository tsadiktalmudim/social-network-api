// create variable to hold db connection
let db;
// establish connection to indexedDB called pizza_hunt and set it to version 1
const request = indexedDB.open("pizza-hunt", 1);

// this event will emit if the db version changes
request.onupgradeneeded = function (event) {
  //save a reference to the db
  const db = event.target.result;
  //create the object store called "new_pizza", autoIFncrement

  db.createObjectStore("new_pizza", { autoIncrement: true });
};

// upon a successful
request.onsuccess = function (event) {
  // when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
  db = event.target.result;

  // check if app is online, if yes run uploadPizza() function to send all local db data to api
  if (navigator.onLine) {
    uploadPizza();
  }
};

request.onerror = function (event) {
  // log error here
  console.log(event.target.errorCode);
};

// This function will be executed if we attempt to submit a new pizza and there's no internet connection
function saveRecord(record) {
  // open a new transaction with the database with read and write permissions
  const transaction = db.transaction(["new_pizza"], "readwrite");

  // access the object store for `new_pizza`
  const pizzaObjectStore = transaction.objectStore("new_pizza");

  // add record to your store with add method
  pizzaObjectStore.add(record);
}

function uploadPizza() {
  //open a transaction on your db
  const transaction = db.transaction(["new_pizza"], "readwrite");

  //access object store
  const pizzaObjectStore = transaction.objectStore("new_pizza");

  //get all records from store and set to var
  const getAll = pizzaObjectStore.getAll();

  //upon a successful getAll, run fetch function
  getAll.onsuccess = function () {
    // if there was data in the store, send it to api server
    if (getAll.result.length > 0) {
      fetch("/api/pizzas", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((serverReponse) => {
          if (serverReponse.message) {
            throw new Error(serverReponse);
          }
          // open another transaction
          const transaction = db.transaction(["new_pizza"], "readwrite");
          //access object store
          const pizzaObjectStore = transaction.objectStore("new_pizza");
          //clear all items in store
          pizzaObjectStore.clear();

          alert("All saved pizzas have been submitted!");
        })
        .catch((err) => console.log(err));
    }
  };
}

//list for app to come back online
window.addEventListener("online", uploadPizza);
