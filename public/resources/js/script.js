var myApp = angular.module('myApp', []); 


myApp.service('getPlotData' , ['$rootScope' ,  function($rootScope){
    
    var self = this; 
    
    
self.plotSector = function(flag) {
    
    self.socketplotsector = io.connect('http://localhost:90/', {
        'force new connection': true
    });

    self.socketplotsector.on('donesending', function (data) {
        $rootScope.$broadcast('donesending'); 
        self.socketplotsector.disconnect();
    });

    self.socketplotsector.on('ConnectDB', function (data) {
        $rootScope.$broadcast('ConnectDB'); 
     //   $('#statusWindow').html("Connecting to database...");
    });

    self.socketplotsector.on('ExecuteDB', function (data) {
        
        $rootScope.$broadcast('ExecuteDB' , { data : data});
        
    });

    self.socketplotsector.emit('plot_sectors', {
        receiver: 'sector_row',
        emitter: 'doneplottingsector',
        noofobj: '1000',
        flag : flag
    });

    // firsttime plotting
   // self.socketplotsector.emit('doneplottingsector');

    self.socketplotsector.on('sector_row', function (data) {
      
        $rootScope.$broadcast('plot_sector_row' , {data : data}); 
        

    });
    
    self.emitPlotEvent = function(){
     self.socketplotsector.emit('doneplottingsector');   
    }
    
}
    
    
}]); 


myApp.controller('Mapcontroller' , ['$scope' , 'getPlotData', '$window' , function($scope , getPlotData , $window){
    
    $scope.initMap = function() {
        $scope.map = new google.maps.Map(document.getElementById('map-area'), {
        zoom: 12,
        center: {lat: 12.9623 , lng: 77.5737}
        });
    }
    
    $scope.heatmap ; 
    $scope.all_array_polygon = []; 
    
    // 0 for objects , 1 for heatmaps.
    $scope.flag = 0; 
    
    $scope.status = "Status :"; 
   // $scope.$apply();
    
    $scope.heatmapArray = []; 
    
    // handle click event of plot data 
    
    $scope.plotSector = function(){
        
        $scope.clearMap(); 
        $scope.flag = 0; 
        $scope.status = "Initiating database connection...";
        $scope.disPlotSector = true; 
        $scope.disHeatMap = true; 
        
        $scope.totalElem = 0;
        getPlotData.plotSector(0); 
        
    }
    
      $scope.heatmapFun = function(){
          
        $scope.clearMap();
          
        $scope.flag = 1; 
        $scope.status = "Initiating database connection...";
        $scope.disPlotSector = true;
        $scope.disHeatMap = true; 
        
        $scope.totalElem = 0;
        getPlotData.plotSector(1); 
        
    }
    

    $scope.$on('ConnectDB', function(){
        console.log('Connecting to database');
        $scope.status = "Connecting to database"; 
        $scope.$apply();
    });
    
    $scope.total_count = 0; 
    
    $scope.$on('ExecuteDB', function(evnt , data){
        
       $scope.total_count = data.data.total_count; 
        
       console.log($scope.total_count); 
        
       $scope.status = "Executing Query"; 
       $scope.$apply();
   });
    
    $scope.$on('donesending', function(){
        
        console.log('donesending');
        
        if ($scope.flag == 1) {
            $scope.heatmap = new google.maps.visualization.HeatmapLayer({
                data: $scope.heatmapArray,
                radius: 25,
                map: $scope.map
            });
            
             $scope.heatmapArray = [];
        }

        $scope.disPlotSector = false; 
        $scope.disHeatMap = false; 
        $scope.status = "Loading Completed..."; 
        $scope.$apply(); 
        
        setTimeout(function(){
          $scope.status = "Status :";  
          $scope.$apply(); 
        }, 2000); 
        
    });
    
    // Update map with Data 
    
    $scope.$on('plot_sector_row' , function(evnt , result){
        
        $scope.status = "Plotting data on map....";
        
          for (var i = 0; i < result.data.length; i++) {
              
                $scope.totalElem++; 

                var latlng = new google.maps.LatLng(result.data[i].Latitude, result.data[i].Longitude);
              
               if($scope.flag == 0)
                   {
                      
                        var arr1 = [];

                        var cell_rad = 2 / 1000;

                        var latlng = new google.maps.LatLng(result.data[i].Latitude, result.data[i].Longitude);
                        arr1.push(latlng);

                        var AZIMUTH1 = 90 - parseInt(result.data[i].Azimuth);

                        var ANG1 = AZIMUTH1 - 32.5;
                        var ANG2 = AZIMUTH1 + 32.5;

                        for (var j = ANG1; j < ANG2; j += 15) {
                        latlng = new google.maps.LatLng(parseFloat(result.data[i].Latitude) + Math.sin(j * 3.14 / 180) * cell_rad, parseFloat(result.data[i].Longitude) + Math.cos(j * 3.14 / 180) * cell_rad);
                        arr1.push(latlng);
                        }

                        var colorcode;

                        colorcode = "#00FF00";

                        $scope.newpoly = new google.maps.Polygon({
                        path: arr1,
                        strokeColor: "#000000",
                        strokeOpacity: 0.4,
                        strokeWeight: 0.6,
                        fillColor: colorcode,
                        fillOpacity: 0.8,
                        zIndex: 1
                        });

                        $scope.newpoly.setMap($scope.map);
  
                        $scope.all_array_polygon.push($scope.newpoly);
                       
                        delete $scope.newpoly;
                       
                   }else{
                      $scope.heatmapArray.push(latlng);  
                   }
              
                  
        }
        
         $scope.status = "Loading " + $scope.totalElem + " Elements";
         $scope.$apply();
    
           getPlotData.emitPlotEvent();  
    
        
    }); 
    
    $scope.clearMap = function(){
        
        $scope.status = "Clearing Map Objects...";
        
        for(var i=0 ; i < $scope.all_array_polygon.length ; i++){
            
            $scope.all_array_polygon[i].setMap(null);
        }
        $scope.all_array_polygon = []; 
        
        
        if($scope.heatmap !== undefined){
             $scope.heatmap.setMap(null);
        }
        
        $scope.status = "Clearing Map Objects completed...";
        
        setTimeout(function(){
          $scope.status = "Status :";  
          $scope.$apply();
        }, 1000); 
        
    }
             
    $window.onload = $scope.initMap(); 

}]); 


