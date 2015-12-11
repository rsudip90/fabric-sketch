points = {};
isDown = false;
context_list = {};
data_list = {};

var render =  function(data_set) {
                var e = canvas.contextTop,
                    t = canvas.viewportTransform,
                    n = data_set._points[0],
                    r = data_set._points[1];
                e.save(), e.transform(t[0], t[1], t[2], t[3], t[4], t[5]), e.beginPath(), data_set._points.length === 2 && n.x === r.x && n.y === r.y && (n.x -= .5, r.x += .5), e.moveTo(n.x, n.y);
                for (var i = 1, s = data_set._points.length; i < s; i++) {
                    var o = n.midPointFrom(r);
                    e.quadraticCurveTo(n.x, n.y, o.x, o.y), n = data_set._points[i], r = data_set._points[i + 1]
                }
                e.lineTo(n.x, n.y), e.stroke(), e.restore();
}

playbackInterruptCommand = "";
	
$(document).on("ready", function()
{
	$("#pauseBtn").hide();
	$("#playBtn").hide();
	
	$("#recordBtn").click(function(){
		var btnTxt = $("#recordBtn").text().trim();
		if (btnTxt == 'Stop'){
			recorder.stopRecording(function(url) {
				window.open(url);
			});
			$("#recordBtn").text("Record");
		}
		else{
			recorder.startRecording();
			$("#recordBtn").text("Stop");
		}
	});
	
	$("#playBtn").click(function(){
		var btnTxt = $("#playBtn").text().trim();
		if (btnTxt == 'Stop')
			stopPlayback();
		else
			startPlayback();			
	});
	
	$("#pauseBtn").click(function(){
		var btnTxt = $("#pauseBtn").text().trim();
		if (btnTxt == 'Pause')
		{
			pausePlayback();
		} else if (btnTxt == 'Resume')
		{
			resumePlayback();
		}
	});
	$("#clearBtn").click(function(){
		record_canvas.canvas.clear();			
	});
});

function stopRecording()
{
	$("#recordBtn").text("Record");
	$("#playBtn").show();
	$("#pauseBtn").hide();
	$("#clearBtn").show();
	
	record_canvas.stopRecording();
}

function startRecording()
{
	$("#recordBtn").text("Stop");
	$("#playBtn").hide();
	$("#pauseBtn").hide();
	$("#clearBtn").hide();
	
	record_canvas.startRecording();
}

function stopPlayback()
{
	playbackInterruptCommand = "stop";		
}

function startPlayback()
{
	record_canvas.playRecording(function() {
		//on playback start
		$("#playBtn").text("Stop");
		$("#recordBtn").hide();
		$("#pauseBtn").show();
		$("#clearBtn").hide();
		playbackInterruptCommand = "";
	}, function(){
		//on playback end
		$("#playBtn").text("Play");
		$("#playBtn").show();
		$("#recordBtn").show();
		$("#pauseBtn").hide();
		$("#clearBtn").show();
	}, function() {
		//on pause
		$("#pauseBtn").text("Resume");
		$("#recordBtn").hide();
		$("#playBtn").hide();
		$("#clearBtn").hide();
	}, function() {
		//status callback
		return playbackInterruptCommand;
	});
}

function pausePlayback()
{
	playbackInterruptCommand = "pause";
}

function resumePlayback()
{
	playbackInterruptCommand = "";
	record_canvas.resumePlayback(function(){
		$("#pauseBtn").text("Pause");
		$("#pauseBtn").show();
		$("#recordBtn").hide();
		$("#playBtn").show();
		$("#clearBtn").hide();
	});
}


