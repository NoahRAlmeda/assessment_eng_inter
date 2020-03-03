var { db } = require("../mysqlConnection"); //pool connection
var conn = db.mysql_pool;

/**
 * insert_into_deparment -> Create new department
 * @param {Array} data -> [dep_name, dep_description] 
 * @return {Promise} resolve with user data
 */
function insert_into_deparment(data){

    return new Promise(function(resolve, reject){
        // query for department insert
        let insert_query = `INSERT INTO DEPARTMENT (dep_name, dep_description) values(?, ?);`;

        conn.query(insert_query, data, function (err, results) {
            if (err) {
                reject(err || "Error inserting department");
            }else
                resolve(true);
        });
    });
}

/**
 * update_deparment ->  update department data
 * @param {Array} data -> [dep_name, dep_description, dep_ID] 
 * @return {Promise} resolve with user data
 */
function update_deparment(data){
    
    return new Promise(function(resolve, reject){

        let update_query = `UPDATE DEPARTMENT set dep_name= ?, dep_description= ? where dep_ID= ?`;

        //Exe query
        conn.query(update_query, data, function (err, results) {
            if (err)
                reject(err || "Error updating department");
            else            
                resolve(true);
        });
    });

}


/**
 * update_deparment ->  update department data
 * @param {Number} user_id id of the user
 * @param {Array} department_ids all id of the department
 * @return {Promise} resolve with user data
 */
function remove_user_department(user_id, department_ids){

    return new Promise(function(resolve, reject){
        
        if (department_ids == undefined || department_ids.length == 0){
            return reject("Cannot find any department to remove");
        }
        
        let to_insert = [];
        
        department_ids.forEach((element) => {
            to_insert.push([user_id, element]);
        });

        let update_query = `DELETE FROM USER_DEP WHERE (user_ID, dep_ID) IN (?)`;

        //Exe query
        conn.query(update_query, [to_insert], function (err, results) {
            if (err)
                reject(err || "Error updating department");
            else            
                resolve(true);
        });
    });
}

/**
 * update_deparment ->  update department data
 * @param {Number} user_id id of the user
 * @param {Array} department_ids all id of the department
 * @return {Promise} resolve with user data
 */
function insert_user_department(user_id, department_ids){

    return new Promise(function(resolve, reject){
        
        if (department_ids == undefined || department_ids.length == 0){
            return reject("Cannot find any department to remove");
        }
        
        let to_insert = [];
        
        department_ids.forEach((element) => {
            to_insert.push([user_id, element]);
        });

        let set_dept_query = `INSERT INTO USER_DEP (user_ID, dep_ID) values ?;`;

        //Exe query
        conn.query(set_dept_query, [to_insert], function (err, results) {
            if (err)
                reject(err || "Error updating department");
            else            
                resolve(true);
        });
    });
}
module.exports.insert_into_deparment = insert_into_deparment;
module.exports.update_deparment = update_deparment;
module.exports.remove_user_department = remove_user_department;
module.exports.insert_user_department = insert_user_department;


