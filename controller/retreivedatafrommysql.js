       
 module.exports = function(request , socket , receiver , emitter ,noofobj , total_count )
 {    
     console.log(receiver);
     console.log(noofobj);
     console.log(emitter);
     console.log(total_count); 
     
     
     // Custom event emitter 
     const EventEmitter = require('events');
     const util = require('util');

     function MyEmitter() {
         EventEmitter.call(this);
     }
     util.inherits(MyEmitter, EventEmitter);

     const myEmitter = new MyEmitter();

     var jsonoutput = [];
     var jsonBufferArray = [];
     var firstrowcounter = 0;
     var Plottingflag = 0;
     var counter = 0;
     
     request.on('result', function(row) {

         jsonoutput.push(row);
         
         if(Plottingflag == 0)
         {
         firstrowcounter++; 
         }

         if(firstrowcounter == noofobj)
         {
          myEmitter.emit('FirstItemFlush');
          firstrowcounter = 0;
         }
     });

     myEmitter.on('FirstItemFlush', () => {
        
         Plottingflag = 1;
         
         jsonBufferArray = [];
         jsonBufferArray.push(jsonoutput.shift());
         socket.emit(receiver, jsonBufferArray);
         counter++;
         total_count--; 
         
     });
     
        request.on('done', function (affected) {

            if (Plottingflag == 0) {
                jsonBufferArray = [];
                jsonBufferArray.push(jsonoutput.shift());
                socket.emit(receiver, jsonBufferArray);
                total_count--; 
            }
        }); 
 
        socket.on(emitter, function() {
            
                 jsonBufferArray = [];
        
                 for (var i = 0; i < noofobj; i++) 
                 {    
                     var a = jsonoutput.shift();
                     if(a !== undefined)
                     {
                     jsonBufferArray.push(a);
                     counter++; 
                     total_count--;
                     }
                 }
                if (counter < 100000) {

                    if (total_count > 0) {
                        socket.emit(receiver, jsonBufferArray);
                    } else {
                        // send the last buffer 
                        socket.emit(receiver, jsonBufferArray);
                        socket.emit('donesending', 'Completed work');
                    }
                }
             });
        
 }