RecordFabric = function(fabric_canvas){
	var self = this;
	this.recordings = [];
	this.canvas = fabric_canvas;
	this.mouseDown = false;
	
	this.__init = function(){
		//this.startRecording();
	}

	this.startRecording = function(){
		self.currentRecording = new Recording(this);
		self.recordings = [];
		self.recordings.push(self.currentRecording);
		self.currentRecording.start();
	}
	
	this.stopRecording = function(){
		if (self.currentRecording != null)
			self.currentRecording.stop();
		self.currentRecording = null;
	}

	this.playRecording = function(onPlayStart, onPlayEnd, onPause, interruptActionStatus)
	{
		if (typeof interruptActionStatus == 'undefined')
			interruptActionStatus = null;
		
		if (self.recordings.length == 0)
		{
			alert("No recording loaded to play");
			onPlayEnd();
			return;
		}

		self.canvas.clear();
		
		onPlayStart();
		
		self.pausedRecIndex = -1;
		
		for (var rec = 0; rec < self.recordings.length; rec++)
		{
			if (interruptActionStatus != null)
			{
				var status = interruptActionStatus();
				if (status == "stop") {
					pauseInfo = null;
					break;
				}
				else 
					if (status == "pause") {
						__onPause(rec-1, onPlayEnd, onPause, interruptActionStatus);
						break;
					}
			}
			self.recordings[rec].playRecording(self.drawActions, onPlayEnd, function(){
				__onPause(rec-1, onPlayEnd, onPause, interruptActionStatus);
			}, interruptActionStatus);
		}
	}

	this.drawAction = function (actionArg, addToArray)
	{
		var action_name = actionArg.name;
		var fabric_object = actionArg.target;
		switch (action_name)
		{
			case "object:selected":
				var canvas_object = getFabricObjectFromIndex(fabric_object.index);
				deactivateAllObjects();
				canvas_object.active = true;
				self.canvas.renderAll();
				break;
			case "before:selection:cleared":
				var canvas_object = getFabricObjectFromIndex(fabric_object.index);
				canvas_object.active = false;
				self.canvas.renderAll();
				break;
			case "selection:cleared":
				//unable to get object on selection cleared
				/*console.log("cleared");
				var canvas_object = getFabricObjectFromIndex(fabric_object.index);
				canvas_object.active = false;
				self.canvas.renderAll();*/
				break;				
			case "object:added":
				self.canvas.add(fabric_object);
				break;
			case "object:moving":
				var canvas_object = getFabricObjectFromIndex(fabric_object.index);
				canvas_object.left = fabric_object.left;
				canvas_object.top = fabric_object.top;
				canvas_object.setCoords();
				self.canvas.renderAll();
				break;
			case "object:rotating":
				var canvas_object = getFabricObjectFromIndex(fabric_object.index);
				canvas_object.setAngle(fabric_object.angle).setCoords();
				self.canvas.renderAll();
				break;
			case "object:scaling":
				var canvas_object = getFabricObjectFromIndex(fabric_object.index);
				canvas_object.scaleX = fabric_object.scaleX;
				canvas_object.scaleY = fabric_object.scaleY;
				canvas_object.left = fabric_object.left;
				canvas_object.top = fabric_object.top;
				canvas_object.setCoords();
				self.canvas.renderAll();
				break;
			case "object:removed":
				var canvas_object = getFabricObjectFromIndex(fabric_object.index);
				self.canvas.remove(canvas_object);
				break;
			case "object:modified":
				var canvas_object = getFabricObjectFromIndex(fabric_object.index);
				canvas_object.active = true;
				self.canvas.renderAll();
				break;
			default:
				break;
		}
		if (addToArray)
			self.actions.push(actionArg);
	}

	self.__init();
}

function deactivateAllObjects(){
	var objects = canvas.getObjects();
	for (var i = 0; i < objects.length; i++) {
		objects[i].active = false;
	}
	canvas.renderAll()
}

function getFabricObjectFromIndex(index){
	var objects = canvas.getObjects();
	for (var i = 0; i < objects.length; i++) {
		if(objects[i].index == index){
			break;
		}
	}
	return objects[i];
}

