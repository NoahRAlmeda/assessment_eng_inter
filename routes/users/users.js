var express = require('express');
var router = express.Router();
var conn = require("../../helpers/mysqlConnection").mysql_pool;

var queries = require('../../helpers/queries');


var parms = {
  title: 'ABET Assessment'
};

/* USER HOME*/
router.get('/', function (req, res) {
  try {

    //Get all user from the database (callback)
    queries.get_user_list(function(err, results){
      
      //TODO: redirect user to another page
      if (err){
        //HERE HAS TO REDIRECT the user or send a error message 
        throw err;
      } 

      //IF found results from the database
      if (results){
        console.log(results)
        parms.results = results;
      }

      res.render('users/users', parms);
    });
  } catch (error) {
    //TODO: send a error message to the user. 
    console.log(error);
    res.redirect('/');
  }
});
/*
EDIT USER ROUTE
*/
router.get('/:id/edit', function(req, res){
  console.log("EDIT ROUTE");

  var parms = { title: 'ABET Assessment' };
  
  //TODO: catch error in case there is not id
  let user_id = req.params.id;
  
  queries.get_user_by_id(user_id, function(err, results){
    parms.interID = results[0].inter_ID;
    parms.fName = results[0].first_name;
    parms.lName = results[0].last_name;
    parms.email = results[0].email;
    parms.pNumber = results[0].phone_number;
    parms.userID = req.params.id;
    // console.log(req.body.editButton);
    res.render('users/editUsers', parms);
  });
});
/*
UPDATE USER ROUTE
*/
router.put('/:id', function(req, res){
  console.log("================UPDATE ROUTE==================");

  let user_data_to_update = req.body.data;

  queries.update_user(user_data_to_update, function(err, results){
    if (err){
      //TODO: catch error
      throw err;
    }    
    console.log("User update")
    res.redirect("/users");
  });

  console.log("================UPDATE ROUTE==================");
});


/*
REMOVE USER ROUTE
*/

router.get('/:id/remove', function(req, res){
  console.log("REMOVE ROUTE");

  var parms = { title: 'ABET Assessment' };
  
  //TODO: catch error in case there is not id
  let user_id = req.params.id;
  
  queries.get_user_by_id(user_id, function(err, results){
    parms.interID = results[0].inter_ID;
    parms.fName = results[0].first_name;
    parms.lName = results[0].last_name;
    parms.email = results[0].email;
    parms.pNumber = results[0].phone_number;
    parms.userID = req.params.id;
    res.render('users/deleteUsers', parms);
  });
});

/*
DELETE ROUTE
*/ 
router.delete('/:id', function(req, res){
  console.log("===================DELETED ROUTE=====================");
  
  //TODO: catch error in case of null
  let user_id = req.params.id;

  queries.delete_user_by_id(user_id, function(err, results){
    
    //TODO: catch error
    if (err){
      throw err;
    }
    console.log("USER DELETED")
    console.log("===================DELETED ROUTE=====================");
    res.redirect("/users");
  });
});

module.exports = router;
