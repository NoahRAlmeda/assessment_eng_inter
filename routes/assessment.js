var express = require('express');
var router = express.Router();
var general_queries = require('../helpers/queries/general_queries');
var chooseCourseTermQuery = require('../helpers/queries/chooseCourseTermQueries');
var pInput_queries = require('../helpers/queries/pInput_queries');
var queries = require('../helpers/queries/perfTable_queries');
var reportTemplate = require('../helpers/reportTemplate');
var docx = require("docx");
var fs = require('fs');
let parms ={};
let assessmentID;

parms.title = 'ABET Assessment';

// <----- chooseCourseTerm GET request ----->
router.get('/chooseCourseTerm', function(req, res, next) {
  
  let table = "STUDY_PROGRAM";
  parms.program = [];
  parms.term = [];
  parms.rubric = [];
  parms.course = [];

  // get data from table
  general_queries.get_table_info(table,function(err, results){
  	// Copy the name of the course programs to parms.program
	parms.program = results;
	table = "STUDY_PROGRAM";

	general_queries.get_table_info(table,function(err, results) {
	  prog_id = results[0].prog_ID;
	  parms.program = results;
	  table = "ACADEMIC_TERM";
	  
	  general_queries.get_table_info(table,function(err, results) {
		  //copy the result to parms.terms
		  parms.term = results;
		
		  chooseCourseTermQuery.get_rubric_info(prog_id, function(err,results) {
			parms.rubric = results;

		  chooseCourseTermQuery.get_course_info(prog_id, function(err,results) {
			  parms.course = results;
			  console.group('ChooseTerm Load: ', parms);
			res.render('assessment/chooseCourseTerm', parms);
		  });
		});
	  });
	});
  });
});

// <------ ChooseCourseTems GET request ------>

router.get('/chooseCourseTerm/:id', function(req, res, next) {
  let prog_id = req.params.id;
  table = "STUDY_PROGRAM";

  general_queries.get_table_info(table,function(err, results) {
	var index = results.indexOf(results.find(o => o.prog_ID == prog_id))
	if (index != 0 && index != -1) {
	  let temp = results[index]
	  results[index] = results[0]
	  results[0] = temp
	}
	parms.program = results
	table = "ACADEMIC_TERM";
	general_queries.get_table_info(table,function(err, results){
	  // copy the result to parms.terms
	  parms.term = results;

	  chooseCourseTermQuery.get_rubric_info(prog_id, function(err,results) {
		  parms.rubric = results;
		chooseCourseTermQuery.get_course_info(prog_id, function(err,results) {
			parms.course = results;
		  res.render('assessment/chooseCourseTerm', parms);
		})
	  })
	})
  })
});

// <------ ChooseCourseTems Post request ------>

router.post('/chooseCourseTerm', function(req, res, next) {
  // splits the URL for the prog_ID and saves it
  req.body.prog_ID = req.body.prog_ID.split("/")[req.body.prog_ID.split("/").length - 1];
  // the 1 needs to be replaced with a real user id
  let data = [req.body.course_ID, req.body.term_ID, 5, req.body.rubric_ID]
  console.log("data", data);

  chooseCourseTermQuery.insert_assessment(data, function(err,results) {
	console.log("here?", results);
	res.redirect('/assessment/'+ results.insertId +'/professorInput');
  })
});


// <------ Professor Input GET request ------>

router.get('/:id/professorInput', function(req, res, next) {
  res.render('assessment/professorInput', { title: 'ABET Assessment' });
});


// <------ Professor Input POST request ------>

router.post('/:id/professorInput', function (req, res,next) {
	let data = [
	  req.body.A, req.body.B, req.body.C, req.body.D, req.body.F,
	  req.body.UW, req.body.rCourse, req.body.cReflection, req.body.cImprovement, null
	];
	  // Console log to show professor input data.
	  console.log("Professor Input: ", data);

	pInput_queries.insert_into_report(data, function(err, results){
	  // TODO: catch error properly
	  if (err) throw err;
	  // res.redirect('/assessment/' + req.params.id + '/professorInput');
	});
	res.redirect('/assessment/' + req.params.id + '/tableTest');
});

// <------ tableTest GET request ------>
// The ID being sent is the assessment ID
router.get('/:id/tableTest', async function(req, res, next) {
	assessmentID = req.params.id;
	console.log('assessmentID: ', assessmentID);
	let perf_criterias = await queries.get_perf_criterias(assessmentID).catch((err) => {
		console.log(err);
	}); 
	//IF found results from the database
	if (perf_criterias == undefined || perf_criterias.length == 0) {
		/* TODO:
			- Add Flash Message
		*/
		console.log('Performance Criteria not found.');	
		parms.colNums = 5;	
	}
	
	let queryResult = perf_criterias;
	amountCol = queryResult.length; // This is a test variable
	parms.colNums = amountCol;
	console.log("Query Results are: ", queryResult);

	res.render('tableTest', parms);
});

