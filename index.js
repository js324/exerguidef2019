'use strict';
const functions = require('firebase-functions');
const {dialogflow} = require ('actions-on-google');
const WELCOME_INTENT = 'Default Welcome Intent';
const FALLBACK_INTENT = 'Default Fallback Intent';
const Datastore = require('@google-cloud/datastore');
const datastore = Datastore();
const CHOOSING_AN_EXERCISE_INTENT = 'ChoosingAnExercise';
const EXERCISE_TYPE_ENTITY = 'ChoosingAnExercise';
const DIFFICULTY_INTENT="Difficulty";
const DIFFICULTY_TYPE_ENTITY="DifficultyTable";
const CANCEL_INTENT = 'Cancel';
const DONE_INTENT="Done";
const app = dialogflow();
var isExercising=false;
var inreps=false;
var exercisecounter=0;
var setcounter=0;
var resultexercises;
var difficultyrest=0;
var difficultyreps=0;

const query1 = datastore.createQuery('ExerciseTable').filter('ProgramName', '=', 'Push');
const query2 = datastore.createQuery('ExerciseTable').filter('ProgramName', '=', 'Pull');
const query3 = datastore.createQuery('ExerciseTable').filter('ProgramName', '=', 'Legs');

app.intent(WELCOME_INTENT, (conv) => {
  conv.ask("Hello");
});
app.intent(FALLBACK_INTENT, (conv) => {
  conv.ask("Say that again");
}); 

//app.intent push/pull/legs --> Start with overview of exercise --> R u ready?
//save  P or P or L as a variable
//app.intent Yes --> Start with first exercise from PPL var --> Say exercise set/rep scheme
//app.intent Done --> Start Rest Timer --> Begin second exercise
	// Could have separate max timer for how long exercise takes
//app.intent Done --> Repeat 
//once done with fin exercise, exit out of program

app.intent(CHOOSING_AN_EXERCISE_INTENT, (conv) => {
     const quote_type = conv.parameters[EXERCISE_TYPE_ENTITY].toLowerCase();
     if (quote_type === "push" && isExercising===false) { 
       	 return datastore.runQuery(query1).then(results => {
           resultexercises=results;
           conv.ask("Okay, let's begin");
		   conv.ask("Your program will consist of " + String(resultexercises[0].length) + " exercises. You will begin with " + resultexercises[0][0].Exercises  + ". Each set will have " + resultexercises[0][0].Reps + " reps. Say done or something similar whenever you are finished with your sets! Say 'no more' if you can't continue anymore! "); 
           
       	   isExercising=true; 
		   return true;
         });
     } 
	if (quote_type === "pull" && isExercising===false) { 
           return datastore.runQuery(query2).then(results => {
             resultexercises=results;
             conv.ask("Okay, let's begin");
             conv.ask("Your program will consist of " + resultexercises[0].length + " exercises. You will begin with " + resultexercises[0][0].Exercises  + ". Each set will have " + resultexercises[0][0].Reps + " reps. Say done or something similar whenever you are finished with your sets! Say 'no more' if you can't continue anymore!"); 
			
             isExercising=true;
			 return true;
           });
       } 
  	if (quote_type === "legs" && isExercising===false) { 
       	 return datastore.runQuery(query3).then(results => {
           resultexercises=results;
           conv.ask("Okay, let's begin");
		   conv.ask("Your program will consist of " + resultexercises[0].length + " exercises. You will begin with " + resultexercises[0][0].Exercises  + ". Each set will have " + resultexercises[0][0].Reps + " reps. Say done or something similar whenever you are finished with your sets! Say 'no more' if you can't continue anymore!"); 
       	   isExercising=true;
		   return true;
         });
     } 
  	else if (isExercising===true)
    {
      conv.ask("You already are exercising!");
    }
  	else {
        conv.ask("That's not an exercise program!");
    }
	
});

