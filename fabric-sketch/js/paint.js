(function(){
/***********************************************************************
  set canvas width and height dynamic
***********************************************************************/
  var canvas_w = $('#canvas-container').width();
  var canvas_h = $('#canvas-container').height();

  canvas.setWidth(canvas_w);
  canvas.setHeight(canvas_h);

  $(window).resize(function(){
      var canvas_w = $('#canvas-container').width();
      var canvas_h = $('#canvas-container').height();

      canvas.setWidth(canvas_w);
      canvas.setHeight(canvas_h);
  });
/***********************************************************************
  show value of input range on change
***********************************************************************/
  $('#drawing-form input[type="range"]').change(function(){
    var value = $(this).val();
    $(this).siblings('.info').html(value);
  });
  
  $('#text-options-form input[type="range"]').change(function(){
    var value = $(this).val();
    $(this).siblings('.info').html(value);
  });
/***********************************************************************
  plugin powerange code
***********************************************************************/
  var range_store = $('input[type="range"]')
  $.each(range_store, function(index, item){
    var init = new Powerange(item, {
      min: $(item).attr('min'),
      max: $(item).attr('max'),
      hiderange: true,
      decimal: true,
      start: $(item).val(),
      klass: 'custom-range-bar',
    });
    init.setStart($(item).val());
  });

/***********************************************************************
  Free Drawing Mode javascript code
***********************************************************************/
  fabric.Object.prototype.transparentCorners = false;

  var drawingModeEl = document.getElementById('drawing-mode'),
      drawingOptionsEl = document.getElementById('drawing-mode-options'),
      drawingColorEl = document.getElementById('drawing-color'),
      drawingLineWidthEl = document.getElementById('drawing-line-width'),
      drawingShadowWidth = document.getElementById('drawing-shadow-width');

  drawingModeEl.onclick = function() {
    canvas.isDrawingMode = !canvas.isDrawingMode;
    var drawButton = $(this);
    if (canvas.isDrawingMode) {
      drawButton.html('Stop Drawing');
      drawButton.addClass('btn-danger').removeClass('btn-default');
      //drawingOptionsEl.style.display = '';
    }
    else {
      drawButton.html('Start Drawing');
      drawButton.removeClass('btn-danger').addClass('btn-default');
      //drawingOptionsEl.style.display = 'none';
    }
  };

  if (fabric.PatternBrush) {
    var vLinePatternBrush = new fabric.PatternBrush(canvas);
    vLinePatternBrush.getPatternSrc = function() {

      var patternCanvas = fabric.document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = 10;
      var ctx = patternCanvas.getContext('2d');

      ctx.strokeStyle = this.color;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(0, 5);
      ctx.lineTo(10, 5);
      ctx.closePath();
      ctx.stroke();

      return patternCanvas;
    };

    var hLinePatternBrush = new fabric.PatternBrush(canvas);
    hLinePatternBrush.getPatternSrc = function() {

      var patternCanvas = fabric.document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = 10;
      var ctx = patternCanvas.getContext('2d');

      ctx.strokeStyle = this.color;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(5, 0);
      ctx.lineTo(5, 10);
      ctx.closePath();
      ctx.stroke();

      return patternCanvas;
    };

    var squarePatternBrush = new fabric.PatternBrush(canvas);
    squarePatternBrush.getPatternSrc = function() {

      var squareWidth = 10, squareDistance = 2;

      var patternCanvas = fabric.document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = squareWidth + squareDistance;
      var ctx = patternCanvas.getContext('2d');

      ctx.fillStyle = this.color;
      ctx.fillRect(0, 0, squareWidth, squareWidth);

      return patternCanvas;
    };

    var diamondPatternBrush = new fabric.PatternBrush(canvas);
    diamondPatternBrush.getPatternSrc = function() {

      var squareWidth = 10, squareDistance = 5;
      var patternCanvas = fabric.document.createElement('canvas');
      var rect = new fabric.Rect({
        width: squareWidth,
        height: squareWidth,
        angle: 45,
        fill: this.color
      });

      var canvasWidth = rect.getBoundingRectWidth();

      patternCanvas.width = patternCanvas.height = canvasWidth + squareDistance;
      rect.set({ left: canvasWidth / 2, top: canvasWidth / 2 });

      var ctx = patternCanvas.getContext('2d');
      rect.render(ctx);

      return patternCanvas;
    };

    var img = new Image();
    img.src = 'data:image/png;base64,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';

    var texturePatternBrush = new fabric.PatternBrush(canvas);
    texturePatternBrush.source = img;
  }

  document.getElementById('drawing-mode-selector').addEventListener('change', function() {
    if (this.value === 'hline') {
      canvas.freeDrawingBrush = vLinePatternBrush;
    }
    else if (this.value === 'vline') {
      canvas.freeDrawingBrush = hLinePatternBrush;
    }
    else if (this.value === 'square') {
      canvas.freeDrawingBrush = squarePatternBrush;
    }
    else if (this.value === 'diamond') {
      canvas.freeDrawingBrush = diamondPatternBrush;
    }
    else if (this.value === 'texture') {
      canvas.freeDrawingBrush = texturePatternBrush;
    }
    else {
      canvas.freeDrawingBrush = new fabric[this.value + 'Brush'](canvas);
    }

    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = drawingColorEl.value;
      canvas.freeDrawingBrush.width = parseInt(drawingLineWidthEl.value, 10) || 1;
      canvas.freeDrawingBrush.shadowBlur = parseInt(drawingShadowWidth.value, 10) || 0;
    }
  });

  drawingColorEl.onchange = function() {
    canvas.freeDrawingBrush.color = drawingColorEl.value;
  };
  drawingLineWidthEl.onchange = function() {
    canvas.freeDrawingBrush.width = parseInt(drawingLineWidthEl.value, 10) || 1;
  };
  drawingShadowWidth.onchange = function() {
    canvas.freeDrawingBrush.shadowBlur = parseInt(drawingShadowWidth.value, 10) || 0;
  };

  if (canvas.freeDrawingBrush) {
    canvas.freeDrawingBrush.color = drawingColorEl.value;
    canvas.freeDrawingBrush.width = parseInt(drawingLineWidthEl.value, 10) || 1;
    canvas.freeDrawingBrush.shadowBlur = 0;
  }
/***********************************************************************
  Canvas Events with angular scope
***********************************************************************/
  var appScope = angular.element('#canvaspaintCtrl').scope();
  canvas
  .on('object:selected', function(){
      var activeObject = canvas.getActiveObject(),
        activeGroup = canvas.getActiveGroup();
      if (activeGroup) {
        appScope.$apply(appScope.onGroupSelection(activeGroup));
      }
      else if (activeObject) {
        appScope.$apply(appScope.onObjectSelection(activeObject));
      }        
  })
  .on('selection:created', function(){
    var activeObject = canvas.getActiveObject(),
        activeGroup = canvas.getActiveGroup();
      if (activeGroup) {
        appScope.$apply(appScope.onGroupSelection(activeGroup));
      }
      else if (activeObject) {
        appScope.$apply(appScope.onObjectSelection(activeObject));
      }     
  })
  .on('selection:cleared', function(){
      safeApply(appScope, appScope.onSelectionCleared);
      //appScope.$apply(appScope.onSelectionCleared);
  })
  .on('object:added', function(e){
    e.target.set('index', canvas.getObjects().length);
  });
/***********************************************************************/
})();

/***********************************************************************
  add Image on canvas
***********************************************************************/
function addImage(item){
  if (item.files && item.files[0]) {
      file = item.files[0];
      fr = new FileReader();
      fr.onload = function () {
          img = new Image();
          img.onload = function () {
              fabric.Image.fromURL(img.src, function (oImg) {
                 oImg.scale(0.2);
                 canvas.add(oImg);
              });
          };
          img.src = fr.result;
      };
      fr.readAsDataURL(file);
  }
}

/***********************************************************************/