// <------ tableTest Post request ------>

/* TODO: for Noah R. Almeda 
	- Add graphs to report
	- Post the student scores into STUDENT_PERFORMANCE table
	- Comment code
	- Clean code
*/

router.post('/tableTest', async function(req, res, next) {
  // input contains an array of objects which are the inputs of the user
  let input = req["body"]["rowValue"]; 
  let studentScores= [];
  let inputCount = 0;
  
  // console.log(input); // console.log which displays input

  // for loop creating a multidimession array
  for (let i = 0; i < (input.length/4); i++ ) {
	studentScores[i] = [];
  }

  for (let i = 0; i < (input.length/4); i++) {
	for (let j = 0; j < amountCol; j++) {
	  studentScores[i][j] = input[inputCount];
	  inputCount++;
	}
  }
  // console.log("Here is inArr: ", studentScores);  // console.log which display the input in a arrays of arrays
  let firstRow = studentScores[0];
  let size = 0;
  // For loop to count the size of a rows since the input is receive as Objects
  for (let s in firstRow) {
	size++;
  }

  let sum = 0;
  let avgRow = [];

  // for loops which calculates average per rows
  for(let i = 0; i < studentScores.length; i++) {
	for(let j = 0; j < size; j++) {
	  // console.log("Student Score is: ", studentScores[i][j]);
	  sum += parseFloat(studentScores[i][j]);
	  // console.log("Sum is: ", sum);
	}
	// avgRow is an array which contains all the average rolls
	avgRow[i] = sum/parseFloat(size);
	sum = 0;
	// console.log("Avg of row", i, " : ", avgRow[i]);
  }
  console.log(avgRow);
  // console.log("Avg Row Array here: ", avgRow);

  let count = 1;
  let listOfObjects = [];
  // forEach creates a list of dictionaries
  avgRow.forEach(function(entry) {
	let singleObj = {};
	singleObj['rowID'] = count;
	singleObj['rowIn'] = studentScores[count-1];
	singleObj['rowAvg'] = entry;
	listOfObjects.push(singleObj);
	count++;
  });
  // console.log(listOfObjects); // This log displays the array of objects created. It contains all of the outputs for the tha table

  let threeMorePerc = [];
  let threeMoreCount = 0;
  let avgtreeMoreCount = 0;

  for(let i = 0; i < avgRow.length; i++) {
	if(avgRow[i] >= 3) {
	  avgtreeMoreCount++;
	}
  }
  
  let avgPerc = (avgtreeMoreCount/avgRow.length)*100;

  for(let i = 0; i < size; i++) {
	for (let j = 0; j < studentScores.length; j++) {
	  if(studentScores[j][i] >= 3) {
		threeMoreCount++;
	  }
	}
	threeMorePerc[i] = (threeMoreCount/studentScores.length)*100;
	threeMoreCount = 0;
	// console.log("Here: ", threeMorePerc[i]);
  }
  let colAvg = 54;
  
  console.log("Here is the percentage of the avarage column: ", avgPerc);

  threeMorePerc[threeMorePerc.length] = avgPerc;

  parms.colNums = amountCol;
  parms.row = listOfObjects;
  parms.avgCol = colAvg;
  parms.colPerc = threeMorePerc;

  let document = reportTemplate.createReport(parms);

  console.log('Student Scores: ', studentScores);
  if (size < 5)
	size = 5;
  for(let i = 0; i < studentScores.length; i++) {
	let studentPerformance = [];
	for(let j = 0; j < size; j++) {
		studentPerformance.push(studentScores[i][j]);

		if(studentPerformance[j] === undefined) {
			studentPerformance[j] = null;
		}
	}
	studentPerformance.push(assessmentID);
	let stud_performance_inserted = queries.insertData(studentPerformance);
	stud_performance_inserted.then((yes)=>{
		if(yes)
			console.log('Data was added to STUD_PERFORMANCE table.');
	}).catch((err) => {
		console.log('Wasn\'t able to add data.');
	});
  }

  docx.Packer.toBuffer(document).then((buffer) => {
	console.log("Created a doc");
	fs.writeFileSync("Document.docx", buffer);
  });

  res.render('resultTable', parms);
});

module.exports = router;