Recording = function (drawingArg)
{
	var self = this;
	this.drawing = drawingArg;
	this.timeSlots = new Object(); //Map with key as time slot and value as array of Point objects
	this.last_added = []; //not need right now
	this.fabric_event_listener = ["before:selection:cleared", "selection:created", "selection:cleared", "object:modified", "object:selected", "object:moving", "object:scaling", "object:rotating", "object:added", "object:removed", "path:created", "mouse:down", "mouse:move", "mouse:up", "after:render"];
	this.buffer = []; //array of Point objects 
	this.timeInterval = 100; //10 miliseconds
	this.currTime = 0;
	this.started = false;
	this.intervalId = null;
	this.currTimeSlot = 0;
	this.actionsSet = null;
	this.currActionSet = null;
	this.recStartTime = null;
	this.pauseInfo = null;
	_points = [];
	
	this.canvasEventAction = function(eventName, eventObj){	
		switch(eventName) {
			case "object:added":
				var action_target = $.extend({}, eventObj.target);
				var action = {};
				action['name'] = 'object:added';
				action['target'] = action_target;
				self.addAction(action);
				break;
			case "object:selected":
				var action_target = $.extend({}, eventObj.target);
				var action = {};
				action['name'] = 'object:selected';
				action['target'] = action_target;
				self.addAction(action);
				break;
			case "selection:created":
				var action_target = $.extend({}, eventObj.target);
				//
				break;
			case "selection:cleared":
				var action_target = $.extend({}, eventObj.target);
				var action = {};
				action['name'] = 'selection:cleared';
				action['target'] = action_target;
				self.addAction(action);
				break;
			case "before:selection:cleared":
				var action_target = $.extend({}, eventObj.target);
				var action = {};
				action['name'] = 'before:selection:cleared';
				action['target'] = action_target;
				self.addAction(action);
				break;
			case "object:scaling":
				var action_target = $.extend({}, eventObj.target);
				var action = {};
				action['name'] = 'object:scaling';
				action['target'] = action_target;
				self.addAction(action);
				break;
			case "object:rotating":
				var action_target = $.extend({}, eventObj.target);
				var action = {};
				action['name'] = 'object:rotating';
				action['target'] = action_target;
				self.addAction(action);
				break;
			case "object:moving":
				var action_target = $.extend({}, eventObj.target);
				var action = {};
				action['name'] = 'object:moving';
				action['target'] = action_target;
				self.addAction(action);
				break;			
			case "object:modified":
				var action_target = $.extend({}, eventObj.target);
				var action = {};
				action['name'] = 'object:modified';
				action['target'] = action_target;
				console.log(action_target.active);
				self.addAction(action);
				break;		
			case "object:removed":
				var action_target = $.extend({}, eventObj.target);
				var action = {};
				action['name'] = 'object:removed';
				action['target'] = action_target;
				self.addAction(action);
				break;
			case "path:created":
				return;
				var action_target = $.extend({}, eventObj.path);
				var action = {};
				action['name'] = 'path:created';
				action['target'] = action_target;
				console.log(action_target);
				//self.addAction(action);
				break;
			case "mouse:up":
				return;
				var action_target = $.extend({}, eventObj.target);
				var action = {};
				action['name'] = 'path:created';
				action['target'] = action_target;
				self.drawing.mouseDown = false;
				console.log("mouse:up");
				//self.addAction(action);
				break;
			case "mouse:down":
				isDown = true;
				console.log(eventObj);
				var pointer = canvas.getPointer(eventObj.e);
				console.log(pointer);
				origX = pointer.x;
				origY = pointer.y;
				var pointer = canvas.getPointer(eventObj.e);
				return;
				var action_target = $.extend({}, eventObj.target);
				var action = {};
				action['name'] = 'path:created';
				action['target'] = action_target;
				self.drawing.mouseDown = true;
				console.log("mouse:down");
				//self.addAction(action);
				break;
			case "mouse:move":
				return;
				var action_target = $.extend({}, eventObj.target);
				var action = {};
				action['name'] = 'path:created';
				action['target'] = action_target;
				if (self.drawing.mouseDown) {
					console.log("mouse:move");
					_points.push(eventObj.e.pageX);
				}				
				//self.addAction(action);
				break;
			case "after:render":
				return;
				var action_target = $.extend({}, eventObj.target);
				var action = {};
				action['name'] = 'path:created';
				action['target'] = action_target;
				//self.addAction(action);
				break;
			default:
				var action = {};
				action['name'] = null;
				action['target'] = action_target;
				self.addAction(action);
				break;
		}
	}

	this.observe = function (eventName){
		self.drawing.canvas.on(eventName, function(e){
			self.canvasEventAction(eventName, e);
		});
	}

	this.start = function()
	{
		self.currTime = 0;
		self.currTimeSlot = -1;
		self.actionsSet = null;
		self.pauseInfo = null;
		
		self.recStartTime = (new Date()).getTime();
		self.intervalId = window.setInterval(self.onInterval, self.timeInterval);
		self.started = true;
		for (var i = 0; i < self.fabric_event_listener.length; i++) {
			self.observe(self.fabric_event_listener[i]);
		}
	}
	
	this.stop = function(){
		if (self.intervalId != null)
		{
			window.clearInterval(self.intervalId);
			self.intervalId = null;
		}
		self.started = false;
	}
	
	this.onInterval = function(){
		if (self.buffer.length > 0)
		{
			var timeSlot = (new Date()).getTime() - self.recStartTime;
		
			if (self.currActionSet == null)
			{
				self.currActionSet = new ActionsSet(timeSlot, self.buffer);
				self.actionsSet = self.currActionSet;
			}
			else
			{
				var tmpActionSet = self.currActionSet;
				self.currActionSet = new ActionsSet(timeSlot, self.buffer);
				tmpActionSet.next = self.currActionSet;
			}
			
			self.buffer = new Array();
		}
		self.currTime += self.timeInterval;
	}
	
	this.addAction = function(actionArg){
		if (!self.started)
			return;
		//newactionArg = $.extend({}, actionArg);
		self.buffer.push(actionArg);
	}
	
	this.playRecording = function(callbackFunctionArg, onPlayEnd, onPause, interruptActionStatus){
		if (self.actionsSet == null)
		{
			if (typeof onPlayEnd != 'undefined' && onPlayEnd != null)
				onPlayEnd();
			return;
		}	

		self.scheduleDraw(self.actionsSet,self.actionsSet.interval,callbackFunctionArg, onPlayEnd, onPause, true, interruptActionStatus);
	}

	this.scheduleDraw = function (actionSetArg, interval, callbackFunctionArg, onPlayEnd, onPause, isFirst, interruptActionStatus)
	{
		window.setTimeout(function(){
			var status = "";
			if (interruptActionStatus != null)
			{
				status = interruptActionStatus();
				if (status == 'stop')
				{
					self.pauseInfo = null;
					onPlayEnd();
					return;
				}
			}
			
			if (status == "pause")
			{
				self.pauseInfo = {
					"actionset":actionSetArg,
					"callbackFunc":callbackFunctionArg,
					"onPlaybackEnd":onPlayEnd,
					"onPause":onPause,
					"isFirst":isFirst,
					"interruptActionsStatus":interruptActionStatus
				};
				
				if (onPause)
					onPause();
				return;
			}
			
			var intervalDiff = -1;
			var isLast = true;
			if (actionSetArg.next != null)
			{
				isLast = false;
				intervalDiff = actionSetArg.next.interval - actionSetArg.interval;
			}
			if (intervalDiff >= 0)
				self.scheduleDraw(actionSetArg.next, intervalDiff, callbackFunctionArg, onPlayEnd, onPause, false,interruptActionStatus);

			self.drawActions(actionSetArg.actions, onPlayEnd, isFirst, isLast);
		},interval);
	}
	
	this.resume = function()
	{
		if (!self.pauseInfo)
			return;
		
		self.scheduleDraw(self.pauseInfo.actionset, 0, 
			self.pauseInfo.callbackFunc, 
			self.pauseInfo.onPlaybackEnd, 
			self.pauseInfo.onPause,
			self.pauseInfo.isFirst,
			self.pauseInfo.interruptActionsStatus);
			
		self.pauseInfo = null;
	}	
	
	this.drawActions = function (actionArray, onPlayEnd, isFirst, isLast)
	{
		for (var i = 0; i < actionArray.length; i++)
			self.drawing.drawAction(actionArray[i],false);
			
		if (isLast)
		{
			onPlayEnd();
		}
	}
}

ActionsSet = function (interalArg, actionsArrayArg)
{
	var self = this;
	this.actions = actionsArrayArg;
	this.interval = interalArg;
	this.next = null;
}
