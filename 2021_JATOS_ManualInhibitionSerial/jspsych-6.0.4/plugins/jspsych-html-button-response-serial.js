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

jsPsych.plugins["html-button-response-serial"] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'html-button-response-serial',
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
        html += '<div class="jspsych-html-button-response-button" style="display: inline-block; " id="jspsych-html-button-response-button-' + i +'" data-choice="'+i+'">'+str+'</div>';
    }
    html += '</div>';

    //show prompt if there is one
    if (trial.prompt !== null) {
        html += trial.prompt;
        }
    display_element.innerHTML = html;

    // start time
    start_time = performance.now();

    // create flashes as css elements to be called later in the functions flash_Off and flash_On
    const flashup = document.createElement("flash");
    flashup.classList.add("flashup");
    document.body.appendChild(flashup);

    const flashdown = document.createElement("flash");
    flashdown.classList.add("flashdown");
    document.body.appendChild(flashdown);

    let xyCoords = {
        touchX: null,
        touchY: null,
    };

    // creating arrays to save data for order of buttons pressed, time for flashon and time for flashoff
    touchOn = [];
    flashOn = [];
    flashOff = [];
    touchOff = [];
    touchCoords = [];
    choiceOrder = [];

    // creating counter to condition flash, so that it doesn't show for the last button pressed in the trial
    count = 1;

    // add event listeners to buttons
    for (var i = 0; i < trial.choices.length; i++) {
        display_element.querySelector('#jspsych-html-button-response-button-' + i).addEventListener('mousedown', function(e){
            choice = e.currentTarget.getAttribute('data-choice'); // sets label to button pressed
            timertrial = performance.now(); // saves the time of when a button is pressed

            choiceOrder.push(choice);

            if (e.target.nodeName === 'DOT') {
                // retrieve xy coordinates
                xyCoords.touchX = e.pageX;
                xyCoords.touchY = e.pageY;
                if (xyCoords.touchX == null){
                  xyCoords.touchX = e.touches[0].pageX;
                  xyCoords.touchY = e.touches[0].pageY;
                };

                touchOn.push([timertrial, choice]); // saves which button was pressed and at what time
                touchCoords.push([xyCoords.touchX, xyCoords.touchY, choice]); // saves the coordinates that were touched
                //console.log(touchCoords);
                // e.target.classList.toggle('hidden'); // hides the button pressed
                //
                // // and hide the second button that belongs to this group
                // if (e.target.nextSibling){
                //     e.target.nextSibling.classList.toggle('hidden');
                // }else if (e.target.previousSibling){
                //     e.target.previousSibling.classList.toggle('hidden');
                // };

                if (count < 6){
                    function flash_On(){
                        var colors = ['#ffffff', '#808080'];
                        random_color = colors[Math.floor(Math.random() * colors.length)];
                        flashup.style.backgroundColor = random_color; // sets the color of the flash to a random color
                        flashdown.style.backgroundColor = random_color;

                        flashOnTimer = performance.now();
                        flashOn.push([flashOnTimer, flashup.style.backgroundColor]); // saves the color of the flash (flash/no flash) and the time of the flash appearance
                        setTimeout(flash_Off, 60)
                    }
                    setTimeout(flash_On, Math.random()*250);

                    function flash_Off(){
                        flashup.style.backgroundColor="#808080";
                        flashdown.style.backgroundColor="#808080";
                        flashOffTimer = performance.now();
                        flashOff.push(flashOffTimer); // saves when the flash disappears
                    }
                }
            }
        })

        display_element.querySelector('#jspsych-html-button-response-button-' + i).addEventListener('mouseup', function(e) {

            count +=1;

            choice = e.currentTarget.getAttribute('data-choice'); // sets label to button pressed
            e.target.classList.toggle('hidden'); // hides the button pressed

            // and hide the second button that belongs to this group
            if (e.target.nextSibling){
                e.target.nextSibling.classList.toggle('hidden');
            }else if (e.target.previousSibling){
                e.target.previousSibling.classList.toggle('hidden');
            };

            timeroff = performance.now(); // saves the time of when a button is released
            touchOff.push([timeroff, choice]);

            if (count > 6) {
                function endTrial(){
                    end_trial();
                }
                setTimeout(endTrial, 20);
            }
        })
    };



    //var choice = display_element.querySelector('#jspsych-html-button-response-button-' + i);
    // function to handle responses by the subject
    function after_response(choice) {
        
        // measure rt
        end_time = performance.now();
        var rt = end_time - start_time;
        response.button = parseInt(choice);
        response.rt = rt;

        // after a valid response, the stimulus will have the CSS class 'responded'
        // which can be used to provide visual feedback that a response was recorded
        display_element.querySelector('#jspsych-html-button-response-stimulus').className += ' responded';
    };       

    // function to end trial when it is time
    function end_trial() {

        // kill any remaining setTimeout handlers
        jsPsych.pluginAPI.clearAllTimeouts();

        // gather the data to store for the trial
        var trial_data = {
            "flashon":flashOn,
            "flashoff":flashOff,
            "choice": touchOn,
            "lift":touchOff,
            "touchCoords": touchCoords,
            "choiceOrder": choiceOrder,
        };
      
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
    };
  };
  return plugin;
})();
