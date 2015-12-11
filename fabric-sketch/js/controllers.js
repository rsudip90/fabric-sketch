
function safeApply(scope, fn) {
    (scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
}

function watchCanvas($scope) {

  function updateScope() {
    $scope.$$phase || $scope.$digest();
    canvas.renderAll();
  }

  canvas
    .on('object:selected', updateScope)
    .on('group:selected', updateScope)
    .on('path:created', updateScope)
    .on('selection:cleared', updateScope);
}

function getActiveStyle(styleName, object) {
  object = object || canvas.getActiveObject();
  if (!object) return '';

  return (object.getSelectionStyles && object.isEditing)
    ? (object.getSelectionStyles()[styleName] || '')
    : (object[styleName] || '');
};

function setActiveStyle(styleName, value, object) {
  object = object || canvas.getActiveObject();
  if (!object) return;

  if (object.setSelectionStyles && object.isEditing) {
    var style = { };
    style[styleName] = value;
    object.setSelectionStyles(style);
    object.setCoords();
  }
  else {
    object[styleName] = value;
  }

  object.setCoords();
  canvas.renderAll();
};

function getActiveProp(name) {
  var object = canvas.getActiveObject();
  if (!object) return '';

  return object[name] || '';
}

function setActiveProp(name, value) {
  var object = canvas.getActiveObject();
  if (!object) return;

  object.set(name, value).setCoords();
  canvas.renderAll();
}

function addAccessors($scope) {

  $scope.getOpacity = function() {
    return getActiveStyle('opacity') * 100;
  };
  $scope.setOpacity = function(value) {
    setActiveStyle('opacity', parseInt(value, 10) / 100);
  };

  $scope.getFill = function() {
    return getActiveStyle('fill');
  };
  $scope.setFill = function(value) {
    setActiveStyle('fill', value);
  };

  $scope.isBold = function() {
    return getActiveStyle('fontWeight') === 'bold';
  };
  $scope.toggleBold = function() {
    setActiveStyle('fontWeight',
      getActiveStyle('fontWeight') === 'bold' ? '' : 'bold');
  };

  $scope.isItalic = function() {
    return getActiveStyle('fontStyle') === 'italic';
  };
  $scope.toggleItalic = function() {
    setActiveStyle('fontStyle',
      getActiveStyle('fontStyle') === 'italic' ? '' : 'italic');
  };

   $scope.isUnderline = function() {
    return getActiveStyle('textDecoration').indexOf('underline') > -1;
  };
  $scope.toggleUnderline = function() {
    var value = $scope.isUnderline()
      ? getActiveStyle('textDecoration').replace('underline', '')
      : (getActiveStyle('textDecoration') + ' underline');

    setActiveStyle('textDecoration', value);
  };

  $scope.isLinethrough = function() {
    return getActiveStyle('textDecoration').indexOf('line-through') > -1;
  };
  $scope.toggleLinethrough = function() {
    var value = $scope.isLinethrough()
      ? getActiveStyle('textDecoration').replace('line-through', '')
      : (getActiveStyle('textDecoration') + ' line-through');

    setActiveStyle('textDecoration', value);
  };
  
  $scope.isOverline = function() {
    return getActiveStyle('textDecoration').indexOf('overline') > -1;
  };
  $scope.toggleOverline = function() {
    var value = $scope.isOverline()
      ? getActiveStyle('textDecoration').replace('overlin', '')
      : (getActiveStyle('textDecoration') + ' overline');

    setActiveStyle('textDecoration', value);
  };

  $scope.getText = function() {
    return getActiveProp('text');
  };
  $scope.setText = function(value) {
    setActiveProp('text', value);
  };

  $scope.getTextAlign = function() {
    return capitalize(getActiveProp('textAlign'));
  };
  $scope.setTextAlign = function(value) {
    setActiveProp('textAlign', value.toLowerCase());
  };

  $scope.getFontFamily = function() {
    return getActiveProp('fontFamily').toLowerCase();
  };
  $scope.setFontFamily = function(value) {
    setActiveProp('fontFamily', value.toLowerCase());
  };

  $scope.getBgColor = function() {
    return getActiveProp('backgroundColor');
  };
  $scope.setBgColor = function(value) {
    setActiveProp('backgroundColor', value);
  };

  $scope.getTextBgColor = function() {
    return getActiveProp('textBackgroundColor');
  };
  $scope.setTextBgColor = function(value) {
    setActiveProp('textBackgroundColor', value);
  };

  $scope.getStrokeColor = function() {
    return getActiveStyle('stroke');
  };
  $scope.setStrokeColor = function(value) {
    setActiveStyle('stroke', value);
  };

  $scope.getStrokeWidth = function() {
    return getActiveStyle('strokeWidth');
  };
  $scope.setStrokeWidth = function(value) {
    setActiveStyle('strokeWidth', parseInt(value, 10));
  };

  $scope.getFontSize = function() {
    return getActiveStyle('fontSize');
  };
  $scope.setFontSize = function(value) {
    setActiveStyle('fontSize', parseInt(value, 10));
  };

  $scope.getLineHeight = function() {
    return getActiveStyle('lineHeight');
  };
  $scope.setLineHeight = function(value) {
    setActiveStyle('lineHeight', parseFloat(value, 10));
  };

  $scope.getBold = function() {
    return getActiveStyle('fontWeight');
  };
  $scope.setBold = function(value) {
    setActiveStyle('fontWeight', value ? 'bold' : '');
  };

  $scope.getCanvasBgColor = function() {
    return canvas.backgroundColor;
  };
  $scope.setCanvasBgColor = function(value) {
    canvas.backgroundColor = value;
    canvas.renderAll();
  };

  $scope.addText = function() {
    var thisText = 'Sample Text';
    var textSample = new fabric.IText(thisText, {
      fontFamily: 'Arial',
      scaleX: 1,
      scaleY: 1,
      fontSize: 25, 
      originX: 'left',
      left: 50,
      top: 50,
    });
    /* Extend object with custom property */
    textSample.toObject = (function(toObject) {
      return function() {
        return fabric.util.object.extend(toObject.call(this), {
          id: this.id
        });
      };
    })(textSample.toObject);
    canvas.add(textSample);
  };

  $scope.addRect = function(){
      canvas.add(new fabric.Rect(
      {
          width: 50,
          height: 50,
          left: 50,
          top: 50,
          fill: 'rgb(255,0,0)',
        })
      );
  };

  $scope.addCircle = function(){
    canvas.add(new fabric.Circle(
    {
        radius: 40,
        left: 50,
        top: 50,
        fill: 'rgb(0,255,0)',
        opacity: 0.5
      })
    );
  };

  $scope.addLine = function(){
    canvas.add(new fabric.Line([10, 10, 100, 100],
    {
        stroke: 'red',
        fill: 'green',
        strokeWidth: 10,
        opacity: 0.5
      })
    );
  };  

  $scope.addTriangle = function(){
    canvas.add(new fabric.Triangle(
    {
        width: 50, 
        height: 50, 
        fill: 'blue', 
        left: 50, 
        top: 50
      })
    );
  };

  $scope.triggerImageInput = function(){
      $('#canvas-img').click();
      return false;
  }

  $scope.clearCanvas = function(){
    if (canvas.getObjects().length > 0) {
      if(confirm('Are you sure to clear the canvas?')){
        canvas.clear();
      }   
    }         
  };

  $scope.isCanvasEmpty = function(){
    if (canvas.getObjects().length > 0) {
      return false; 
    }
    else{
      return true;
    }
  };

  $scope.getSelected = function() {
    return canvas.getActiveObject();
  };

  $scope.removeSelected = function() {
    var activeObject = canvas.getActiveObject(),
        activeGroup = canvas.getActiveGroup();

    if (activeGroup) {
      if (!confirm('Are you sure to remove selected object group?')) {
    	return false;
      }
      var objectsInGroup = activeGroup.getObjects();
      canvas.discardActiveGroup();
      objectsInGroup.forEach(function(object) {
        canvas.remove(object);
      });
    }
    else if (activeObject) {
      if (!confirm('Are you sure to remove selected object?')) {
    	return false;
      }
      canvas.remove(activeObject);
    }
  };

  $scope.freeDrawToggle = function(){
  	this.showTextOptions = false;
	this.showFreeDrawMenus = !this.showFreeDrawMenus;
  };

  $scope.enabledFreeDraw = function(){
	return this.showFreeDrawMenus;
  };

  $scope.enableSideBar = function(){
  	if (this.showFreeDrawMenus || this.showTextOptions) {
  		return true;
  	}
  	else{
  		return false;
  	}
  }

  $scope.enabledTextOptions = function(){
	return this.showTextOptions;
  };

  $scope.isAnyActiveObject = function(){
	return ( this.activeGroupFlag || this.activeObjectFlag );
  };

  $scope.isOnlyActiveObject = function(){
    return this.activeObjectFlag;
  };

  $scope.duplicate = function(){
    if ($scope.activeGroupFlag) {
      var activeGroup = canvas.getActiveGroup();
      var objectsInGroup = activeGroup.getObjects();
      canvas.discardActiveGroup();
      objectsInGroup.forEach(function(object) {
        var obj = fabric.util.object.clone(object);
        obj.set("top", obj.top+30);
        obj.set("left", obj.left+30);
        canvas.add(obj);
      });
    }
    else if ($scope.activeObjectFlag) {
        var obj = fabric.util.object.clone(canvas.getActiveObject());
        obj.set("top", obj.top+30);
        obj.set("left", obj.left+30);
        canvas.add(obj);
    }    
  };

  $scope.rasterize = function() {
    if (!fabric.Canvas.supports('toDataURL')) {
      alert('This browser doesn\'t provide means to serialize canvas to an image');
    }
    else {
      window.open(canvas.toDataURL('png'));
    }
  };

  $scope.onObjectSelection = function(activeObject){
    //var activeObject = canvas.getActiveObject();
    $scope.activeObjectFlag = true;
    $scope.activeGroupFlag = false;
    if (activeObject.type === 'i-text') {
       $scope.showTextOptions = true;
    }
    else{
      $scope.showTextOptions = false; 
    }
  };

  $scope.onGroupSelection = function(activeGroup){
    //in selection if object is covered in selection then object:selected automatically called.
    //var activeGroup = canvas.getActiveGroup();
    if (activeGroup) {
      $scope.activeObjectFlag = false;
      $scope.activeGroupFlag = true;
    }
    $scope.showTextOptions = false; 
  };

  $scope.onSelectionCleared = function(){
    $scope.activeObjectFlag = false;
    $scope.activeGroupFlag = false;    
    $scope.showTextOptions = false;
    $scope.showOpacity = false;
  };

  $scope.sendBackwards = function() {
    var activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.sendBackwards(activeObject);
    }
  };

  $scope.sendToBack = function() {
    var activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.sendToBack(activeObject);
    }
  };

  $scope.bringForward = function() {
    var activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.bringForward(activeObject);
    }
  };

  $scope.bringToFront = function() {
    var activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.bringToFront(activeObject);
    }
  };

  $scope.toggleOpacity = function(){
    $scope.showOpacity = !$scope.showOpacity;
  }

  $scope.enabledOpacity = function(){
    return $scope.showOpacity;
  }
}

fabric.Object.prototype.set({
    index: canvas._objects.length,
});