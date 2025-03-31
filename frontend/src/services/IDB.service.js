
// this file contains the service that will be used to interact with the IndexedDB database.
angular.module('myApp').service("IDB", function ($q) {
  let db = null;
  let DB_NAME = "vehicalRental";
  let DB_VERSION = 6;
   function openDB(){
    let deferred = $q.defer();
    // If database is already open, return it immediately
    // to update the schema after the change
    // const txn = event.target.transaction;
    // const store = txn.objectStore('biddings')
    if (db) {
      deferred.resolve(db);
      return deferred.promise;
    }
    let request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = function (event) {
      console.log("db updated");
      db = event.target.result;
      if(!db.objectStoreNames.contains('messages')){
        const messagesObjectStore = db.createObjectStore("messages", {
          keyPath: "id", 
        })
        messagesObjectStore.createIndex('conversationIDIndex', 'conversation.id', {
          unique: false
        })
       
        messagesObjectStore.createIndex('senderIndex', 'sender.id', {
          unique :false
        })
        messagesObjectStore.createIndex('receiverIndex', 'receiver.id', {
          unique: false
        })
      }
      //Create or upgrade object stores
      if (!db.objectStoreNames.contains("users")) {
        const userObjectStore = db.createObjectStore("users", {
          keyPath: "id",
        });
        userObjectStore.createIndex("usernameIndex", "username", {
          unique: true,
        });
        userObjectStore.createIndex("cityIndex", "city", { unique: false });
      }
      if (!db.objectStoreNames.contains("vehicles")) {
        const vehiclesObjectStore = db.createObjectStore("vehicles", {
          keyPath: "id",
        });
        vehiclesObjectStore.createIndex("vehicleIDIndex", "id", {
          unique:true,
        })
        vehiclesObjectStore.createIndex("ownerIndex", "owner.id", {
          unique: false,
        });
        vehiclesObjectStore.createIndex("isApprovedIndex", "isApproved", {
          unique: false,
        });
      }
      if (!db.objectStoreNames.contains("vehicleReviews")) {
        const vehicleReviewsObjectStore = db.createObjectStore("carReviews", {
          keyPath: "id",
        });
        vehicleReviewsObjectStore.createIndex("idIndex", "id", { unique: true });
        vehicleReviewsObjectStore.createIndex("vehicleIndex", "car.id", {
          unique: false,
        });
        vehicleReviewsObjectStore.createIndex(
          "reviewerIndex",
          "reviewer.id",
          { unique: false }
        );
      }
       if(!db.objectStoreNames.contains("biddings")){
        const biddingsObjectStore = db.createObjectStore("biddings", {
          keyPath: "id",
        });
        biddingsObjectStore.createIndex("idIndex", "id", { unique: true });
        biddingsObjectStore.createIndex("vehicleIndex", "vehicle.id", {
          unique: false,
        });
        biddingsObjectStore.createIndex("bidderIndex", "bidder.id", {
          unique: false,
        });
        biddingsObjectStore.createIndex("ownerIndex", "owner.id", {
          unique: false,
        });
      
      } 
      if(!db.objectStoreNames.contains("conversations")){
        const conversationsObjectStore = db.createObjectStore("conversations", {
          keyPath: "id",
        });
        conversationsObjectStore.createIndex("idIndex", "id", { unique: true });
        conversationsObjectStore.createIndex("senderIndex", "sender.id", {
          unique: false,
        });
        conversationsObjectStore.createIndex("receiverIndex", "receiver.id", {
          unique: false,
        });
        conversationsObjectStore.createIndex('carIndex', 'car.id', {
          unique: false,
        });
      }
    };
    request.onsuccess = function (event) {
      db = event.target.result;
      if (db) {
        deferred.resolve(db);
      } else {
        deferred.reject("Database initialization failed");
      }
    };
    request.onerror = function (event) {
      deferred.reject("Error opening IndexedDB: " + event.target.errorCode);
    };
    return deferred.promise;
  }

  // function to register a user into the databse
 this.getItemByKey = function(storeName, key){
  let deffered = $q.defer();
  openDB().then(function(db){
    let transaction = db.transaction([storeName], "readonly");
    let objectStore = transaction.objectStore(storeName);
    let request = objectStore.get(key);
    request.onsuccess = function(event){
      deffered.resolve(event.target.result);
    }
    request.onerror = function(event){
      deffered.reject("Error getting item: " + event.target.errorCode);
    }
  }).catch(function(error){
    deffered.reject("Error opening database: " + error);
  });
 }
  /*
  function to register a user into the database
  @{param} user: the user object to be registered
  returns a promise representing the result of the operation
  */
  this.registerUser = function (user) {
    let deferred = $q.defer();
    openDB().then(function (db) {
      let transaction = db.transaction(["users"], "readonly");
      let objectStore = transaction.objectStore("users");
      let index = objectStore.index("usernameIndex");
      let request = index.get(user.username);
      request.onsuccess = function (event) {
        if (event.target.result) {
          deferred.reject("Username already exists");
        } else {
          let transaction = db.transaction(["users"], "readwrite");
          let objectStore = transaction.objectStore("users");
          user.confirmPassword = null;
          user.password = hashPassword(user.password);
          let addRequest = objectStore.add(user);
          addRequest.onsuccess = function (event) {
            deferred.resolve();
          };
          addRequest.onerror = function (event) {
            deferred.reject(
              "Error registering user: " + event.target.errorCode
            );
          };
        }
      };
      request.onerror = function (event) {
        deferred.reject("Error checking username: " + event.target.errorCode);
      };
    }).catch(function (error) {
      deferred.reject("Error opening database: " + error);
    });
    return deferred.promise;
  };
  
  /*
  function to login a user into the database
  @{param} username: the username of the user
  @{param} password: the password of the user
  returns a promise representing the result of the operation
  */
  this.loginUser = function (username, password){
    let deferred = $q.defer();
    openDB().then(function (db) {
      let transaction = db.transaction(["users"], "readonly");
      let objectStore = transaction.objectStore("users");
      let index = objectStore.index("usernameIndex");
      let request = index.get(username);
      request.onsuccess = function (event) {
        if (event.target.result) {
          if (event.target.result.password === hashPassword(password)) {
            const user = event.target.result;
            const block= user.isBlocked;
            if(block){
              deferred.reject("User is blocked");
            }
            sessionStorage.setItem("user", JSON.stringify(event.target.result));
            deferred.resolve();
          } else {
            deferred.reject("Invalid password");
          }
        } else {
          deferred.reject("User not found");
        }
      };
      request.onerror = function (event) {
        deferred.reject("Error checking username: " + event.target.errorCode);
      };
    }).catch(function(error) {
      deferred.reject("Error opening database: " + error);
    })
    return deferred.promise;
  }
  
  /*
  function to validate a user object
  @{param} user: the username validated
  returns a promise representing the result of the operation
  */
  this.getUserByUsername = function (username) {
    let deferred = $q.defer();
    if (!username) {
      deferred.reject("Invalid username provided");
      return deferred.promise;
    }
  
    openDB().then(function (db) {
        let transaction = db.transaction(["users"], "readonly");
        let objectStore = transaction.objectStore("users");
        
        // Use the existing index
        let index = objectStore.index("usernameIndex");
        let request = index.get(username);
      
        request.onsuccess = function (event) {
          deferred.resolve(request.result);
        };
        request.onerror = function (event) {
          deferred.reject("Error checking if user exists: " + event.target.errorCode);
        };
    }).catch(function(error) {
        deferred.reject("Error opening database: " + error);
    });
    return deferred.promise;
  };
  /*
  function to validate a user object
  returns all the users on the platform
  */
  this.getAllUsers = function(){
    let deferred = $q.defer();
    openDB().then(function (db) {
      let transaction = db.transaction(["users"], "readonly");
      let objectStore = transaction.objectStore("users");
      let request = objectStore.getAll();
      request.onsuccess = function (event) {
        deferred.resolve(event.target.result);
      };
      request.onerror = function (event) {
        deferred.reject("Error getting users: " + event.target.errorCode);
      };
    }).catch(function(error) {
      deferred.reject("Error opening database: " + error);
    });
    return deferred.promise;
  }
  /*
  function to update a user object 
  @{param} firstName: the first name of the user, lastName: the last name of the user,city: the city of the user
  */
  this.updateUser = function (username,firstName, lastName, city, updatedAt){
    console.log(username, firstName, lastName, city, updatedAt);
    let deferred = $q.defer();
    openDB().then(function (db) {
      let transaction = db.transaction(["users"], "readwrite");
      let objectStore = transaction.objectStore("users");
      let index = objectStore.index("usernameIndex");
      let request = index.get(username);
      request.onsuccess = function(event) {
        let user = event.target.result;
        if (user) {
          user.firstName = firstName;
          user.lastName = lastName;
          user.city = city;
          user.updatedAt = updatedAt;
          let updateRequest = objectStore.put(user);
          updateRequest.onsuccess = function(event) {
            sessionStorage.setItem("user", JSON.stringify(user));
            deferred.resolve("User updated successfully");
          };
          updateRequest.onerror = function(event) {
            deferred.reject("Error updating user: " + event.target.errorCode);
          };
        } else {
          deferred.reject("User not found");
        }
      };
      request.onerror = function(event) {
        deferred.reject("Error retrieving user: " + event.target.errorCode);
      };
    }).catch(function(error) {
      deferred.reject("Error opening database: " + error);
    });
    return deferred.promise;
  }

  /*
  function to add a car to the database
  @{param} car: car object to be added
  returns a promise representing the result of the operation
  */
  this.addCar = function (car){
    let deferred = $q.defer();
    openDB().then(function (db) {
      let transaction = db.transaction(["vehicles"], "readwrite");
      let objectStore = transaction.objectStore("vehicles");
      car.id = crypto.randomUUID();
      let addRequest = objectStore.add(car);
      addRequest.onsuccess = function (event) {
        deferred.resolve();
      };
      addRequest.onerror = function (event) {
        deferred.reject("Error adding car: " + event.target.errorCode);
      };
    }).catch(function(error) {  
      deferred.reject("Error opening database: " + error);
    });
    return deferred.promise;
  }
  /*
  function to get all the cars from the database with the status pending
  returns all the pending cars
  */
  this.getPendingCars = function(){
    let deferred = $q.defer();
    openDB().then(function (db) {
      let transaction = db.transaction(["vehicles"], "readonly");
      let objectStore = transaction.objectStore("vehicles");
      let index = objectStore.index("isApprovedIndex");
      let request = index.getAll("pending");
      request.onsuccess = function (event) {
        deferred.resolve(event.target.result);
      };
      request.onerror = function (event) {
        deferred.reject("Error getting pending cars: " + event.target.errorCode);
      };
    }).catch(function(error) {
      deferred.reject("Error opening database: " + error);
    });
    return deferred.promise;
  }
  /*
  function to get all the cars from the database with the status approved
  returns all the approved cars
  */
  this.getApprovedCars = function(){
    let deferred = $q.defer();
    openDB().then(function (db) {
      let transaction = db.transaction(["vehicles"], "readonly");
      let objectStore = transaction.objectStore("vehicles");
      let index = objectStore.index("isApprovedIndex");
      let request = index.getAll("approved");
      request.onsuccess = function (event) {
        deferred.resolve(event.target.result);
      };
      request.onerror = function (event) {
        deferred.reject("Error getting approved cars: " + event.target.errorCode);
      };
    }).catch(function(error) {
      deferred.reject("Error opening database: " + error);
    });
    return deferred.promise;
  }
   
  /* 
  function to approve a car with a carId
  @{param} carID: the id of the car to be approved
  returns a promise representing the result of the operation
  */
  this.approveCar = (carID) => {
    let deferred = $q.defer();
    openDB().then(function (db) {
      let transaction = db.transaction(["vehicles"], "readwrite");
      let objectStore = transaction.objectStore("vehicles");
      let index = objectStore.index("vehicleIDIndex");
      let request = index.get(carID);
      request.onsuccess = function(event) {
        let car = event.target.result;
        if (car) {
          car.isApproved = "approved";
          let updateRequest = objectStore.put(car);
          updateRequest.onsuccess = function(event) {
            deferred.resolve();
          };
          updateRequest.onerror = function(event) {
            deferred.reject("Error approving car: " + event.target.errorCode);
          };
        } else {
          deferred.reject("Car not found");
        }
      };
      request.onerror = function(event) {
        deferred.reject("Error retrieving car: " + event.target.errorCode);
      };
    }).catch(function(error) {
      deferred.reject("Error opening database: " + error);
    });
    return deferred.promise;
  };

  /*
  function to reject a car with a carId
  @{param} carID: the id of the car to be rejected
  returns a promise representing the result of the operation
  */
  this.rejectCar = (carID)=>{
    let deferred = $q.defer();
    openDB().then(function (db) {
      let transaction = db.transaction(["vehicles"], "readwrite");
      let objectStore = transaction.objectStore("vehicles");
      let index = objectStore.index("vehicleIDIndex");
      let request = index.get(carID);
      request.onsuccess = function(event) {
        let car = event.target.result;
        if (car) {
          car.isApproved = "rejected";
          let updateRequest = objectStore.put(car);
          updateRequest.onsuccess = function(event) {
            deferred.resolve();
          };
          updateRequest.onerror = function(event) {
            deferred.reject("Error approving car: " + event.target.errorCode);
          };
        } else {
          deferred.reject("Car not found");
        }
      };
      request.onerror = function(event) {
        deferred.reject("Error retrieving car: " + event.target.errorCode);
      };
    }).catch(function(error) {
      deferred.reject("Error opening database: " + error);
    });
    return deferred.promise;
  }

  /*
  function to update the price of a car with a carId and the value as new Price
  returns a promise representing the result of the operation
  */
  this.updateCarPrice = (carId, value)=>{
    console.log(carId);
    console.log(value);
    let deferred = $q.defer();
    openDB().then(function (db) {
      let transaction = db.transaction(["vehicles"], "readwrite");
      let objectStore = transaction.objectStore("vehicles");
      let index = objectStore.index("vehicleIDIndex");
      let request = index.get(carId);
      request.onsuccess = function(event) {
        let car = event.target.result;
        if (car) {
          car.carPrice = value;
          let updateRequest = objectStore.put(car);
          updateRequest.onsuccess = function(event) {
            deferred.resolve("car updated Successfully");
          };
          updateRequest.onerror = function(event) {
            deferred.reject("Error updating car: " + event.target.errorCode);
          };
        } else {
          deferred.reject("Car not found");
        }
      };
      request.onerror = function(event) {
        deferred.reject("Error retrieving car: " + event.target.errorCode);
      };
    }).catch(function(error) {
      deferred.reject("Error opening database: " + error);
    });
    return deferred.promise;
  }
  /*
  function to update the availability of a car with a carId and the value as new availability
  returns a car object representing the updated car or an error message
  */
  this.getCarByID = (ID) => {
    let deferred = $q.defer();
    openDB().then(function (db) {
      let transaction = db.transaction(["vehicles"], "readonly");
      let objectStore = transaction.objectStore("vehicles");
      let index = objectStore.index("vehicleIDIndex");
      let request = index.get(ID);
      request.onsuccess = function(event) {
        deferred.resolve(event.target.result);
      };
      request.onerror = function(event) {
        deferred.reject("Error retrieving car: " + event.target.errorCode);
      };
    }).catch(function(error) {
      deferred.reject("Error opening database: " + error);
    });
    return deferred.promise;
  }
  /*
  function to update the availability of a car with a carId and the value as new availability
  returns a promise representing the result of the operation
  */ 
  this.getAllCarsByUser = (userId)=>{
    let deferred = $q.defer();
    openDB().then(function (db) {
      let transaction = db.transaction(["vehicles"], "readonly");
      let objectStore = transaction.objectStore("vehicles");
      let index = objectStore.index("ownerIndex");
      let request = index.getAll(userId);
      request.onsuccess = function(event) {
        deferred.resolve(event.target.result);
      };
      request.onerror = function(event) {
        deferred.reject("Error retrieving cars: " + event.target.errorCode);
      };
    }).catch(function(error) {
      deferred.reject("Error opening database: " + error);
    });
    return deferred.promise;
  }


  /*
  function to toggle Car with a particular carID and value
  returns a promise representing the result of the operation
  */
  this.toggleUserCars = (carID, value) => {
    let deferred = $q.defer();
    openDB().then(function (db) {
      let transaction = db.transaction(["vehicles"], "readwrite");
      let objectStore = transaction.objectStore("vehicles");
      let index = objectStore.index("vehicleIDIndex");
      let request = index.get(carID);
      request.onsuccess = function(event) {
        let car = event.target.result;
        if (car) {
          car.deleted = value;
          let updateRequest = objectStore.put(car);
          updateRequest.onsuccess = function(event) {
            deferred.resolve();
          };
          updateRequest.onerror = function(event) {
           deferred.reject("Error deleting car: " + event.target.errorCode);
          };
        } else {
          deferred.reject("Car not found");
        }
      };
      request.onerror = function(event) {
        deferred.reject("Error retrieving car: " + event.target.errorCode);
      };
    }).catch(function(error) {
      deferred.reject("Error opening database: " + error);
    });
    return deferred.promise;
 
  };

  /*
  function to list a car with a carID
  returns all the approved cars
  */
  this.listCar = (carId)=>{
    let deferred = $q.defer();
    openDB().then(function (db) {
      let transaction = db.transaction(["vehicles"], "readwrite");
      let objectStore = transaction.objectStore("vehicles");
      let index = objectStore.index("vehicleIDIndex");
      let request = index.get(carId);
      request.onsuccess = function(event) {
        let car = event.target.result;
        if (car) {
          car.deleted = false;
          let updateRequest = objectStore.put(car);
          updateRequest.onsuccess = function(event) {
            deferred.resolve();
          };
          updateRequest.onerror = function(event) {
            deferred.reject("Error listing car: " + event.target.errorCode);
          };
        } else {
          deferred.reject("Car not found");
        }
      };
      request.onerror = function(event) {
        deferred.reject("Error retrieving car: " + event.target.errorCode);
      };
    }).catch(function(error) {
      deferred.reject("Error opening database: " + error);
    });
    return deferred.promise;
  }

  /*
  function to make a user a seller with a particular id
  returns a promise representing the result of the operation
  */
  this.makeUserSeller = (id) => {
    console.log(id);
    let deferred = $q.defer();
    openDB().then(function (db) {
      let transaction = db.transaction(["users"], "readwrite");
      let objectStore = transaction.objectStore("users");
      
      let request = objectStore.get(id);
      request.onsuccess = function(event) {
        let user = event.target.result;
        if (user) {
          user.isSeller = true;
          let updateRequest = objectStore.put(user);
          updateRequest.onsuccess = function(event) {
             sessionStorage.setItem("user", JSON.stringify(user));
            deferred.resolve();
          };
          updateRequest.onerror = function(event) {
            deferred.reject("Error updating user: " + event.target.errorCode);
          };
        } else {
          deferred.reject("User not found");
        }
      };
      request.onerror = function(event) {
        deferred.reject("Error retrieving user: " + event.target.errorCode);
      };
    }).catch(function(error) {
      deferred.reject("Error opening database: " + error);
    });
    return deferred.promise;
  };


  /*
  function to add a bid object to the database
  @{param} bid: the bid object to be added
  returns a promise representing the result of the operation
  */
  this.addBid = (bid) => {
    let deferred = $q.defer();

    // Ensure the bid object is defined and has an id property
    if (!bid) {
        deferred.reject("Bid object is undefined");
        return deferred.promise;
    }

    if (!bid.id) {
        bid.id = crypto.randomUUID(); // Generate a unique id if not present
    }

    openDB().then(function (db) {
        let transaction = db.transaction(["biddings"], "readwrite");
        let objectStore = transaction.objectStore("biddings");
       
        let addRequest = objectStore.add(bid);
        addRequest.onsuccess = function(event) {
            deferred.resolve();
        };
        addRequest.onerror = function(event) {
            deferred.reject("Error adding bid: " + event.target.error.message);
        };
    }).catch(function(error) {
        deferred.reject("Error opening database: " + error.message);
    });

    return deferred.promise;
};

 /*
  function to get all the bidding at a particular userId
  @{param} bid: the bid object to be added
  returns a promise representing the result of the operation
  */
this.getBookingsByOwnerId = (userId) => {
  let deferred = $q.defer();
  openDB().then(function (db) {
    let transaction = db.transaction(["biddings"], "readonly");
    let objectStore = transaction.objectStore("biddings");
    let index = objectStore.index("ownerIndex");
    let request = index.getAll(userId);
    request.onsuccess = function (event) {
      deferred.resolve(event.target.result);
    };
    
    request.onerror = function (event) {
      deferred.reject("Error getting owner bids: " + event.target.errorCode);
    };
  }).catch(function (error) {
    deferred.reject("Error opening database: " + error);
  });
  return deferred.promise;
};

/*
  function to change the booking status at a particular bookingID with the status
  @{param} bookingId: the bid id at which we want to update 
  returns a promise representing the result of the operation
  */
this.updateBookingStatus = (bookingID, status) => {
  let deferred = $q.defer();
  openDB().then(function (db) {
    let transaction = db.transaction(["biddings"], "readwrite");
    let objectStore = transaction.objectStore("biddings");
    let index = objectStore.index("idIndex");
    let request = index.get(bookingID);
    request.onsuccess = function(event) {
      let booking = event.target.result;
      if (booking) {
        booking.status = status;
        let updateRequest = objectStore.put(booking);
        updateRequest.onsuccess = function(event) {
          deferred.resolve();
        };
        updateRequest.onerror = function(event) {
          deferred.reject("Error updating booking: " + event.target.errorCode);
        };
      } else {
        deferred.reject("Booking not found");
      }
    };
    request.onerror = function(event) {
      deferred.reject("Error retrieving booking: " + event.target.errorCode);
    };
  }).catch(function(error) {
    deferred.reject("Error opening database: " + error);
  });
  return deferred.promise;
};
/*
  function to get all bookings at a particular carId
  @{param} carId: carId of a car
  returns a promise representing the result of the operation
*/
this.getBookingsByCarID = (carID)=>{
  let deferred = $q.defer();
  openDB().then(function (db) {
    let transaction = db.transaction(["biddings"], "readonly");
    let objectStore = transaction.objectStore("biddings");
    let index = objectStore.index("vehicleIndex");
    console.log(carID);
    let request = index.getAll(carID);
    request.onsuccess = function(event) {
      deferred.resolve(event.target.result);
    };
    request.onerror = function(event) {
      deferred.reject("Error retrieving bookings: " + event.target.errorCode);
    };
  }).catch(function(error) {
    deferred.reject("Error opening database: " + error);
  });
  return deferred.promise;
}
/*
  function to get all bookings from the database
  @{param} none
  returns a promise representing the result of the operation
  */
this.getAllBookings = ()=>{
  let deferred = $q.defer();
  openDB().then(function (db) {
    let transaction = db.transaction(["biddings"], "readonly");
    let objectStore = transaction.objectStore("biddings");
    let request = objectStore.getAll();
    request.onsuccess = function(event) {
      deferred.resolve(event.target.result);
    };
    request.onerror = function(event) {
      deferred.reject("Error getting bookings: " + event.target.errorCode);
    };
  }).catch(function(error) {
    deferred.reject("Error opening database: " + error);
  });
  return deferred.promise;
}


/*
  function to add get a booking object from the database at a particular bookingId
  @{param} bidId: bidId
  returns a promise representing the result of the operation
  */
this.getBookingByID = (bookingID)=>{
  let deferred = $q.defer();
  openDB().then(function (db) {
    let transaction = db.transaction(["biddings"], "readonly");
    let objectStore = transaction.objectStore("biddings");
    let index = objectStore.index("idIndex");
    let request = index.get(bookingID);
    request.onsuccess = function(event) {
      deferred.resolve(event.target.result);
    };
    request.onerror = function(event) {
      deferred.reject("Error getting booking: " + event.target.errorCode);
    };
  }).catch(function(error) {
    deferred.reject("Error opening database: " + error);
  });
  return deferred.promise;
}
// function to get bookings by bookingID 
this.getBookingsByCarId = (carID)=>{
  let deferred = $q.defer();
  openDB().then(function (db) {
    let transaction = db.transaction(["biddings"], "readonly");
    let objectStore = transaction.objectStore("biddings");
    let index = objectStore.index("vehicleIndex");
    let request = index.getAll(carID);
    request.onsuccess = function(event) {
      deferred.resolve(event.target.result);
    };
    request.onerror = function(event) {
      deferred.reject("Error getting bookings: " + event.target.errorCode);
    };
  }).catch(function(error) {
    deferred.reject("Error opening database: " + error);
  });
  return deferred.promise;
  
}
// function to update booking at a bookingID and add started == true and add startOdometerValue
this.updateBookingAndAddStartOdometerValue = (bookingID, startOdometerValue)=>{
  let deferred = $q.defer();
  openDB().then(function (db) {
    let transaction = db.transaction(["biddings"], "readwrite");
    let objectStore = transaction.objectStore("biddings");
    let index = objectStore.index("idIndex");
    let request = index.get(bookingID);
    request.onsuccess = function(event) {
      let booking = event.target.result;
      if (booking) {
        booking.started = true;
        booking.startOdometerValue = startOdometerValue;
        let updateRequest = objectStore.put(booking);
        updateRequest.onsuccess = function(event) {
          deferred.resolve();
        };
        updateRequest.onerror = function(event) {
          deferred.reject("Error updating booking: " + event.target.errorCode);
        };
      } else {
        deferred.reject("Booking not found");
      }
    };
    request.onerror = function(event) {
      deferred.reject("Error retrieving booking: " + event.target.errorCode);
    };
  }).catch(function(error) {
    deferred.reject("Error opening database: " + error);
  });
  return deferred.promise;

}

// function to update booking at a bookingID and add ended == true and add endOdometerValue
this.updateBookingAndAddEndOdometerValue = (bookingID, endOdometerValue) =>{
  let deferred = $q.defer();
  openDB().then(function (db) {
    let transaction = db.transaction(["biddings"], "readwrite");
    let objectStore = transaction.objectStore("biddings");
    let index = objectStore.index("idIndex");
    let request = index.get(bookingID);
    request.onsuccess = function(event) {
      let booking = event.target.result;
      if (booking) {
        booking.ended = true;
        booking.endOdometerValue = endOdometerValue;
        let updateRequest = objectStore.put(booking);
        updateRequest.onsuccess = function(event) {
          deferred.resolve();
        };
        updateRequest.onerror = function(event) {
          deferred.reject("Error updating booking: " + event.target.errorCode);
        };
      } else {
        deferred.reject("Booking not found");
      }
    };
    request.onerror = function(event) {
      deferred.reject("Error retrieving booking: " + event.target.errorCode);
    };
  }).catch(function(error) {
    deferred.reject("Error opening database: " + error);
  });
  return deferred.promise;
}

// function to add a review to the database
this.addReview = (review)=>{
  let deferred = $q.defer();
  openDB().then(function (db) {
    let transaction = db.transaction(["carReviews"], "readwrite");
    let objectStore = transaction.objectStore("carReviews");
    let addRequest = objectStore.add(review);
    addRequest.onsuccess = function(event) {
      deferred.resolve();
    };
    addRequest.onerror = function(event) {
      deferred.reject("Error adding review: " + event.target.errorCode);
    };
  }).catch(function(error) {
    deferred.reject("Error opening database: " + error);
  });
  return deferred.promise;
}



// getting all reviews of a particular car by car id
 this.getReviewsByCarID = (carID) => {
  let deferred = $q.defer();
  openDB().then(function (db) {
    let transaction = db.transaction(["carReviews"], "readonly");
    let objectStore = transaction.objectStore("carReviews");
    let index = objectStore.index("vehicleIndex");
    let request = index.getAll(carID);
    request.onsuccess = function(event) {
      deferred.resolve(event.target.result);
    };
    request.onerror = function(event) {
      deferred.reject("Error getting reviews: " + event.target.errorCode);
    };
  }).catch(function(error) {
    deferred.reject("Error opening database: " + error);
  });
  return deferred.promise;
 }

  this.getAllReviews = ()=>{
    let deferred = $q.defer();
    openDB().then(function (db) {
      let transaction = db.transaction(["carReviews"], "readonly");
      let objectStore = transaction.objectStore("carReviews");
      let request = objectStore.getAll();
      request.onsuccess = function(event) {
        deferred.resolve(event.target.result);
      };
      request.onerror = function(event) {
        deferred.reject("Error getting reviews: " + event.target.errorCode);
      };
    }).catch(function(error) {
      deferred.reject("Error opening database: " + error);
    });
    return deferred.promise;
  }

 // block the user at a particular userID
 this.blockUserByUserId = (userId)=>{
  let deferred = $q.defer();
  openDB().then(function (db) {
    let transaction = db.transaction(["users"], "readwrite");
    let objectStore = transaction.objectStore("users");
    let request = objectStore.get(userId);
    request.onsuccess = function(event) {
      let user = event.target.result;
      if (user) {
        user.isBlocked = true;
        let updateRequest = objectStore.put(user);
        updateRequest.onsuccess = function(event) {
          deferred.resolve();
        };
        updateRequest.onerror = function(event) {
          deferred.reject("Error blocking user: " + event.target.errorCode);
        };
      } else {
        deferred.reject("User not found");
      }
    };
    request.onerror = function(event) {
      deferred.reject("Error retrieving user: " + event.target.errorCode);
    };
  }).catch(function(error) {
    deferred.reject("Error opening database: " + error);
  });
  return deferred.promise;
 }
 

 // ----->>> conversations  <<<<---------

 // function to add a conversation to the database
 this.addConversation = (conversation)=>{
  conversation.id = crypto.randomUUID();
  let deferred = $q.defer();
  openDB().then(function (db) {
    let transaction = db.transaction(["conversations"], "readwrite");
    let objectStore = transaction.objectStore("conversations");
    let addRequest = objectStore.add(conversation);
    console.log(conversation);
    addRequest.onsuccess = function(event) {
      console.log(event.target.result);
      deferred.resolve(event.target.result);

    };
    addRequest.onerror = function(event) {
      deferred.reject("Error adding conversation: " + event.target.errorCode);
    };
  }).catch(function(error) {
    deferred.reject("Error opening database: " + error);
  });
  return deferred.promise;
 }
 this.getConversation = (convoId)=>{
  let deferred = $q.defer();
  openDB().then(function (db) {
    let transaction = db.transaction(["conversations"], "readonly");
    let objectStore = transaction.objectStore("conversations");
    let request = objectStore.get(convoId);
    request.onsuccess = function(event) {
      console.log(event.target.result);
      deferred.resolve(event.target.result);
    };
    request.onerror = function(event) {
      deferred.reject("Error getting conversation: " + event.target.errorCode);
    };
  }).catch(function(error) {
    deferred.reject("Error opening database: " + error);
  })
  return deferred.promise;
 }

 // function to get all the conversations of a particular user which means fetching all the conversations where the either the sender or the receiver is the user
 this.getUserConversations  = (userId)=>{
    let deferred = $q.defer();

    openDB().then(function (db) {
      let transaction = db.transaction(["conversations"], "readonly");
      let objectStore = transaction.objectStore("conversations");
      let index = objectStore.index("senderIndex");
      let request = index.getAll(userId);
      request.onsuccess = function(event) {
        let conversations = event.target.result;
        let receiverIndex = objectStore.index("receiverIndex");
        let request2 = receiverIndex.getAll(userId);
        request2.onsuccess = function(event) {
          conversations = conversations.concat(event.target.result);
          deferred.resolve(conversations);
        };
        request2.onerror = function(event) {
          deferred.reject("Error getting conversations: " + event.target.errorCode);
        };
      };
      request.onerror = function(event) {
        deferred.reject("Error getting conversations: " + event.target.errorCode);
      };
    }).catch(function(error) {
      deferred.reject("Error opening database: " + error);
    });
    return deferred.promise;
  }


  /// add a message to the database 
  this.addMessage = (message)=>{
    message.id = crypto.randomUUID();
    let deferred = $q.defer();
    openDB().then(function (db) {
      let transaction = db.transaction(["messages"], "readwrite");
      let objectStore = transaction.objectStore("messages");
      let addRequest = objectStore.add(message);
      addRequest.onsuccess = function(event) {
        deferred.resolve(event.target.result);
      };
      addRequest.onerror = function(event) {
        deferred.reject("Error adding message: " + event.target.errorCode);
      };
    }).catch(function(error) {
      deferred.reject("Error opening database: " + error);
    });

    return deferred.promise;
  }
   // get messages of a particular conversation
  this.getMessagesAtConversationID = ( conversationID)=>{
    let deferred = $q.defer();
    openDB().then(function (db) {
      let transaction = db.transaction(["messages"], "readonly");
      let objectStore = transaction.objectStore("messages");
      let index = objectStore.index("conversationIDIndex");
      let request = index.getAll(conversationID);
      request.onsuccess = function(event) {
        deferred.resolve(event.target.result);
      };
      request.onerror = function(event) {
        deferred.reject("Error getting messages: " + event.target.errorCode);
      };
    }).catch(function(error) {
      deferred.reject("Error opening database: " + error);
    });
    return deferred.promise;
  }

  this.injectAdmin = async function() {
    const user = {
        id: crypto.randomUUID(),
        username: "admin@123",
        password: "ujjwal@123",  // Using Base64 for now, but replace with a proper hash
        firstName: "admin",
        lastName: "admin",
        role: "admin",
    };

    try {
        // Check if admin user already exists in IndexedDB
        console.log(user);
        const existingUser = await this.getUserByUsername("admin@123");
        console.log(existingUser);
        if (existingUser) {
            console.log("Admin user already exists.");
            return;
        }
        // Register admin user
        await this.registerUser(user);
        console.log("Admin user injected successfully.");
        console.log("Admin user injected successfully.");
    } catch (error) {
        console.error("Error injecting admin user:", error);
    }
};

  
});
