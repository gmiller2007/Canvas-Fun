$(document).ready(function(){

    connect();

});

function connect(){
    var socket
    ,   server_address = "/";
    socket = io.connect(server_address);
    bind_dom_listeners(socket);
    bind_sockets(socket);
}

function bind_sockets(socket){
    socket.on('connect', function(data) {
        create_chat_element("connect");
        socket.emit('connect');
        console.log("Connecting...");
    });
    socket.on('ready', function(data) {
        create_chat_element("ready", data);
        console.log("User ready: "+data);
    });
    socket.on('message', function(data) {
        create_chat_element("message", data);
        console.log("message: "+JSON.stringify(data));
    });
    socket.on('disconnect', function(data) {
        create_chat_element("disconnect", data);
        console.log("disconnect: "+data);
    });
};

function bind_dom_listeners(socket){
    $("#chat_form").submit(function(event){
        event.preventDefault();
        if($("#chat_input").val().length > 0){
            socket.emit("message", { data : $("#chat_input").val() });
            $("#chat_input").val("");
        }
    });
};


function create_chat_element(element, data){
    //console.log("create_chat_element called");
    var chat_space = $("#chat_window .container-fluid")
    ,   time = new Date
    ,   hour = time.getHours()
    ,   mins = time.getMinutes();
    if( mins < 10 ){
        mins = "0"+mins;
    }
    var now = hour+":"+mins;

    if( element === "message" ){
        var item = '<div class="row-fluid"> \
                        <div class="span2"> \
                            <p>['+now+'] '+data.user+':</p> \
                        </div> \
                        <div class="span10"> \
                            <p>'+data.data+'</p> \
                        </div> \
                    </div>';
        chat_space.append(item);

    }else if( element === "connect"){
        var item = '<div class="row-fluid"> \
                        <div class="span2"> \
                            <p>['+now+']</p> \
                        </div> \
                        <div class="span10"> \
                            <p>You are connecting.</p> \
                        </div> \
                    </div>';
        chat_space.append(item);

    }else if( element === "ready"){
        var item = '<div class="row-fluid"> \
                        <div class="span2"> \
                            <p>['+now+']</p> \
                        </div> \
                        <div class="span10"> \
                            <p>'+data.message+'</p> \
                        </div> \
                    </div>';
        chat_space.append(item);

    }else if( element === "disconnect"){
        var item = '<div class="row-fluid"> \
                        <div class="span2"> \
                            <p>['+now+']</p> \
                        </div> \
                        <div class="span10"> \
                            <p><a href="/user?id='+data.user_id+'" target="_blank">'+data.username+'</a> has disconnected.</p> \
                        </div> \
                    </div>';
        chat_space.append(item);

    }
}
