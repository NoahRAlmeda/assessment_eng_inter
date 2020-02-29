var express = require('express');
var router = express.Router();
var outcome_query = require("../helpers/queries/outcomes_queries");
var general_queries = require("../helpers/queries/general_queries");
const { outcome_create_inputs } = require("../helpers/layout_template/create");
var { validate_form } = require("../helpers/validation");


const base_url = '/outcomes';

//Paramns to routes links
let locals = {
	"title": "ABET Assessment",
	"subtitle": "Outcomes",
	"base_url": base_url,
	"url_create": "/outcomes/create",
	"form_id": "outcome_data",
	"api_get_url": "/outcomes",
	delete_redirect: null
};

/* 
	GET home page. 
*/
router.get('/', async function (req, res) {

	locals.results = [];

	let performance_query = {
		"from": "STUDENT_OUTCOME",
		"join": "STUDY_PROGRAM",
		"using": "prog_ID",
	}

	//Getting all the entries for the dropdown
	let stud_outcomes = await general_queries.get_table_info_inner_join(performance_query).catch((err) => {
		console.log("Error getting the outcomes information: ", err);
	});

	// getting all study program
	let study_programs = await general_queries.get_table_info("study_program").catch((err) => {
		console.log("Error getting studing program", err);
	});

	locals.study_programs = []; 
	if (study_programs != undefined && study_programs.length > 0){
		locals.study_programs =  study_programs;
	}

	locals.table_header = ["Name", "Study Program", "Description", "Creation date", "Performance Criteria", ""];

	if (stud_outcomes != undefined && stud_outcomes.length > 0) {
		let results = [];
		stud_outcomes.forEach(outcome => {

			// change date format 
			let date = new Date(outcome.date_created);
			date = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

			results.push({
				"ID": outcome["outc_ID"],
				"values": [
					outcome["outc_name"],
					outcome["prog_name"],
					outcome["outc_description"],
					date,
					"",
					""
				]
			});
		});
		locals.results = results;
	}
	res.render('outcome/home', locals);
});

router.get('/:id/getStudyProgram', async function (req, res) {

	if (req.params.id == undefined || isNaN(req.params.id)) {
		req.flash("error", "Cannot find the outcome");
		return res.redirect(base_url);
	}

	// id of the study program
	let study_program_id = req.params.id;
	let get_outcomes_query = { "from": "student_outcome", "where": "prog_ID", "id": study_program_id };

	// fetching data from db
	let outcomes = await general_queries.get_table_info_by_id(get_outcomes_query).catch((err) => {
		console.log("Error getting the information: ", err);
	});

	// verify
	if (outcomes == undefined || outcomes.length == 0) {
		return res.json([]);
	}

	// send response if it's good
	res.json(outcomes);
});


/* 
	-- SHOW CREATE OUTCOMES --
	GET /outcomes/create  
*/
router.get('/create', async function (req, res) {

	// store all profiles
	locals.profiles = [];
	locals.dropdown_options = [];
	locals.have_dropdown = true;
	locals.dropdown_title = "Study Program";
	locals.dropdown_name = "std_program";
	locals.title_action = "Create Outcome";
	locals.url_form_redirect = "/outcomes/create";
	locals.btn_title = "Create";

	let study_programs = await general_queries.get_table_info("STUDY_PROGRAM").catch((err) => {
		console.log("ERROR: ", err);
	});

	// validate
	if (study_programs == undefined || study_programs.length == 0) {
		console.log("Need to create a study program to work with outcomes");
		req.flash("error", "Cannot find any Study program, Need to create one");
		return res.redirect("/");
	}

	// reset value to nothing when creating a new record
	outcome_create_inputs.forEach((record) => {
		record.value = "";
	});

	locals.inputs = outcome_create_inputs;

	// for dynamic frontend
	study_programs.forEach((element) => {
		locals.dropdown_options.push({
			"ID": element.prog_ID,
			"NAME": element.prog_name
		});
	});

	res.render('layout/create', locals);
});
/*
	-- CREATE NEW OUTCOMES-- 
	POST /outcomes/create 
*/
router.post('/create', function (req, res) {

	// validate body
	if (req.body == undefined) {
		req.flash("error", "Cannot find outcome data");
		return res.redirect(base_url);
	}

	// to validation - expected values
	let key_types = {
		"outcome_name": 's',
		"outcome_description": 's',
		"std_program": 'n'
	}

	// if the values don't mach the type 
	if (!validate_form(req.body, key_types)) {
		console.log("Error in validation");
		req.flash("error", "Error in the information of the outcome");
		return res.redirect(base_url);
	}

	let data = {
		"outcome_name": req.body.outcome_name,
		"outcome_description": req.body.outcome_description,
		"program_id": req.body.std_program
	};

	outcome_query.insert_outcome(data).then(() => {
		req.flash("success", "Outcome Created");
		res.redirect(base_url);
	}).catch((err) => {
		console.log("error: ", err);
		req.flash("error", "Cannot create outcome");
		res.redirect(base_url);
	});
});


