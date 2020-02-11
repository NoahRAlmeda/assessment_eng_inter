/* 
  * user_create_inputs -> inputs in the form /users/create
*/ 
module.exports.user_create_inputs = [
    {
        "title": "Inter ID",
         "placeHolder":"User Inter ID",
        "name": "interID",
        "isRequire": true
    },
    {
        "title": "Name",
         "placeHolder":"User Name",
        "name": "username",
        "isRequire": true
    },
    {
        "title": "Last Name",
         "placeHolder":"User Last Name",
        "name": "lastname",
        "isRequire": true
    },
    {
        "title": "email",
         "placeHolder":"User Email",
        "name": "email",
        "isRequire": true
    },
    {
        "title": "Phone Number",
         "placeHolder":"User Phone Number",
        "name": "phoneNumber",
        "isRequire": false
    }
];


/* 
  * course_create_inputs -> inputs in the form /courses/create
*/ 
module.exports.course_create_inputs = [
    {
        "title": "Number",
        "placeHolder":"Course Number",
        "name": "data[crnumber]",
        "isRequire": true
    },
    {
        "title": "Name",
        "placeHolder":"Course Name",
        "name": "data[crname]",
        "isRequire": true
    },
    {
        "title": "Description",
        "placeHolder":"Course Description",
        "name": "data[crdesc]",
        "isRequire": true
    },
]