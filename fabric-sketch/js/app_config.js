(function(){
  app = angular.module('canvaspaintApp', [ ]);
  app.controller('canvaspaintCtrl', function($scope){
    $scope.canvas = canvas;
    $scope.getActiveStyle = getActiveStyle;
    addAccessors($scope);
    watchCanvas($scope);
    $scope.showFreeDrawMenus = false;
    $scope.showTextOptions = false;
    $scope.activeObjectFlag = false;
    $scope.activeGroupFlag = false;
    //$scope.activePath = false;
  });
})();

app.config(function($interpolateProvider) {
  $interpolateProvider
    .startSymbol('{[')
    .endSymbol(']}');
});

app.directive('bindValueTo', function() {
  return {
    restrict: 'A',

    link: function ($scope, $element, $attrs) {

      var prop = capitalize($attrs.bindValueTo),
          getter = 'get' + prop,
          setter = 'set' + prop;

      $element.on('change keyup select', function() {
        $scope[setter] && $scope[setter](this.value);
      });

      $scope.$watch($scope[getter], function(newVal) {
        if ($element[0].type === 'radio') {
          var radioGroup = document.getElementsByName($element[0].name);
          for (var i = 0, len = radioGroup.length; i < len; i++) {
            radioGroup[i].checked = radioGroup[i].value === newVal;
          }
        }
        else {
          $element.val(newVal);
        }
      });
    }
  };
});

app.directive('objectButtonsEnabled', function() {
  return {
    restrict: 'A',

    link: function ($scope, $element, $attrs) {
      $scope.$watch($attrs.objectButtonsEnabled, function(newVal) {

        $($element).find('.btn-object-action')
          .prop('disabled', !newVal);
      });
    }
  };
});