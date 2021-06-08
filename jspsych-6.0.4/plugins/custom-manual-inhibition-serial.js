/**
 * jspsych-html-button-response-serial
 * Josh de Leeuw
 * edited by Stefania Cionca and Clara Kuper 2021
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins["manual-inhibition-serial"] = (function() {

    var plugin = {};
  
    plugin.info = {
      // every paramter that we need to pass to the function should be specified here.
      // we can either set a default value
      // or we can set it to undefined
        name: 'manual-inhibition-serial',
        description: '',
        parameters: {
            // screen element parameters
            buttonsVisible: {
                type: jsPsych.plugins.parameterType.HTML_STRING,
                pretty_name: 'visible-buttons',
                default: undefined,
                array: true,
                description: 'The dots that show on the screen.'
            },
            buttonsInvisible: {
                type: jsPsych.plugins.parameterType.HTML_STRING,
                pretty_name: 'invisible-buttons',
                default: undefined,
                array: true,
                description: 'The invisible buttons in the forground.'
            },
            flashUp: {
                type: jsPsych.plugins.parameterType.HTML_STRING,
                pretty_name: 'Flash Up',
                default: undefined,
                description: 'The upper region of the display turning white.'
            },
            flashDown: {
                type: jsPsych.plugins.parameterType.HTML_STRING,
                pretty_name: 'Flash Down',
                default: undefined,
                description: 'The lower region of the display turning white.'
            },
            // timing parameters
            trialDuration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Trial duration',
                default: null,
                description: 'How long to show the trial.'
            },
            flashDuration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: "Flash duration",
                default: 30,
                description: "How long the flash stays on screen"
            },
            flashTime: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Flash Time',
                default: undefined,
                description: 'When to show the flash after the jump.'
            },
            waitAfter: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Wait End',
                default: undefined,
                description: 'How long to wait at the end of the trial.'
            },
            // boolean parameters
            runTrial: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Trial runs',
                default: true,
                description: 'A function that evaluates to true if the trial should be run.'
            },
      },
    };
  
    plugin.trial = function(display_element, trial) {
  
        // check if we want to run this trial in the first place
        if (trial.runTrial) {
  
            // copy some values from trial
            // this is not necessary, but helps to keep an overview
            let flashDur = trial.flashDuration;
            let flashTime = trial.flashTime;
            let trialDur = trial.trialDuration;
            let waitAfter = trial.waitAfter;
  
            // HTML ELEMENTS
            // initialize html
            let html = '';
  
            // display visible buttons
            for (var i = 0; i < trial.buttonsVisible.length; i++) {
                html += '<div id="visible-button-' + i + '" data-choice="' + i + '">' + trial.buttonsVisible[i] + '</div>';
            }
  
            // display invisible buttons
            for (var i = 0; i < trial.buttonsInvisible.length; i++) {
                html += '<div id="invisible-button-' + i + '" data-choice="' + i + '">' + trial.buttonsInvisible[i] + '</div>';
            }
  
            // display flashes (invisible first)
            html += '<div id="flashup" style = "visibility: hidden">' + trial.flashUp + '</div>';
            html += '<div id="flashdown" style = "visibility: hidden">' + trial.flashDown + '</div>';
  
            // set the html element
            display_element.innerHTML = html;
  
            // PARAMETERS
            // variables to track
            // timing
            let startTime; // trial started (first button pressed) - timestamp
            let endTime; // trial ended (last button pressed) - timestamp
            let flashOnTime; // flash appeared - timestamp
            let flashOffTime; // flash disappeared - timestamp
            let touchOnTime; // temporarily holds the timestamp when a button was touched
            let touchOffTime; // temporarily holds a timestamp when a button was released
            let touchOn = []; // when buttons were pressed - array of timestamps
            let touchOff = []; // when buttons were released - array of timestamps
            
            let initTime = performance.now(); // when the trial was initialized (timestamp)
            let waitTime; // how long the participant waited till they clicked the first button (duration)
  
            let tDur; // trial length (duration)
  
            // coordinates
            let touchCoordsX = []; // X coordinates of touches - array
            let touchCoordsY = []; // Y coordinates of touches - array
            let choiceOrder = []; // the order in which all stimuli were pressed
            let allTouches = []; // all touches with timestamps registered across the screen
  
            // set coordinates variables to monitor on button touch
            let xyCoords = {
                touchX: null,
                touchY: null,
            };
  
            // set coordinate variables to monitor all screen touches
            let xyCrossScreen = {
                touchX: null,
                touchY: null
            };
  
            // stim coordinates
            let firstRect = document.getElementById('visible-button-0').getBoundingClientRect(); // position of the first stimulus on screen
  
            // boolean
            let orderResponse = true;
            let lateResponse = false;
  
            // initialize all timeout handles
            let flashTO;
            let hideTO;
            let endTO;
  
            // counts how many targets have already been pressed
            let target_counter = 0;
  
            // potential error messages
            let errors = [];
  
            // FUNCTIONS
            let getChoice = function (e) {
                // retrieves the choice value associated with each button
                choice = e.currentTarget.getAttribute('data-choice'); // sets label to button pressed
            };
  
            let setInvisible = function () {
                // hides the visible part of the button
                document.getElementById('visible-button-' + choice).style.visibility = 'hidden';
            };
  
            let hideFlash = function () {
                // hides the flash
                document.getElementById('flashup').style.visibility = 'hidden';
                document.getElementById('flashdown').style.visibility = 'hidden';
                // saves the time when this happened
                flashOffTime = jsPsych.totalTime();
            };
  
            let showFlash = function () {
                // set the flash element to visible
                document.getElementById('flashup').style.visibility = 'visible';
                document.getElementById('flashdown').style.visibility = 'visible';
                // save the time when this happened
                flashOnTime = jsPsych.totalTime();
                // set a timeout to hide the flash again
                hideTO = setTimeout(hideFlash, flashDur);
            };
  
            let getTargetXY = function (e) {
                // retrieve xy coordinates
                xyCoords.touchX = e.pageX;
                xyCoords.touchY = e.pageY;
                // maybe we need a different system
                if (xyCoords.touchX == null) {
                    xyCoords.touchX = e.touches[0].pageX;
                    xyCoords.touchY = e.touches[0].pageY;
                }
                ;
            };
  
            let onTouch = function (e) {
                // records touches on response buttons
                touchOnTime = jsPsych.totalTime(); // saves the time of when a button is pressed
                target_counter++; // increases the value of the target counter by one
                if (target_counter == 1) {
                    // execute this when the first target was touched
                    // retrieve the time this happened
                    startTime = touchOnTime;

                    waitTime = startTime - initTime;

                    // set a timeout to show the flash
                    flashTO = setTimeout(showFlash, flashTime);
                    // set a timeout to end the trial if it lasts too long
                    endTO = setTimeout(end_trial, trialDur);
                }
                // actions to perform on every touched target
                getChoice(e); // define the button that was pressed
                setInvisible(); // hide the visible button
                getTargetXY(e); // get xy coordinates
  
                // save some values
                choiceOrder.push(choice); // the id of the button
                touchOn.push(touchOnTime); // the time when it was pushed
                touchCoordsX.push(xyCoords.touchX); // the x coordinate where it was pushed
                touchCoordsY.push(xyCoords.touchY); // the y coordinate where it was pushed
            };
  
            let onRelease = function (e) {
                // execute this function when the invisible button is released
                // hides the invisible
                // this also prevents any additional actions on this item
                e.target.style.visibility = ('hidden');
                touchOffTime = jsPsych.totalTime(); // saves the time of when a button is released
                // check if this was the last button in the series
                if (target_counter == trial.buttonsVisible.length) {
                    // save the time when the trial ended
                    endTime = touchOffTime;
                    // define the duration of the trial
                    tDur = endTime - startTime
                    // end trial
                    end_trial();
                }
                // save the release time to our array
                touchOff.push(touchOffTime);
            };
  
            // function to end trial when it is time
            let end_trial = function () {
  
                // kill any remaining setTimeout handlers
                jsPsych.pluginAPI.clearAllTimeouts();
                clearTimeout(flashTO);
                clearTimeout(hideTO);
                clearTimeout(endTO);
  
                // check booleans
                // check if all buttons were pressed at the time this is executed
                lateResponse = target_counter < trial.buttonsVisible.length
                // define a new array to check the difference between the choices
                let newA = [];
                // compute difference between every choice
                for (let i = 1; i < choiceOrder.length; i++) newA.push(choiceOrder[i] - choiceOrder[i - 1]);
                // using the lines below would also allow backward collection
                //let absA = [];
                //for (let i = 1; i < newA.length; i++) absA.push(Math.abs(newA[i]));
                // check if they are all one
                orderResponse = newA.every((val, i, arr) => val === 1);
  
                // gather the data to store for the trial
                let trial_data = {
                    //timing
                    "startTime": startTime, // trial started (first button pressed) - timestamp
                    "endTime": endTime, // trial ended (last button pressed) - timestamp
                    "flashOnTime": flashOnTime,// flash appeared - timestamp
                    "flashOffTime": flashOffTime, // flash disappeared - timestamp
                    "touchOn": touchOn, // when buttons were pressed - array of timestamps
                    "touchOff": touchOff, // when buttons were released - array of timestamps
                    "tDur": tDur, // trial length (duration)
                    "waitTime": waitTime, // time till the first point was touched (duration)
  
                    // coordinates
                    "touchX": touchCoordsX, // X coordinates of touches - array
                    "touchY": touchCoordsY, // Y coordinates of touches - array
                    "choiceOrder": choiceOrder, // the order in which all stimuli were pressed
                    "allTouches": allTouches, // all touches with timestamps registered across the screeen
                    "button0-x": firstRect.x, // the x position of the first dot
                    "button0-y": firstRect.y, // the y position of the first dot
  
                    //booleans
                    "lateResponse": lateResponse, // if the response was on time
                    "orderResponse": orderResponse, // if the response was in order
                    "trialShown": true, // if the trial was presented at all
  
                    // other
                    "errors": errors, // any error messages in the console
                    
                };
  
                // clear the display
                display_element.innerHTML = '';
                // move on to the next trial after the waiting time
                setTimeout(jsPsych.finishTrial(trial_data), waitAfter);
            };
  
            // EVENT LISTENERS
            // record all touches across the document
            document.addEventListener('mousedown', function (e) {
                // change the xy coordinates
                xyCrossScreen.touchX = e.pageX;
                xyCrossScreen.touchY = e.pageY;
  
                // if pageX holds no coordinates, we might be on a different system, try 'changedTouches' instead
                if (xyCrossScreen.touchX == null) {
                    xyCrossScreen.touchX = e.changedTouches[0].pageX;
                    xyCrossScreen.touchY = e.changedTouches[0].pageY;
                }
                ;
                // save the values
                allTouches.push(xyCrossScreen.touchX, xyCrossScreen.touchY, jsPsych.totalTime());
            });
  
            // add event listeners to buttons
            // note: we only listen on invisible buttons. the visible buttons are only a guidance for the user
            // and the invisible buttons are actually larger
            for (var i = 0; i < trial.buttonsInvisible.length; i++) {
                display_element.querySelector('#invisible-button-' + i).addEventListener('mousedown', onTouch)
                display_element.querySelector('#invisible-button-' + i).addEventListener('mouseup', onRelease)
            };
  
            // add an error event listener
            window.onerror = function (msg, url, lineNo, columnNo, error) {
                errors.push(msg);
                return false;
            };
  
        } else{
            // if we don't run ths trial, execute this minimal version
            let trial_data = {
                // data array that indicates that the trial didn't run
                "trialShown": false, // marker that the trial was not shown
                "waitTime": 0.1, // value to add onto the duration
            };
            // move on to the next trial immediately
            jsPsych.finishTrial(trial_data);
        }
    };
    return plugin;
  })();
  