Experimental code for a manual reaching paradigm
Clara Kuper 
February 2021 

In this experiment, the participant is prompted to reach and touch a point (target) appearing left or right from fixation as quickly as possible. 
At some point after the target appeared, a bright flash can appear on the upper and lower half of the screen. The participant is prompted to ignore that flash.
Together with the flash, the target sometimes jumps to a new location on the screen. If that happens, the observer should still try to touch the target as accurately as possible.
There are trials with a flash, but without jumps, with jumps, but without flash etc.

The experiment is designed to run on jatos https://www.jatos.org/
And is implemented with javascript and jspsych

The jspsych library needs to be included in the experiment folder before uploading it to jatos. 

Change log:

July 27th 2021 (Clara): Change to serial task - position of dots is not regular but jittered. Change was introduced to make movement preparation harder.  
July 28th 2021 (Clara): Fix position readout bug (the position was saved with respect to the group of objects, not to every single dot).
July 28th 2021 (Clara): Parameter changes on serial task (longer time, dots spaced further apart, exploratory)
August 19th 2021 (Clara): Detect changes in screen size, alert when screen gets to small to present stimuli, abort trial upon change.
August 20th 2021 (Clara): Detect touches on the document that don't target any of the touchable elements