/*app.intent(DIFFICULTY_INTENT, (conv) => {
		const difficulty_type = conv.parameters[DIFFICULTY_TYPE_ENTITY].toLowerCase();
		if (isExercising === true && inreps === false)
		{
			if (difficulty_type === "beginner") 
			{ 
				difficultyreps=0;
				conv.ask("You will begin with . Say done or something similar whenever you are finished with your sets!"); 
				
			}
			if (difficulty_type === "intermediate") 
			{
				
				difficultyrest= 20*-1;
				difficultyreps=2;
				conv.ask("You will begin with " + resultexercises[0][0].Exercises + ". Each set will have " + String(resultexercises[0][0].Reps+difficultyreps) + " reps. Say done or something similar whenever you are finished with your sets!"); 
			}
			if (difficulty_type === "advanced") 
			{
				difficultyrest= 30*-1;
				difficultyreps=4;
				conv.ask("You will begin with " + resultexercises[0][0].Exercises + ". Each set will have " + String(resultexercises[0][0].Reps+difficultyreps) + " reps. Say done or something similar whenever you are finished with your sets!"); 
			}
			
			inreps=true;
		}
		else 
		{
			conv.ask("You haven't picked a program yet!");
		}
		
});*/
app.intent(DONE_INTENT, (conv) => {
    	if (isExercising===true && exercisecounter < resultexercises[0].length)
        {	
          	if (setcounter < resultexercises[0][exercisecounter].Sets-1){
            	setcounter++;
              if (setcounter === 1) {
                conv.ask("Nice! That is " + String(setcounter) + " set finished! You have " + String(resultexercises[0][exercisecounter].Sets-setcounter) + " sets left." + " Enjoy a rest time of " + String(resultexercises[0][exercisecounter].RestTime) + " seconds.");
              }
			  else if (setcounter === resultexercises[0][exercisecounter].Sets-1)
			  {
				conv.ask("Nice! That is " + String(setcounter) + " set finished! You have " + String(resultexercises[0][exercisecounter].Sets-setcounter) + " set left." + " Enjoy a rest time of " + String(resultexercises[0][exercisecounter].RestTime) + " seconds.");
			  }				  
			 
              else {
                 conv.ask("Nice! That is " + String(setcounter) + " sets finished! You have " + String(resultexercises[0][exercisecounter].Sets-setcounter) +  " sets left." + " Enjoy a rest time of the same amount.");
                 
              }
              
                // 0); //delay is in milliseconds
			  
              //settimer
              //count down, 
            }
            else {      
                exercisecounter++;
             	if (exercisecounter === resultexercises[0].length) {
              		conv.ask("Fantastic! You are all done with your workout");
                  	isExercising=false;
                  	exercisecounter=0;
                  	setcounter=0;
                }
                if (isExercising===true && exercisecounter === 1) {
                conv.ask("Great job! That is " + String(exercisecounter) + " exercise down! " + String(resultexercises[0].length-exercisecounter) + " more to go! You will do "+  resultexercises[0][exercisecounter].Exercises + " next. For this next exercise, you will do " + resultexercises[0][exercisecounter].Reps + " reps with " + resultexercises[0][exercisecounter].Sets + " sets. Remember to say done or something similar whenever you are finished with your sets! ");
                }
                else if (isExercising===true){
                conv.ask("Great job! That is " + String(exercisecounter) + " exercises down! " + String(resultexercises[0].length-exercisecounter) + " more to go! You will do "+  resultexercises[0][exercisecounter].Exercises + " next. For this next exercise, you will do " + resultexercises[0][exercisecounter].Reps + " reps with " + resultexercises[0][exercisecounter].Sets + " sets. Remember to say done or something similar whenever you are finished with your sets!");
                }
              	
                //if statement checking if sets are done
              	
                  //could possibly have varied statements of encourage
                setcounter=0;
            }
        }
  		else if (isExercising === false)
        {
          	conv.ask("Done with what? Pick a program!");
        }
		
  		else 
        {
        	//test
        }
  		
  			
});
app.intent(CANCEL_INTENT, (conv) => {
  		conv.close("Okay, sorry to hear that!");
		isExercising=false;
        inreps=false;
		exercisecounter=0;
        setcounter=0;
		difficultyreps=0;
		difficultyrest=0;
		
});




exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);

