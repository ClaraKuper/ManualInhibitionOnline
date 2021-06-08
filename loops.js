

function Jump_loop(nTrials, cFlash, cJump, cInwards, cPosition, fixTime, flashTime, trialDur) {


    let nT; // number of trials
    let T; // trial
    let cF; // condition flash index
    let cJ; // condition jump index
    let cI; // condition inwards index
    let cP; // condition position index
    let fixT; // time for fixation
    let ID = 0; // trial ID initialization

    let flash_condition; // current flash condition
    let jump_condition; // current jump condition
    let inwards_condition; // current inwards condition
    let position_condition; // current position condition

    let test_stimuli = []; // the design structure, stimulus values for each trial

// loop through trials
   for (nT = 0; nT < nTrials; nT++){
    // loop through flash conditions
    for (cF = 0; cF < cFlash.length; cF++){
        flash_condition = cFlash[cF];
        // loop through jump conditions
        for (cJ = 0; cJ < cJump.length; cJ++){
            jump_condition = cJump[cJ];
            // loop through inwards conditions
            for (cI = 0; cI < cInwards.length; cI++){
                inwards_condition = cInwards[cI];
                // loop though position conditions
                for (cP = 0; cP < cPosition.length; cP++){
                    position_condition = cPosition[cP];
                    // assign all values to the current trial
                    T = {
                        sidePoint: function(){if (position_condition === 'r'){return rightTar} else{return leftTar}}(),
                        jumpedPoint: function(){if (position_condition === 'r'){if(inwards_condition){return rightTarShiftIn
                        } else {return rightTarShiftOut}
                        } else {if(inwards_condition){return leftTarShiftIn
                        } else {return leftTarShiftOut}
                        }
                        }(),
                        sideButton: function(){if (position_condition === 'r'){return rightTarInvisible} else{return leftTarInvisible}}(),
                        flashUp:function(){if (flash_condition){return flashUpVisible} else{return flashUpInvisible}}(),
                        flashDown: function(){if (flash_condition){return flashDownVisible} else{return flashDownInvisible}}(),
                        position: position_condition,
                        stimJumps: jump_condition,
                        inwards: inwards_condition,
                        showFlash: flash_condition,

                        fixTime: fixTime*Math.random(),
                        flashTime: flashTime*Math.random(),
                        trialDuration: trialDur,
                        trialID: ID,
                    };
                    // save the current trial in our design structure
                    test_stimuli.push(T);
                    // increase the ID by one
                    ID ++;
                }
            }
        }
    }
}
    return test_stimuli;}


function Serial_loop(nTrials, maxFlashTime, twSize) {
    let T; // the trials
    let nT; // number of trials per condition
    let tW; // the time window
    let fT; // flash time
    let trialID = 0; // a trial ID

    let test_stimuli = []; // the array that will later hold our design structure

    // loop through all trials
    for (nT = 0; nT < nTrials; nT++){
      // loop through all time windows
      for (tW = 0; tW < maxFlashTime; tW = tW+twSize){
        // save the values for the current trial
        T = {
          // the time of the flash will be the time window start + a random value between 0
          // and the size of the time window
          flashTime: tW + Math.random()*twSize,
          trialID: trialID,
        };
        // save the trial in our design structure
        test_stimuli.push(T);
        // increment the trial ID
        trialID++
      }
    }

    return test_stimuli;}