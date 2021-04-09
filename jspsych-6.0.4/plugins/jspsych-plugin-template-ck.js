/*
 * Example plugin template
 */

jsPsych.plugins["PLUGIN-NAME"] = (function() {

  var plugin = {};

  plugin.info = {
    name: "PLUGIN-NAME",
    parameters: {
      // the type variable causes the parameter to automatically convert to that type.
      // if the parameter is a function, the function is executed.
      // the the conversion to the type is not possible, the script throws an error.
      parameter_name: {
        type: jsPsych.plugins.parameterType.INT, // BOOL, STRING, INT, FLOAT, FUNCTION, KEYCODE, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
        default: undefined
      },
      parameter_name: {
        type: jsPsych.plugins.parameterType.IMAGE,
        default: undefined
      },
      runTrial: {
        type: jsPsych.plugins.parameterType.BOOL,
        default: true,
        description: "A variable to help you decide if you want to run this trial or not"
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    // check if the trial runs
    if (trial.runTrial){

      // parameter from trial depacking
      let param1 = trial.param1;
      let param2 = trial.param2;

      // initialize all parameters for monitoring
      let value1;
      let value2;

      // initialize timeout handlers
      let timeout_handler1;

      // define all html elements (background first, forground later)
      let html = ""; // initialize empty html element
      html += '<div id="element1ID">' + trial.element1 + '</div>';

      // set the inner html of the  document
      display_element.innerHTML = html;

      // define all event functions (functions triggered on events)
      let action1 = function(){
        console.log('This is an action');
        value1 = 1;

        // call the end function
        end();
      }

      // define all time-related funtions (triggered on experiment start, using timeout)
      let time1 = function(){
        console.log('This happens after some time');
        value2 = 2;

        // call the end function
        end();
      };

      // define a trial end function in which you kill event listeners and timeouts and save the data
      let end = function(){
        // the end function MUST be called at some point during the trial.
        // otherwise, the trial runs forever

        // clear timeout
        clearTimeout(timeout_handler1);

        // data saving
        let trial_data = {
          "value1": value1,
          "value2": value2,
          "trial_ran": true
        };

        // end trial
        jsPsych.finishTrial(trial_data);
      };

      // assign event listeners to elements in the display
      // running the next lines activates the functions shown above.
      // event listeners can also be assigned to keys
      display_element.querySelector('#element1ID').addEventListener('click', action1); // 'click' can be replace by other actions

      // set timeouts to start the countdown to the event
      timeout_handler1 = setTimeout(time1, 100); // this would execute the time1 function after 100 ms.
      // the functions are now active

    } else {
      // if this trial should be skipped
      // save a minimal data package
      trial_data:{
        "trial_ran": false
      }
      // and end immediately
      jsPsych.finishTrial(trial_data);
    }

  };

  return plugin;
})();
