/**
 * manual-inhibition-jump
 * based on:
 * jspsych-html-button-response-touchdown
 * Josh de Leeuw
 *
 * plugin for displaying multiple stimuli and getting a touch response, with or without salient display changes
 * edited by Clara Kuper 2021
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins["manual-inhibition-jump"] = (function() {

    // define plugin info
    let plugin = {};
  
    plugin.info = {
      // every paramter that we need to pass to the function should be specified here.
      // we can either set a default value
      // or we can set it to undefined
      name: 'manual-inhibition-jump',
      description: 'one trial of the manual inhibition experiment, "jump" condition',
      parameters: {
        // html element parameter
        centralPoint: {
          type: jsPsych.plugins.parameterType.HTML_STRING,
          pretty_name: 'Center',
          default: undefined,
          description: 'The central point in the display.'
        },
        sidePoint: {
          type: jsPsych.plugins.parameterType.HTML_STRING,
          pretty_name: 'Side',
          default: undefined,
          description: 'The side point in the display.'
        },
        centralButton: {
          type: jsPsych.plugins.parameterType.HTML_STRING,
          pretty_name: 'Center Button',
          default: undefined,
          description: 'The response region for the central point.'
        },
        sideButton: {
          type: jsPsych.plugins.parameterType.HTML_STRING,
          pretty_name: 'Side Button',
          default: undefined,
          description: 'The response region for the side stimuli.'
        },
        jumpedPoint:{
          type: jsPsych.plugins.parameterType.HTML_STRING,
          pretty_name: 'Jumped Point',
          default: undefined,
          description: 'The jumped point in the display.'
        },
        flashUp:{
          type: jsPsych.plugins.parameterType.HTML_STRING,
          pretty_name: 'Flash Up',
          default: undefined,
          description: 'The upper region of the display turning white.'
        },
        flashDown:{
          type: jsPsych.plugins.parameterType.HTML_STRING,
          pretty_name: 'Flash Down',
          default: undefined,
          description: 'The lower region of the display turning white.'
        },
        // time/duration parameters
        trialDuration: {
          type: jsPsych.plugins.parameterType.INT,
          pretty_name: 'Trial duration',
          default: undefined,
          description: 'How long to show the trial.'
        },
        fixTime:{
          type: jsPsych.plugins.parameterType.INT,
          pretty_name: 'Fixation duration',
          default: undefined,
          description: 'How long to wait till the jump.'
        },
        flashTime:{
          type: jsPsych.plugins.parameterType.INT,
          pretty_name: 'Flash Time',
          default: undefined,
          description: 'When to show the flash after the jump.'
        },
        waitAfter:{
          type: jsPsych.plugins.parameterType.INT,
          pretty_name: 'Wait End',
          default: undefined,
          description: 'How long to wait at the end of the trial.'
        },
        flashDuration:{
          type: jsPsych.plugins.parameterType.INT,
          pretty_name: "Flash duration",
          default: 30,
          description: "How long the flash stays on screen"
        },
        // boolean parameters
        response_ends_trial: {
          type: jsPsych.plugins.parameterType.BOOL,
          pretty_name: 'Response ends trial',
          default: true,
          description: 'If true, then trial will end when user responds.'
        },
      }
    };
  
    plugin.trial = function(display_element, trial) {
  
        // copy some values from trial
        // this is not necessary, but helps to keep an overview
        let flash_time = trial.flashTime;
        let fix_time = trial.fixTime;
        let trial_dur = trial.trialDuration;
        let flash_dur = trial.flashDuration;
        let response_ends_trial = trial.response_ends_trial;
        let waitAfter = trial.waitAfter;

        // set response modality
        let responseOn = 'touchstart'; //'mousedown'; //
        let responseOff = 'touchend'; //'mouseup'; //
  
        // HTML ELEMENTS
        // make the html info
        // display stimulus
        let html = '<div id = "stimulus-central">' + trial.centralPoint + '</div>';

        // define other elements for later
        let sidePoint = '<div id = "stimulus-side" style="visibility: hidden">' + trial.sidePoint + '</div>';
        let jumpedPoint = '<div id = "stimulus-jumped" style="visibility: hidden">' + trial.jumpedPoint + '</div>';
  
        //display buttons (invisible)
        let centralButton = '<div id = "button-central">' + trial.centralButton + '</div>';
        let sideButton = '<div id = "button-side" style= "visibility: hidden">' + trial.sideButton + '</div>';
  
        html += sidePoint;
        html += jumpedPoint;
  
        html += centralButton;
        html += sideButton;
  
        // create flashes
        let flashUp =  '<div id="flash-up" style = "visibility: hidden">' + trial.flashUp + '</div>'
        let flashDown = '<div id="flash-down" style = "visibility: hidden">' + trial.flashDown + '</div>';
        html += flashUp;
        html += flashDown;
  
        // set the inner html
        display_element.innerHTML = html;
  
        // PARAMETERS
        // variables to track
        // timing
        let startTime; // trial start (timestamp)
        let endTime; // trial end (timestamp)
        let rtTime; // reaction time (duration)
        let mtTime; // movement time (duration)
        let goSignalTime; // stimulus jumped (timestamp)
        let goTime; // finger lift from central (timestamp)
        let respTime; // finger landed on side (timestamp)
        let flashOnTime; // flash appeared (timestamp)
        let flashOffTime; // flash was removed (timestamp)
        let tDur; // trial length (duration)
        let initTime = jsPsych.totalTime(); // when the trial was initiated (timestamp)
        let waitTime; // when the dot in the center was pressed (duration)
  
        // xy properties
        let allTouches = []; // array of touches across the entire screen (X, Y, time)
        let xyCoords = {
          // array to save the X and Y coordinates of central and side touches
          centralX: null,
          centralY: null,
          sideX: null,
          sideY: null,
        };
        let xyCrossScreen = {
          // array to save touches everywhere on the screen
          touchX: null,
          touchY: null,
        };
  
        // stimulus coordinates check
        let sideStim = document.getElementsByClassName('target')[0].getBoundingClientRect(); // element to save the side dot position
        let centralStim = document.getElementsByClassName('centralPoint')[0].getBoundingClientRect(); // element to save the central dot position
        let jumpedStim = document.getElementsByClassName('targetShift');
            if (jumpedStim.length > 0){
                jumpedStim = jumpedStim[0].getBoundingClientRect()}
            else{
                jumpedStim = sideStim;
            }; // element to save the jumped dot position

  
        // boolean checks
        let earlyResponse = false; // response before jump
        let lateResponse = true; // response after trial duration
        let goSignal = false; // jump happened
  
        // timout handles
        let flashTO; // flash appearance timeout
        let hideTO; // flash hide timeout
        let newTO; // jump (new dot) timeout
        let endTO; // trial end timeout on jump
        let endRespTO; // trial end timeout on touch
  
  
        // potential error messages
        let errors = [];
  
        // EVENT LISTENERS
        // record all touches across the document
        document.addEventListener(responseOn, function (e) {
          // save xy coordinates to the xyCrossScreen variable
          xyCrossScreen.touchX = e.pageX;
          xyCrossScreen.touchY = e.pageY;
          if (xyCrossScreen.touchX == null) {
            // if that didn't work, we might be on a different browser. Instead, we try:
            xyCrossScreen.touchX = e.changedTouches[0].screenX;
            xyCrossScreen.touchY = e.changedTouches[0].screenY;
          }
          // save all touches in our array
          allTouches.push(xyCrossScreen.touchX, xyCrossScreen.touchY, jsPsych.totalTime());
        })
  
        // FUNCTIONS
        let show_new = function () {
          // hide the central dot
          document.getElementById('button-central').style.visibility = 'hidden';
          document.getElementById('stimulus-central').style.visibility = 'hidden';
          // show the side dot
          document.getElementById('button-side').style.visibility = 'visible';
          document.getElementById('stimulus-side').style.visibility = 'visible';
          //set timeout to call show_flash
          flashTO = setTimeout(show_flash, flash_time);
          // set timout to end the entire trial
          endTO = setTimeout(end_trial, trial_dur);
          //start rt timer
          rtTime = jsPsych.totalTime();
          // set timestamp
          goSignalTime = jsPsych.totalTime();
          // confirm that a go signal was shown
          goSignal = true;
        };
  
        let hide_flash = function () {
          // show flash
          document.getElementById('flash-up').style.visibility = 'hidden';
          document.getElementById('flash-down').style.visibility = 'hidden';
          // save the time
          flashOffTime = jsPsych.totalTime();
        };
  
        let show_flash = function () {
          // show flash
          document.getElementById('flash-up').style.visibility = 'visible';
          document.getElementById('flash-down').style.visibility = 'visible';
          // save the time
          flashOnTime = jsPsych.totalTime();
          // set timeout to hide flash
          hideTO = setTimeout(hide_flash, flash_dur);
  
          // hide side dot
          document.getElementById('stimulus-side').style.visibility = 'hidden';
          // show jumped dot
          document.getElementById('stimulus-jumped').style.visibility = 'visible';
        };
  
        function onCentralTouch(e) {
          //set timeout to call show_new
          newTO = setTimeout(show_new, fix_time);
          //start trial duration
          startTime = jsPsych.totalTime();
          // save central XY
          xyCoords.centralX = e.pageX;
          xyCoords.centralY = e.pageY;
          if (xyCoords.centralX == null) {
            // if that didn't work, try a different version
            xyCoords.centralX = e.changedTouches[0].screenX;
            xyCoords.centralY = e.changedTouches[0].screenY;
          }
          // measure how long the person waited before a response
          waitTime = startTime - initTime;
        }
  
        function onCentralLift(e) {
          // handles lift events from the central button
          goTime = jsPsych.totalTime();
          // check if that was too early
          earlyResponse = !goSignal;
          if (earlyResponse) {
             // end the trial early after an early response
             after_response();
          }
          // determine rt
          rtTime = goTime - rtTime;
          // start movement time timer
          mtTime = goTime;

          // function hides the central button
          document.getElementById('button-central').style.visibility = 'hidden';
        }
  
        function onSideTouch(e) {
          // handles events when the sid button was touched
          // get time
          respTime = jsPsych.totalTime();
          // determine mt
          mtTime = respTime - mtTime;
          // save xy
          xyCoords.sideX = e.pageX;
          xyCoords.sideY = e.pageY;
          if (xyCoords.sideX == null) {
            // or try a different version
            xyCoords.sideX = e.changedTouches[0].screenX;
            xyCoords.sideY = e.changedTouches[0].screenY;
          }
          // set late response to false
          lateResponse = false;
          // call after response
          after_response();
        }
  
  
        // function to handle responses by the subject
        function after_response() {
          // get executed when the side button was pressed
          // measure rt
          endTime = jsPsych.totalTime();
          tDur = endTime - startTime;
  
          // disable all the buttons after a response
          document.getElementById('button-side').style.visibility = 'hidden';
          document.getElementById('stimulus-jumped').style.visibility = 'hidden';
  
          if (response_ends_trial) {
            // check if we need to end the trial now.
            // wait 100 ms before we actually end it
            endRespTO = setTimeout(end_trial, 100);
          }
        }

  
        // function to end trial when it is time
        function end_trial() {
  
          // kill any remaining setTimeout handlers
          jsPsych.pluginAPI.clearAllTimeouts();
          clearTimeout(flashTO);
          clearTimeout(hideTO);
          clearTimeout(newTO);
          clearTimeout(endTO);
          clearTimeout(endRespTO);
  
  
          // gather the data to store for the trial
          let trial_data = {
            "rt": rtTime, // reaction time
            "mt": mtTime, // movement time
            "tDur": tDur, // trial duration
            "cTouchX": xyCoords.centralX, // X touch central
            "cTouchY": xyCoords.centralY, // Y touch central
            "sTouchX": xyCoords.sideX, // X touch side
            "sTouchY": xyCoords.sideY, // Y touch side
  
            // custom timing
            "startTime": startTime, // trial started
            "endTime": endTime, // trial ended
            "goSignalTime": goSignalTime, // go signal was shown
            "goTime": goTime, // finger was lifted
            "respTime": respTime, // finger was on side button
            "flashOnTime": flashOnTime, // when the flash appeared
            "flashOffTime": flashOffTime, // when the flash disappeared
            "waitTime": waitTime, // how long the participant waited till they pressed the first button
  
            // check values
            "earlyResponse": earlyResponse,
            "lateResponse": lateResponse,
            "trialShown": true,
  
            // errors
            "errors": errors,
  
            // positions
            "sideX": sideStim.x,
            "sideY": sideStim.y,
            "centralX": centralStim.x,
            "centralY": centralStim.y,
            "jumpedX": jumpedStim.x,
            "jumpedY": jumpedStim.y,
            "docTouches": allTouches,
          };

          // clear the display
          display_element.innerHTML = '';
  
          // move on to the next trial
          setTimeout(jsPsych.finishTrial(trial_data), waitAfter);
        }
  
        // add event listeners to buttons
        display_element.querySelector('#button-central').addEventListener(responseOn, onCentralTouch);
        display_element.querySelector('#button-central').addEventListener(responseOff, onCentralLift);
        display_element.querySelector('#button-side').addEventListener(responseOn, onSideTouch);
  
        // add an error event listener
        window.onerror = function (msg, url, lineNo, columnNo, error) {
          errors.push(msg);
          return false;
        };
  
     /* } else {
        // if we should not run the trial
        // save a minimal trial data version
        let trial_data = {
          "trialShown": false, // marker that the trial was not shown
          "waitTime": 0.1, // time value for adding up the duration of the experiment
        };
  
        // move on to the next trial
        jsPsych.finishTrial(trial_data);
  
      }*/
  
    }
  
    return plugin;
  })();
  