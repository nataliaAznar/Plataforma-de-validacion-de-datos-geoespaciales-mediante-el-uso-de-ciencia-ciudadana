 
function preanalyzeFile(token, filename, callback){
// Makes the necessary changes to the file, if any
  callback();
}


function prepareDB(token, filename, callback){
//   Makes the necessary modifications to the database.
//   Executes the createTable methods of the tests
  callback();
}


function createTempTables(callback){
//   Creates the necessary temp tables, if any
  callback();
}


function importData(token, filename, callback){
//   inserts the data from the file to the database
  callback();
}

function deleteTempTables(token, callback){
//   deletes the temporal tables created before
  callback();
}

