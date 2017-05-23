
module.exports = function(socket){
    
var rfdb = require('./retrievedatafromdb');
    
var random = parseInt(Math.random()*10000);

console.log('socket.io connected');

var sql = require('mssql');

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
    
  var config = {
     user: 'sa',
     password: 'dell@123',
     server: '10.184.56.41\\EMATIX',
     database: 'Usrmngmt_Account_KKPINNACLE',
     port: 1433,
     stream: true,
     requestTimeout: 0
 };
       
  sql.connect(config, function(err) {
  
     var request = new sql.Request();
     var request2 = new sql.Request();
     var total_count = 0; 
     socket.emit('ConnectDB','DBConnect');
     
     request.query("Select count(1) as Count_Value  FROM [site_upload] where Operator = 'Airtel' and Technology = 'CustComp' and versionid = 28");  
      
     request.on('row' , function(row){
         
        total_count = row.Count_Value; 
          
         if(flag == 0)
             {
                 request2.query("SELECT top 10000 [Latitude] ,[Longitude] ,[Azimuth] FROM [site_upload] where Operator = 'Airtel' and Technology = 'CustComp' and versionid = 28");
                socket.emit('ExecuteDB' , {total_count : 10000 });  
                 
                  rfdb(request2 , socket , receiver ,emitter, noofobj , 10000); 
                 
             }else {
                 
                request2.query("SELECT [Latitude] ,[Longitude] ,[Azimuth] FROM [site_upload] where Operator = 'Airtel' and Technology = 'CustComp' and versionid = 28");
                socket.emit('ExecuteDB' , {total_count : total_count }); 
                 
                  rfdb(request2 , socket , receiver ,emitter, noofobj , total_count); 
             }
         
       
         
         
     }); 
      
  
       
 });   
    
    
});


}