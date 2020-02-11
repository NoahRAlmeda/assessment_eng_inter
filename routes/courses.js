var express = require('express');
var query = require("../helpers/queries/course_queries");
var general_queries = require("../helpers/queries/general_queries");
var router = express.Router();
const { course_create_inputs } = require("../helpers/layout_template/create");

// var authHelper = require('../helpers/auth');

const base_url = '/courses'
let parms = {
	"title": 'ABET Assessment',
	"base_url":base_url,
	"subtitle": 'Courses',
	"url_create": "/courses/create"
};

/*
 GET /courses
*/
router.get('/', async function(req, res) {

	parms.table_header = ["ID", "Course Name", "Course Number", "Study Program ID", "Date Created"];
	parms.results = [];
	let course_results = await query.get_course_info("COURSE").catch((err) =>{
		console.log("Error getting the courses results: ", err);
	});

	console.log(course_results);
	if (course_results != undefined || course_results.length > 0 ){
		let results = [];
		let each_user = [];
		course_results.forEach(course => {

			// first have to be the ID
			each_user.push(course["course_ID"]);
			each_user.push(course["course_name"]);
			each_user.push(course["course_number"]);
			each_user.push(course["prog_ID"]);
			each_user.push(course["date_created"]);
		
			results.push(each_user);
			each_user = [];
		});
		parms.results = results;
	}
	res.render('layout/home', parms);
});


/*
 GET /courses/create 
*/
router.get('/create', async function(req, res, next) {

	parms.dropdown_options = [];
	parms.dropdown_title = "Study Program";
	parms.dropdown_name = "data[prog_id]";
	parms.inputs = course_create_inputs;
	parms.title_action = "Create Course";


	let all_study_program =  await general_queries.get_table_info("study_program").catch((err)=>{
		console.log("Error getting the programs");
		throw err;
	});

	if (all_study_program != undefined){
		all_study_program.forEach( (element) =>{
			parms.dropdown_options.push({
				"ID" : element.prog_ID,
				"NAME": element.prog_name
			});
		});
	}
	parms.form_method = "POST";
	parms.url_form_rediret = "/courses/create";
	parms.btn_title = "Create";
  	res.render('layout/create', parms);
});

/* 
POST courses/create
*/
router.post('/create', function(req, res, next) {

  //TODO: verify values, null, undefined
  let data = req.body.data;

	//Insert into the DB the data from user
	query.insert_into_course([data.crnumber,data.crname, data.crdesc, data.prog_id], function(err, results){
		//TODO: catch error properly
	// console.log("HERE", prog_id);
		if (err) throw err; 
		res.redirect(base_url);

	});
});


/*
 GET /courses/:id/edit
*/
router.get('/:id/edit', async function(req, res) {
	let table_name = "COURSE";
	let id_course = req.params.id;
	let where_atr = "course_ID";

  	let data = {"from":table_name, "where":where_atr, "id": id_course};
  
 	let courses_info = await general_queries.get_table_info_by_id(data).catch((err) => {
		console.log("Error Getting course info: ", err);
		
		// TODO: Rediret with message
		throw err;
	});

	let study_program_info = await general_queries.get_table_info("STUDY_PROGRAM").catch((err) =>{
		console.log("Error getting study program info");
		// TODO: Rediret with message
		throw err;
	});	


	parms.course_ID = id_course;
	parms.std_results = study_program_info;
	parms.user_results = courses_info[0];

	data = {
	"from": "PROG_COURSE",
	"from2": "STUDY_PROGRAM",
	"where": "course_ID",
	"id": id_course
	};

	general_queries.get_table_info_by_id_naturalJoin(data, function (err, results) {

		console.log(results);
		parms.current_progName = results[0].prog_name;
		parms.current_progID   = results[0].prog_ID;
		if (err) {
		//HERE HAVE TO REDIRECT the user or send a error message
		throw err;
		}
		res.render('courses/editCourses', parms);
	});
});

/* EDIT home page. */
router.put('/:id/edit', function(req, res, next) {

	//TODO: verify values befero enter to DB
	let name = req.body.data.crname;
	let course_id = req.params.id;
	let prog_id =  req.body.data.prog_id;
	let course_desc = req.body.data.crdec;
	let course_number = req.body.data.crnumber;

	//TIENE QUE IR EN ESTE ORDEN.
	let data = {"name":name, "prog_id":prog_id,
	"course_desc":course_desc, "course_number":course_number,
	"course_id":course_id};

	let data2 = [prog_id, course_id];
	query.update_course(data, function(err, results){
		console.log("HERE", data);
		//TODO: cath this error
		if (err) throw err;

		console.log("EDITED STUDY PROGRAM");
		res.redirect(base_url);
	});
});


/*
 GET cousers/:id/remove
*/
router.get('/:id/remove', function (req, res) {

	//TODO: catch error in case there is not id
	let course_id = req.params.id;
	let course_table = "COURSE";
	let where_attr = "course_ID";
	let data = {"from": course_table,"where":where_attr, "id":course_id};
	general_queries.get_table_info_by_id(data, function(err, results){

	//TODO: catch erro
	if (err) throw err;
	try {
		parms.course_ID = results[0].course_ID;
		parms.course_name = results[0].course_name;
		parms.course_description = results[0].course_description;
		parms.date_created = results[0].date_created;
		parms.course_number = results[0].course_number;


		res.render('courses/deleteCourses', parms);
	} catch (error) {
		res.redirect(base_url);
	}
	});
});
/* DELETE ROUTE */
router.delete('/:id', function (req, res) {
  console.log("===================DELETED ROUTE=====================");

  //TODO: catch error in case of null
  let course_id = req.params.id;
  let table_name = "COURSE";
  let where_attr = "course_ID";

  let data = {"id":course_id, "from":table_name,"where":where_attr };

  general_queries.delete_record_by_id(data, function (err, results) {

	//TODO: catch error
	if (err) {
	  throw err;
	}
	res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	res.redirect("back");
  });
});



module.exports = router;

// //Paramns to routes links
// let parms = {};
//
// //Populate parms
// routes_names.forEach(e=>{
//   parms[e] = base_url + e;
// });
//
// // console.log(parms)
//
// // title is the same in all of the routes
// parms["title"] = 'ABET Assessment';
//
// /* GET home page. */
// router.get('/', function(req, res, next) {
//
//   var parms = { title: 'ABET Assessment' };
//
//   db.getConnection (function (err, connection){
//
//     let courseList = `Select *
//                     From COURSE natural join PROG_COURSE`
//
//     connection.query (courseList,function (err,results,fields){
//
//       // console.log(results);
//       parms.results = results;
//
//       res.render('courses/indexCourses', parms);
//
//     })
//     connection.release();
//   })
//
// });
//
//
// /* DELETE page. */
// router.get('/deleteCourses', function(req, res, next) {
//   res.render('courses/deleteCourses', parms);
// });
//
//
// /* DetailsCourse page. */
// router.get('/detailsCourses', function(req, res, next) {
//   res.render('courses/detailsCourses',parms);
// });
//
// /* Edit Course page. */
// router.get('/editCourses', function(req, res, next) {
//   res.render('courses/editCourses', parms);
// });
//
//
// module.exports = router;
