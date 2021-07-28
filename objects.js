// define objects that are common for all files in the ManualInhibitionOnline experiment

let centralPoint = "<div id = 'centralPointDiv'><dot></dot></div>";
let invisibleCentralPoint = "<div id = 'invisibleCentralPointDiv'><dot style = 'background-color: rgba(153,31,35,0);'></dot></div>";
let rightTar = "<div id = 'rightTarDiv'><dot class = 'dot' style ='transform: translate(200px);'></dot></div>";
//let rightTarResp = "<div id = 'rightTarRespDiv'><dot style = 'background-color: rgba(0,0,0,0); transform: translate(200px);'></dot></div>";
let leftTar = "<div id = 'leftTarDiv'><dot class = 'dot' style = 'transform: translate(-200px);'></dot></div>";
//let leftTarResp = "<div id = 'leftTarRespDiv'><dot style = 'background-color: rgba(0,0,0,0); transform: translate(-200px);'></dot></div>";
let rightTarInvisible = "<div id = 'rightTarInvisibleDiv'><InvisibleDot style = 'background-color:rgba(56,153,53,0);  transform: translate(200px); '></InvisibleDot></div>";
let leftTarInvisible = "<div id = 'rightTarInvisibleDiv'><InvisibleDot style = 'background-color:rgba(153,31,35,0);  transform: translate(-200px); '></InvisibleDot></div>";
let rightTarShiftIn =  "<div id = 'rightTarShiftInDiv'><dot style = 'transform: translate(150px);'></dot></div>";
let rightTarShiftOut =  "<div id = 'rightTarShiftOutDiv'><dot style = 'transform: translate(250px);'></dot></div>";
let leftTarShiftIn = "<div id = 'leftTarShiftInDiv'><dot style = 'transform: translate(-150px);'></dot></div>";
let leftTarShiftOut = "<div id = 'leftTarShiftOutDiv'><dot style = 'transform: translate(-250px);'></dot></div>";
//let whiteCircleLeft = "<div id = 'whiteCircleLeftDiv'><dot style = 'left:calc(50% - 160px); height: 25px; width: 25px; background-color: #ffffff;' ></dot></div>";
//let whiteCircleRight = "<div id = 'whiteCircleRightDiv'><dot style = 'right:calc(50% - 145px); top:52%; margin-left:0; margin-right:-25px; height: 25px; width: 25px; background-color: #ffffff;' ></dot></div>";
//let whiteCircle = "<div id = 'whiteCircleDiv'><dot style = 'top:52%; height: 25px; width: 25px; background-color: #ffffff;'></dot></div>";
let flashVisible = "<div id = 'flashVisibleDiv'><rectangleUp></rectangleUp></div><div id = 'flashVisibleDiv'><rectangleDown></rectangleDown></div>";
let flashVisibleInvisible = "<div id = 'flashInvisibleDiv'><rectangleUp style = 'background-color:rgba(255,255,255,0);'></rectangleUp></div><div id = 'flashInisibleDiv'><rectangleDown style = 'background-color:rgba(255,255,255,0);'></rectangleDown></div>";

let flashUpVisible = "<div id = 'flashUpVisibleDiv'><rectangleUp></rectangleUp></div>";
let flashDownVisible = "<div id = 'flashDownVisibleDiv'><rectangleDown></rectangleDown></div>";
let flashUpInvisible = "<div id = 'flashUpInvisibleDiv'><rectangleUp style = 'background-color:rgba(255,255,255,0);'></rectangleUp></div>";
let flashDownInvisible = "<div id = 'flashDownInvisibleDiv'><rectangleDown style = 'background-color:rgba(255,255,255,0);'></rectangleDown></div>";





let buttonVisible1 = leftTar;
let buttonVisible2 = "<div id = 'buttonVisible2Div'><dot class = 'dot' style = 'transform: translate(-120px);'></dot></div>";
let buttonVisible3 = "<div id = 'buttonVisible3Div'><dot class = 'dot' style = 'transform: translate(-40px);'></dot></div>";
let buttonVisible4 = "<div id = 'buttonVisible4Div'><dot class = 'dot' style = 'transform: translate(40px);'></dot></div>";
let buttonVisible5 = "<div id = 'buttonVisible5Div'><dot class = 'dot' style = 'transform: translate(120px);'></dot></div>";
let buttonVisible6 = rightTar;
let genericPoint = "<div id = 'genericPointDiv'><dot class = 'target'> </dot></div>";
let visibleButtons = [buttonVisible1, buttonVisible2, buttonVisible3, buttonVisible4, buttonVisible5, buttonVisible6];

let buttonInvisible1 = "<div id = 'buttonInvisible1Div'><SerialButtons style = 'transform: translate(-200px);'></SerialButtons></div>";
let buttonInvisible2 = "<div id = 'buttonInvisible2Div'><SerialButtons style = 'transform: translate(-120px);'></SerialButtons></div>";
let buttonInvisible3 = "<div id = 'buttonInvisible3Div'><SerialButtons style = 'transform: translate(-40px);'></SerialButtons></div>";
let buttonInvisible4 = "<div id = 'buttonInvisible4Div'><SerialButtons style = 'transform: translate(40px);'></SerialButtons></div>";
let buttonInvisible5 = "<div id = 'buttonInvisible5Div'><SerialButtons style = 'transform: translate(120px);'></SerialButtons></div>";
let buttonInvisible6 = "<div id = 'buttonInvisible1Div'><SerialButtons style = 'transform: translate(200px);'></SerialButtons></div>";
let genericInvisiblePoint = "<div id = 'genericInvisiblePointDiv'><dot class = 'invisibleTarget' style = 'background-color: rgba(153,31,35,0);'></dot></div>";
let invisibleButtons = [buttonInvisible1, buttonInvisible2, buttonInvisible3, buttonInvisible4, buttonInvisible5, buttonInvisible6];


