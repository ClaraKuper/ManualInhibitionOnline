/**
 * jspsych-html-button-response-touchdown
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a touch response
 * edited by Clara Kuper 2021
 * edited version works for touch responses and includes time stamps for touch events
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins["html-button-response-touchdown"] = (function() {

  var plugin = {};

    // variables to track
  let js_lifttime;
  let stimRect;

  let xyCoords = {
      liftX: null,
      liftY: null,
      touchX: null,
      touchY: null,
  };

  plugin.info = {
    name: 'html-button-response-touchdown',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The HTML string to be displayed'
      },
      choices: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Choices',
        default: undefined,
        array: true,
        description: 'The labels for the buttons.'
      },
      button_html: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button HTML',
        default: '<button class="jspsych-btn">%choice%</button>',
        array: true,
        description: 'The html of the button. Can create own style.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed under the button.'
      },
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: null,
        description: 'How long to hide the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show the trial.'
      },
      margin_vertical: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Margin vertical',
        default: '0px',
        description: 'The vertical margin of the button.'
      },
      margin_horizontal: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Margin horizontal',
        default: '8px',
        description: 'The horizontal margin of the button.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, then trial will end when user responds.'
      },
    }
  }

  plugin.trial = function(display_element, trial) {

    // display stimulus
    var html = '<div id="jspsych-html-button-response-stimulus">'+trial.stimulus+'</div>';

    //display buttons
    var buttons = [];
    if (Array.isArray(trial.button_html)) {
      if (trial.button_html.length == trial.choices.length) {
        buttons = trial.button_html;
      } else {
        console.error('Error in html-button-response plugin. The length of the button_html array does not equal the length of the choices array');
      }
    } else {
      for (var i = 0; i < trial.choices.length; i++) {
        buttons.push(trial.button_html);
      }
    }
    html += '<div id="jspsych-html-button-response-btngroup">';
    for (var i = 0; i < trial.choices.length; i++) {
      var str = buttons[i].replace(/%choice%/g, trial.choices[i]);
      html += '<div class="jspsych-html-button-response-button" style="display: inline-block; margin:'+trial.margin_vertical+' '+trial.margin_horizontal+'" id="jspsych-html-button-response-button-' + i +'" data-choice="'+i+'">'+str+'</div>';
    }
    html += '</div>';

    //show prompt if there is one
    if (trial.prompt !== null) {
      html += trial.prompt;
    }
    display_element.innerHTML = html;

    // get the position of the stimulus
    //stimRect = display_element.querySelector('#jspsych-html-button-response-stimulus').;
    //console.log(stimRect);

    // start time
    var start_time = jsPsych.totalTime();

    // add event listeners to buttons
    for (var i = 0; i < trial.choices.length; i++) {
      display_element.querySelector('#jspsych-html-button-response-button-' + i).addEventListener('touchstart', onTouchStart);
      display_element.querySelector('#jspsych-html-button-response-button-' + i).addEventListener('touchend', onTouchEnd);
      //display_element.querySelector('#jspsych-html-button-response-button-' + i).addEventListener('mousedown', onTouchStart);
      //display_element.querySelector('#jspsych-html-button-response-button-' + i).addEventListener('mouseup', onTouchEnd);
      //let rect = display_element.querySelector('#jspsych-html-button-response-button-' + i).getBoundingClientRect();
      //console.log(rect)
    };

    function onTouchEnd(e){
      // handles lift events
      let lift_time = jsPsych.totalTime();
      js_lifttime = lift_time;
      xyCoords.liftX = xyCoords.touchX;
      xyCoords.liftY = xyCoords.touchY;
    }

    function onTouchStart(e){
        // handles touch events
        var choice = e.currentTarget.getAttribute('data-choice'); // don't use dataset for jsdom compatibility
        xyCoords.touchX = e.pageX;
        xyCoords.touchY = e.pageY;
        if (xyCoords.touchX == null){
          xyCoords.touchX = e.touches[0].pageX;
          xyCoords.touchY = e.touches[0].pageY;
        };

        after_response(choice);
      };

    // store response
    var response = {
      rt: null,
      button: null
    };

    // function to handle responses by the subject
    function after_response(choice) {

      // measure rt
      var end_time = jsPsych.totalTime();
      var rt = end_time - start_time;
      js_endtime = end_time;
      response.button = choice;
      response.rt = rt;

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      display_element.querySelector('#jspsych-html-button-response-stimulus').className += 'responded';

      // disable all the buttons after a response
      var btns = document.querySelectorAll('.jspsych-html-button-response-button button');
      for(var i=0; i<btns.length; i++){
        //btns[i].removeEventListener('touchstart', eventResponse);
        //btns[i].removeEventListener('touchend', handlelift);
        btns[i].setAttribute('disabled', 'disabled');
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // function to end trial when it is time
    function end_trial() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "stimulus": trial.stimulus,
        "button_pressed": response.button,
        "touchX": xyCoords.touchX,
        "touchY": xyCoords.touchY,
        "liftX": xyCoords.liftX,
        "liftY": xyCoords.liftY,
        // custom timing
        "js_start": start_time,
        "js_touchdown": js_endtime,
        "js_touchup": js_lifttime,
        "js_end": jsPsych.totalTime(),
        "xy_stim": stimRect,
      };

      // remove all event listeners

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // hide image if timing is set
    if (trial.stimulus_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#jspsych-html-button-response-stimulus').style.visibility = 'hidden';
      }, trial.stimulus_duration);
    }

    // end trial if time limit is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }

  };

  return plugin;
})();
