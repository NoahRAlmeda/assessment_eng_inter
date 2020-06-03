# Environment Setup for Development

## Getting Started

To begin you will need to install all the necessary tools to run the web application locally.

Start by installing the software stack depending you operating system. 

- If windows install the `WAMP` server stack
- If MacOS insall the `MAMP` server stack
- If Linux install the `LAMP` server stack

> Be sure to have Apache, MySQL and PHP installed and running.

After installing the stack, install the lastest version of `nodejs`

> At the moment of development for this application we were using version 13.7.0 

Once nodejs is installed make sure to install `npm` package manager to your system.

In addtion make sure to have `git` installed in your system to be able to clone the repository.

Once you have all the necessary tools installed in your system you can clone the repository using this command in your terminal:

```  
    git clone "https://github.com/welozano/assessmentEngInterBC.git"
```

Once you clone the repository enter the project folder.


```
     cd assessmentEngInterBC
```

After entering the folder you will need to run this command:

```
    npm install
```

`npm install` will install all of the project's dependencies.

To run the application use:

```
    node app.js
```

> **NOTE:** The database need to be create and needs to be populated with data. 

To create the database you will need to open the MySQL server or the package server you installed (WAMP, LAMP, MAMP). When the server is up and running, you'll need to open phpMyAdmin or you can use MySQL Workbench. Use your credentials to login, then you can import the database using the ABET_ASSESSMENT_SCHEMA_DB.sql file, or you can copy-paste the information of the file and paste it in the query box. Once you finish creating the database, it is time to add your profile, so the application let you login successfully. 

In the query box: 

To create your Profile: 
```
    INSERT INTO ABET.USER (inter_ID, first_name, last_name, email, phone_number) 
        values( 'G00000000', 'YourName', 'YourLastName', 'UniversityEmail', '7877878787');
```

Next you'll need to find your user_ID, run the next query and copy your user_ID: 

```
    SELECT user_ID FROM ABET.USER WHERE email = 'yourEmail';
```

Give some privileges to your profile: (1= admin) - (2= professor)
```
    INSERT INTO ABET.USER_PROFILES (user_ID, profile_ID) values(YourID, 1);
```

last, you'll need the last privilege, the coordinator privilege. First you need to find the ID of one study program. You have to copy one ID. to find Ids: 

```
    SELECT prog_ID FROM ABET.STUDY_PROGRAM
```

Then, with the ID of the study program copied, you need to run the last query to finish the setup:

```
    INSERT INTO USER_STUDY_PROGRAM (user_ID, prog_ID, is_coordinator) values (yourID, ProgramID, 1);
```

Now you can loggin into the application and give to other users privilege using the web page. 

---

## Connecting your local Database to the web application.

----

To connect your MySQL database to the application first find the `helpers` folder.

![Alt Text](/Screenshots/SetUp/dbConnection/helperFolder.png)

Open the `helper` folder.

![Alt Text](/Screenshots/SetUp/dbConnection/helperOpen.png)

Create a new file called `credentials.js`. 

![Alt Text](/Screenshots/SetUp/dbConnection/helperNewfile.png)

![Alt Text](/Screenshots/SetUp/dbConnection/helperCredentials.png)

After creating the `credentials.js` file enter your database credentials as followed:

![Alt Text](/Screenshots/SetUp/dbConnection/credentialsInfo.png)
