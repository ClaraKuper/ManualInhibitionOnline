/* create timeline */
let nextComponentPosition; // which component we should start next
let timeline = []; // timeline to run on jsPsych.init

let repeat_IDs = []; // a list of all IDs that have to be repeated
let repeat_trials = []; // gets assigned to repeat_IDs at the end of each run
let first_set = true;
let T; // initialize value for trial parameters

// boolean checks
let lateResponse; // was the response given in time
let earlyResponse; // was the response given too early
let repeat; // check if the current trial should be repeated or not
let nDisplayTurns; // check how often the Display was rotated

let orderResponse; // check if all buttons in the serial trial were pressed in order

// parameters for user control
let ori; // get the screen orientation (landscape or portrait)
// check the screen
if (typeof screen.orientation === 'undefined') {
    // alternative when orientation is not available
    // check if the device is wider than high
    ori = [screen.innerHeight < screen.innerWidth, 'rel']
} else {
    ori = [screen.orientation.angle, 'angle']
}

// define an empty trial that we can show instead of the real trials
let pseudo_trial = {
    type: 'html-button-response',
    stimulus: '',
    post_trial_gap: 1,
    choices: [''],
    button_html: '',
    trial_duration: 1,
};


