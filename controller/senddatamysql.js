
module.exports = function(socket){
    
var rfdb = require('./retreivedatafrommysql');
    
var random = parseInt(Math.random()*10000);

console.log('socket.io connected');

var mysql = require('mysql');

var receiver; 
var noofobj = 0;
var emitter; 
  
// plot sectors  
 
socket.on('plot_sectors' , function(data){
    
    console.log('reached here');
    
receiver =  data.receiver ; 
emitter = data.emitter;
noofobj = parseInt(data.noofobj) ; 
flag = data.flag; 
  
console.log('flag is ' + flag);    
    
  var connection = mysql.createConnection({
     user: 'root',
     password: '',
     server: 'localhost',
     database: 'geoplot',
     port: 3306
 });
    
var query1 = connection.query("Select count(1) as Count_Value FROM geoplot.data"); 
    
 query1.on('result', function(row) {
    total_count = row.Count_Value;
     
     console.log("row count " + total_count );
     
     
        if(flag == 0)
        {
            var query2 = connection.query("SELECT Latitude ,Longitude , Azimuth FROM geoplot.data limit 10000");
            socket.emit('ExecuteDB' , {total_count : 10000 });  

            rfdb(query2 , socket , receiver ,emitter, noofobj , 10000); 

        }else {

            var query2 = connection.query("SELECT Latitude ,Longitude ,Azimuth FROM geoplot.data");
            socket.emit('ExecuteDB' , {total_count : total_count }); 

            rfdb(query2 , socket , receiver ,emitter, noofobj , total_count); 
        }
     
     
     
});   
    
  
    
});


}