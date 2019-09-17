var conn = require("./mysqlConnection").mysql_pool; //pool connection


function get_user_list(callback){
    `Getting the user's information from the database`

    console.log("Getting List of users")

    let userList = `Select *
                    From USER natural join USER_PROFILES natural join PROFILE`;

    conn.query(userList, function (err, results, fields) {
        if (err){
           return callback(err, null)
        };
        // console.log(results)
       return callback(null, results);
    });
}

//GET USER DATA USING user_ID
function get_user_by_id(id, callback){
    `Get user data using the id`

    console.log("Getting user data")

    let getUser = `Select *
              FROM USER
              where user_ID = ?`;

    conn.query(getUser,[id] ,function (err, results, fields) {
        if (err){
           return callback(err, null)
        };
        // console.log(results)
       return callback(null, results);
    });
}

//UPDATE TABLE USER
function update_user(data, callback){
    `Update the user table in the database`
    console.log("Getting user data")

    let updateUser = `update USER
            set inter_ID = ?, first_name= ?,
            last_name= ?, email= ?, phone_number= ?
            where user_ID = ? `;

    let user_data = [data.interID, data.fName, data.lName,data.email,data.pNumber, parseInt(data.userID)];

    conn.query(updateUser, user_data ,function (err, results, fields) {
        if (err){
           return callback(err, null)
        };
        // console.log(results)
       return callback(null, results);
    });
}

//DELETE USER FROM DATABASE
function delete_user_by_id(id, callback){
    `REMOVE USER BY ID`
    console.log("REMOVING user");
    
    let deleteUser = `DELETE
                    FROM USER
                    WHERE user_ID = ?;`;

    //Exe query
    conn.query(deleteUser, [id] ,function (err, results, fields) {
        if (err){
           return callback(err, null)
        };
        // console.log(results)
       return callback(null, results);
    });
}

module.exports.get_user_list = get_user_list;
module.exports.get_user_by_id = get_user_by_id;
module.exports.update_user = update_user;
module.exports.delete_user_by_id = delete_user_by_id;

