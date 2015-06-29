angular.module('watchly.controllers', ['watchly.services'])

  .controller('MapCtrl', function ($scope, $http, $ionicModal, $ionicLoading, $ionicSideMenuDelegate, $compile, Auth, Incidents, Messages) {

    function initialize() {
        var mapOptions = {
          // Center on Hack Reactor    
          center: new google.maps.LatLng(37.783726, -122.408973),
          zoom: 18,
          // mapTypeId: google.maps.MapTypeId.ROADMAP
          disableDoubleClickZoom: true,
          // Pegman Street View
          streetViewControl: false,
          // Zoom Control Bar
          zoomControl: true,
          zoomControlOptions: {
            // .SMALL, .LARGE, .DEFAULT
            style: google.maps.ZoomControlStyle.SMALL,
            // .LEFT_BOTTOM, .RIGHT_CENTER etc.
            position: google.maps.ControlPosition.TOP_RIGHT
          },
          // Cardinal Direction Controller
          panControl: false,
          // Map/Satellite View Switch
          mapTypeControl: false,
          mapTypeControlOptions: {
            // .HORIZONTAL_BAR, .DROPDOWN_MENU, .DEFAULT
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
          },
          // Display scale control at bottom of map
          scaleControl: false,
          // Display map overview nav at bottom of map
          overviewMapControl: false,
          // Map stylers
          styles: [{featureType: "poi.business",elementType: "labels",stylers: [{ visibility: "off" }]},{"featureType":"landscape.natural","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#e0efef"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"hue":"#1900ff"},{"color":"#c0e8e8"}]},{"featureType":"road","elementType":"geometry","stylers":[{"lightness":100},{"visibility":"simplified"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"on"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"visibility":"on"},{"lightness":700}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#7dcdcd"}]}]
        };
        
        var map = new google.maps.Map(document.getElementById("map"),
            mapOptions);

        $scope.map = map;
        $scope.populateIncidentTypes();
        $scope.getIncidents();
        $scope.setDateAndTime();

        google.maps.event.addListener(map, 'mousedown', function (event) {
          console.log("heard  mousedown");
          clearTimeout($scope.downTimer);
          $scope.downTimer = setTimeout(function () {
            $scope.placeMarker(event.latLng);
          }, 1500);
        });

        google.maps.event.addListener(map, 'mouseup', function (event) {
          console.log("heard mouseup");
          clearTimeout($scope.downTimer);          
        });

    }
    
    google.maps.event.addDomListener(window, 'load', initialize);

    $scope.incidentTypes = [];
    $scope.incidents = [];
    $scope.mapBounds = {};

    $scope.setMapBounds = function () {
      console.log("Calculating and setting map bounds...");
      var bounds = $scope.map.getBounds();
      var northEastBound = bounds.getNorthEast();
      var southWestBound = bounds.getSouthWest();
      $scope.mapBounds.minLat = southWestBound.A;
      $scope.mapBounds.maxLat = northEastBound.A;
      $scope.mapBounds.minLon = southWestBound.F;
      $scope.mapBounds.maxLon = northEastBound.F;
    }

    $scope.getIncidents = function() {
      Incidents.getAllIncidents().then(function (result) {
        $scope.incidents = result[0];
        $scope.renderAllIncidents();
      });
    };

    $scope.renderAllIncidents = function() {
      for (var i = 0; i < $scope.incidents.length; i++) {
        $scope.renderIncident($scope.incidents[i]);
      }
    };

    $scope.renderIncident = function(incidentObj) {
      var incidentPos = new google.maps.LatLng(incidentObj.latitude, incidentObj.longitude);
      var incidentIcon = "./img/" + incidentObj.iconFilename;
      var incident = new google.maps.Marker({
        position: incidentPos,
        map: $scope.map,
        icon: incidentIcon
      });

      var incidentInfoWindowContent = '<div class="incidentInfoTitle"> ' + incidentObj.type + ' on ' + incidentObj.fuzzyAddress + ' </div>' + 
      '<div class="incidentInfoDescription"> ' + 'User Description: ' + incidentObj.description + ' </div>' + 
      '<div class="incidnetInfoUsername"> ' + 'Reported by: ' + incidentObj.username + ' to have occured on ' + incidentObj.occurred_at + '</div>';

      var incidentInfoWindow = new google.maps.InfoWindow({
        content: incidentInfoWindowContent
      });

      google.maps.event.addListener(incident, 'click', function() {
         incidentInfoWindow.open($scope.map,incident);
       });
    };

    $scope.populateIncidentTypes = function () {
      console.log("Called populate incidents");
      Incidents.getIncidentTypes().then(function (result) {
        $scope.incidentTypes = result;
      });
    };

    $scope.setDateAndTime = function () {
      var incidentDate = document.getElementsByClassName('incidentDate')[0];
      var incidentTime = document.getElementsByClassName('incidentTime')[0];
      incidentDate.value = $scope.curDate;
      incidentTime.value = $scope.curTime;
    };

    // TODO Change this to current time rather than being hard coded
    $scope.curDate = "2015-06-27";
    $scope.curTime = "12:00";

    $scope.incidentReportForm = {
      hidden: true
    }

    $scope.createIncidentButton = {
      hidden: true
    };

    $scope.cancelIncidentButton = {
      hidden: true
    };

    $scope.downTimer;
    $scope.newIncident;

    $scope.placeMarker = function (location) {
      if (!$scope.newIncident) {
        $scope.newIncident = new google.maps.Marker({
            animation: google.maps.Animation.DROP,
            position: location,
            map: $scope.map,
            icon: {
              url: "./img/other.png",
              size: new google.maps.Size(25, 25)
            }
          });
        $scope.revealConfirmCancel();
      }
    };

    $scope.confirmIncidentCreate = function () {
      console.log("User confirmed incident create");
      $scope.incidentReportForm.hidden = false;
    };

    $scope.revealConfirmCancel = function () {
      $scope.createIncidentButton.hidden = false;
      $scope.cancelIncidentButton.hidden = false;
      $scope.$apply();
    };

    $scope.hideConfirmCancel = function () {
      $scope.createIncidentButton.hidden = true;
      $scope.cancelIncidentButton.hidden = true;
      $scope.incidentReportForm.hidden = true;
    };

    $scope.removeIncident = function () {
      $scope.newIncident.setMap(null);
      $scope.newIncident = false;
      $scope.hideConfirmCancel();
    };

    $scope.submitIncident = function () {
      console.log("heard incident submit");
      $scope.hideConfirmCancel();
    }

    $scope.centerMapOnUser = function () {
        if (!$scope.map) {
          return;
        }

        $scope.loading = $ionicLoading.show({
            content: 'Getting current location...',
            showBackdrop: false
          });

        navigator.geolocation.getCurrentPosition(function (pos) {
            $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
            $scope.loading.hide();
          }, function (error) {
            alert('Unable to get location: ' + error.message);
          });
      };

    $ionicModal.fromTemplateUrl('templates/signin.html', {
      scope: $scope,
      animation: 'slide-in-up',
      focusFirstInput: true,
    }).then(function(modal) {
      $scope.signInModal = modal;         
    });


    $ionicModal.fromTemplateUrl('templates/signup.html', {
      scope: $scope,
      animation: 'slide-in-up',
      focusFirstInput: true,
    }).then(function(modal) {
      $scope.signUpModal = modal;         
    });

    $ionicModal.fromTemplateUrl('templates/forgotpassword.html', {
      scope: $scope,
      animation: 'slide-in-up',
      focusFirstInput: true,
    }).then(function(modal) {
      $scope.forgotPasswordModal = modal;         
    });    

    $ionicModal.fromTemplateUrl('templates/profile.html', {
      scope: $scope,
      animation: 'slide-in-up',
    }).then(function(modal) {
      $scope.profileModal = modal;       
    });

    $scope.profileActivate = function () { 
      if(Auth.isAuthenticated()) {
        $scope.user = Auth.getUser();
        $scope.profileModal.show();   
        console.log("already authenticated");
      }
      else {
        $scope.signInModal.show();
        console.log("Has been NOT authenticated");
      }
    };

    $scope.openSignInModal = function() {
      $scope.signInModal.show();
    };

    $scope.closeSignInModal = function() {
      $scope.signInModal.hide();
    };

    $scope.openSignUpModal = function() {
      $scope.signUpModal.show();
    };

    $scope.closeSignUpModal = function() {
      $scope.closeSignUpModal.show();
    };

    $scope.openForgotPasswordModal = function() {
      $scope.forgotPasswordModal.show();
    };

    $scope.closeProfileModal = function() {
      $scope.profileModal.hide();
    };

    $scope.signUp = function(user) {
      Auth.signup(user).then(function(res) {
        $scope.closeSignUpModal();
      });
    };

    $scope.signIn = function(user) {
      Auth.signin(user).then(function(res) {
        $scope.closeSignInModal();
      });
    };
  });