/* 
	-- SHOW outcome to edit --
	GET /outcomes/:id/edit 
*/
router.get('/:id/edit', async function (req, res) {

	if (req.params.id == undefined || isNaN(req.params.id)) {
		req.flash("error", "Cannot find the outcome");
		return res.redirect(base_url);
	}

	let out_id = req.params.id;

	// store all profiles
	locals.profiles = [];
	locals.dropdown_options = [];
	locals.have_dropdown = true;
	locals.dropdown_title = "Study Program";
	locals.dropdown_name = "std_program";
	locals.title_action = "Edit Outcome";
	locals.url_form_redirect = `/outcomes/${out_id}?_method=PUT`;
	locals.btn_title = "Edit";

	// data to find the outcome
	let data = {
		"from": "STUDENT_OUTCOME",
		"where": "outc_ID",
		"id": out_id
	};

	//get the putcome
	let outcome_to_edit = await general_queries.get_table_info_by_id(data).catch((err) => {
		console.log("Error getting the outcome: ", err);
	});

	if (outcome_to_edit == undefined || outcome_to_edit.length == 0) {
		console.log("Cannot find the outcome");
		req.flash("error", "Cannot find the outcome");
		return res.redirect(base_url);
	}
	outcome_to_edit = outcome_to_edit[0];

	// get study program
	let study_programs = await general_queries.get_table_info("STUDY_PROGRAM").catch((err) => {
		console.log("ERROR: ", err);
	});

	// validate study programs
	if (study_programs == undefined || study_programs.length == 0) {
		console.log("Cannot find any study program");
		return res.redirect(base_url);
	}

	let outcome = [
		outcome_to_edit.outc_name,
		outcome_to_edit.outc_description,
	]

	let index = 0;
	outcome_create_inputs.forEach((record) => {
		record.value = outcome[index];
		index++;
	});

	locals.inputs = outcome_create_inputs;

	// for dynamic frontend
	study_programs.forEach((element) => {
		locals.dropdown_options.push({
			"ID": element.prog_ID,
			"NAME": element.prog_name
		});
	});

	res.render('layout/create', locals);
});
/* 
	-- Update the outcome -- 
	PUT /outcome/:id
*/
router.put('/:id', function (req, res) {

	// validate body
	if (req.body == undefined || req.params.id == undefined || isNaN(req.params.id)) {
		req.flash("error", "Outcome don't exits");
		return res.redirect(base_url);
	}

	// to validation - expected values
	let key_types = {
		"outcome_name": 's',
		"outcome_description": 's',
		"std_program": 'n'
	}

	// if the values don't mach the type 
	if (!validate_form(req.body, key_types)) {
		console.log("Error in validation");
		req.flash("error", "Error in the information of the outcome");
		return res.redirect(base_url);
	}

	let data = {
		"outc_name": req.body.outcome_name,
		"outc_description": req.body.outcome_description,
		"outc_ID": req.params.id,
		"prog_ID": req.body.std_program
	};

	outcome_query.update_outcome(data).then((ok) => {
		console.log("EDITED OUTCOME");
		req.flash("success", "Outcome edited");
		res.redirect(base_url);
	}).catch((err) => {
		console.log("Error editing the outcome: ", err);
		req.flash("error", "Cannot edit the outcome");
		res.redirect(base_url);
	});
});


/*	
	-- REMOVE THE OUTCOME -- 
	DELETE /outcomes/:id 
*/
router.delete('/:id', function (req, res, next) {

	if (req.params.id == undefined || isNaN(req.params.id)) {
		req.flash("error", "Cannot find the outcome");
		return res.redirect(base_url);
	}

	let out_id = req.params.id;

	// Data to remove outcome
	let data = {
		"from": "STUDENT_OUTCOME",
		"where": "outc_ID",
		"id": out_id
	};

	general_queries.delete_record_by_id(data).then((ok) => {
		req.flash("success", "Outcome removed");
		res.redirect(base_url);
	}).catch((err) => {
		consolelog("ERROR REMOVING THE OUTCOME: ", err);
		req.flash("error", "Cannot remove this outcome");
		res.redirect(base_url);
	});
});


/* 
	-- API  OUTCOME TO remove --
	GET /outcome/:id/delete
*/
router.get('/get/:id', async function (req, res) {

	if (req.params.id == undefined || isNaN(req.params.id)) {
		return res.end();
	}
 
	let outcome_query = {
		"from": "STUDENT_OUTCOME",
		"join": "study_program",
		"using": "prog_ID",
		"where": "outc_ID",
		"id": req.params.id
	};

	// Get outcome to remove 
	let outcome_to_remove = await general_queries.get_table_info_inner_join_by_id(outcome_query).catch((err) => {
		console.log("Error: ", err);
	});

	if (outcome_to_remove == undefined || outcome_to_remove.length == 0) {
		return res.end();
	}

	outcome_to_remove = outcome_to_remove[0];

	let names = ["Name", "Description", "Study Program", "Date created"];

	// change date format 
	let date = new Date(outcome_to_remove.date_created);
	date = `${date.getMonth()}/${date.getDay()}/${date.getFullYear()}`;

	let values = [
		outcome_to_remove.outc_name,
		outcome_to_remove.outc_description,
		outcome_to_remove.prog_name,
		date
	];

	let record = [];
	for (let index = 0; index < names.length; index++) {
		record.push({ "name": names[index], "value": values[index] })
	}
	res.json(record);
});


module.exports = router;
