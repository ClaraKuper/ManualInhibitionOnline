// define objects that are common for all files in the ManualInhibitionOnline experiment

let centralPoint = "<div id = 'centralPointDiv'><dot class = 'centralPoint'></dot></div>";
let invisibleCentralPoint = "<div id = 'invisibleCentralPointDiv'><InvisibleDot class = 'centralInvisiblePoint' style = 'background-color: rgba(153,31,35,0); height: 100px; width: 100px;" +
    "    margin-top: -50px; margin-left: -50px; '></InvisibleDot></div>";
let rightTar = "<div id = 'rightTarDiv'><dot class = 'target' style ='transform: translate(200px);'></dot></div>";
let leftTar = "<div id = 'leftTarDiv'><dot class = 'target' style = 'transform: translate(-200px);'></dot></div>";

let rightTarInvisible = "<div id = 'rightTarInvisibleDiv'><InvisibleDot class = 'targetInvisible' style = 'background-color:rgba(56,153,53,0);  transform: translate(200px); '></InvisibleDot></div>";
let leftTarInvisible = "<div id = 'leftTarInvisibleDiv'><InvisibleDot class = 'targetInvisible' style = 'background-color:rgba(153,31,35,0);  transform: translate(-200px); '></InvisibleDot></div>";
let rightTarShiftIn = "<div id = 'rightTarShiftInDiv'><dot class = 'targetShift' style = 'transform: translate(150px);'></dot></div>";
let rightTarShiftOut = "<div id = 'rightTarShiftOutDiv'><dot class = 'targetShift' style = 'transform: translate(250px);'></dot></div>";
let leftTarShiftIn = "<div id = 'leftTarShiftInDiv'><dot class ='targetShift' style = 'transform: translate(-150px);'></dot></div>";
let leftTarShiftOut = "<div id = 'leftTarShiftOutDiv'><dot class = 'targetShift' style = 'transform: translate(-250px);'></dot></div>";

let flashUpVisible = "<div id = 'flashUpVisibleDiv'><rectangleUp class = 'flashupVisible' ></rectangleUp></div>";
let flashDownVisible = "<div id = 'flashDownVisibleDiv'><rectangleDown class = 'flashdownVisible'></rectangleDown></div>";
let flashUpInvisible = "<div id = 'flashUpInvisibleDiv'><rectangleUp class = 'flashupInvisible' style = 'background-color:rgba(255,255,255,0);'></rectangleUp></div>";
let flashDownInvisible = "<div id = 'flashDownInvisibleDiv'><rectangleDown class = 'flashdownInvisible' style = 'background-color:rgba(255,255,255,0);'></rectangleDown></div>";

let genericPoint = "<div id = 'genericPointDiv'><dot class = 'target'> </dot></div>";
let genericInvisiblePoint = "<div id = 'genericInvisiblePointDiv'><InvisibleDot class = 'invisibleTarget' style = 'background-color: rgba(153,31,35,0); " +
    "height: 100px; width: 100px; margin-top: -50px; margin-left: -50px;'></InvisibleDot></div>";