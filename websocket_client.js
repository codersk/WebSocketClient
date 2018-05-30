/*
 * Real-time data updates from a websocket by
 * writing and listening to data events from a websocket server.
 */

var interval;
var websocket;
var websocketEchoServerUri = "ws://localhost:8080/WebSocketServer/random";
var chartData = []; //will be updated by our simulated server
var serverLog = document.getElementById("server-log");
var startButton = document.getElementById('start');
var endButton = document.getElementById('end');
var chart = AmCharts.makeChart("chartdiv", {
  "type": "serial",
  "theme": "light",
  "dataDateFormat": "DD-MM-YYYY",
  "valueAxes": [{
    "id": "v1",
    "position": "left"
  }],
  "graphs": [{
    "id": "g1",
    "bullet": "round",
    "valueField": "value",
    "balloonText": "[[category]]: [[value]]"
  }],
  "categoryField": "date",
  "categoryAxis": {
    "parseDates": true,
    "equalSpacing": true,
    "dashLength": 1,
    "minorGridEnabled": true
  },
  "dataProvider": chartData
});

function startReceiving() {
  websocket = initWebSocket(websocketEchoServerUri);
}

function stopReceiving() {
  websocket.close();
}

function initWebSocket(wsUri) {
  var ws = new WebSocket(wsUri);
  ws.onopen = onConnect;
  ws.onclose = onClose;
  ws.onerror = onError;
  ws.onmessage = updateChart;
  return ws;
}

/*
 * Called during the onmessage event. Your application will need
 * to parse your websocket server's response into a data object
 * or array of dataObjects your chart expects
 */
function updateChart(wsEvent) {
  console.log(wsEvent.data);
  var newData = JSON.parse(wsEvent.data);
  chartData.push.apply(chartData, newData);
  // keep only 15 datapoints on screen
  if (chartData.length > 15) {
    chartData.splice(0, chartData.length - 15);
  }
  writeToScreen("<span>Received: " + wsEvent.data + "</span>");
  chart.validateData(); //call to redraw the chart with new data
}

function onConnect(wsEvent) {
  writeToScreen("<span class='blue'>Server connection successful. Listening for data now.</span>");
  // interval = setInterval(getDataFromServer, 2000); //we're simulating a datafeed by calling our getDataFromServer method every 2 seconds
}

function onError(wsEvent) {
  writeToScreen("<span class='red'>ERROR:" + wsEvent + "</span>");
}

function onClose(wsEvent) {
  writeToScreen("<span class='blue'>Server connection closed!</span>");
  clearInterval(interval);
}

//For debug messaging
function writeToScreen(message) {
  var pre = document.createElement("p");
  pre.style.wordWrap = "break-word";
  pre.innerHTML = message;
  serverLog.appendChild(pre);
  serverLog.scrollTop = serverLog.scrollHeight;
}

/*
 * This simulates a data response from the server
 * using websocket.org's echo server. The method generates
 * a random sized array of values and writes it to
 * the server in the form of a JSON string,
 * which will be echoed back to the client
 */
/*function getDataFromServer() {
  var newDate;
  var newValue;
  var newData = [];
  var newDataSize = Math.round(Math.random() + 3) + 1;

  if (chartData.length) {
    newDate = new Date(chartData[chartData.length - 1].date);
  } else {
    newDate = new Date();
  }

  for (var i = 0; i < newDataSize; ++i) {
    newValue = Math.round(Math.random() * (40 + i)) + 10 + i;
    newDate.setDate(newDate.getDate() + 1);

    newData.push({
      date: newDate,
      value: newValue
    });
  }

  websocket.send(JSON.stringify(newData));
}*/