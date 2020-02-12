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
		return res.redirect("/");
	});

	let results = [];
	let each_user = [];
	if (course_results != undefined || course_results.length > 0 ){
		
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


	let all_study_program =  await general_queries.get_table_info("STUDY_PROGRAM").catch((err)=>{
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
	parms.url_form_redirect = "/courses/create";
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

	// TODO: validate id, if number and not empty
	let id_course = req.params.id;
	parms.dropdown_options = [];
	
  	let data = {"from":"COURSE", "where": "course_ID", "id": id_course};
	
	// get course information by id
 	let courses_info = await general_queries.get_table_info_by_id(data).catch((err) => {
		console.log("Error Getting course info: ", err);
		
		// TODO: Rediret with message
		throw err;
	});
	
	if (courses_info == undefined || courses_info.length == 0){
		console.log("There is not information about this course");
		// TODO: Flash message
		return res.redirect(base_url);
	}

	courses_info = courses_info[0];

	
	// Get all study program
	let study_programs = await general_queries.get_table_info("STUDY_PROGRAM").catch((err) =>{
		console.log("Error getting study program info");
		// TODO: Rediret with message
		throw err;
	});
	
	// verify study program
	if (study_programs == undefined || study_programs.length == 0){
		console.log("This course do not belong to any study program");
		return res.redirect(base_url);
	}

	parms.std_results = study_programs;

	course = [
		courses_info.course_number,
		courses_info.course_name,
		courses_info.course_description
	];

	// Set dropdown data 
	study_programs.forEach( (element) =>{
		parms.dropdown_options.push({
			"ID" : element.prog_ID,
			"NAME": element.prog_name
		});
	});
	
	let index = 0;
	course_create_inputs.forEach((record) =>{
		record.value = course[index];
		index++;
	});

	parms.inputs = course_create_inputs;

	parms.form_method = "POST";
	parms.title_action = "Editing Course";
	parms.dropdown_title = "Study Program";
	parms.dropdown_name = "data[std_program]";
	parms.btn_title = "Submit";
	parms.url_form_redirect = `/courses/${id_course}?_method=PUT`;

	res.render('layout/create', parms);
});

/*
	** EDIT COURSES ** 
	PUT /courses/:id
*/
router.put('/:id', function(req, res) {

	// TODO: validate if number or empty 
	let course_id = req.params.id;

	// TODO: verify
	let course_data = [
		req.body.data.crname,
		req.body.data.description,
		req.body.data.crnumber,
		req.body.data.std_program
	];

	let study_program_update = [req.body.data.std_program, course_id];

	query.update_course(course_data, study_program_update);

	res.redirect(base_url);
});

/*
	--REMOVE COURSE--
	GET cousers/:id/remove
*/
router.get('/:id/remove', async function (req, res) {

	//TODO: validate id, if null or not a number
	let course_id = req.params.id;

	// for query
	let data = {"from": "COURSE", "where":"course_ID", "id":course_id, "join": "PROG_COURSE"};
	
	// getting course information from db
	let course = await general_queries.get_table_info_by_id_naturalJoin(data).catch((err) =>{
		console.log("Error getting the course: ", err);
		return res.redirect(base_url);
	});

	// validate course
	if (course == undefined || course.length == 0){
		console.log("Course not found");
		res.redirect(base_url);
	}

	// we only care about the first position
	course = course[0];
	
	// == variables for dinamic frondend ==
	parms.title_action = "Remove";
	parms.title_message = "Are you sure you want to delete this Course?";
	parms.form_action = `/courses/${course_id}?_method=DELETE`;
	parms.btn_title = "Delete";

	let names = ["Study Program", "Number", "Name", "description"];
	let values = [course.prog_ID, course.course_number, course.course_name, course.course_description];

	let record = [];
	for (let index = 0; index < names.length; index++) {
		record.push({"name": names[index], "value": values[index]})
	}
	// == end ==
	parms.record = record;
	res.render('layout/remove', parms);
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