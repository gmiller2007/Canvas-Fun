/***
* Clientside sockets configuration
*/


$(document).ready(function setup_sockets(){

    var NICK_MAX_LENGTH = 15,
        ROOM_MAX_LENGTH = 10,
        socket = null,
        clientId = null,
        nickname = null,
        current_room = null,
        server_address = 'http://localhost:3000',
        server_display_name = 'Server',
        server_display_color = '#1c5380',
        // Edit
        tmplt = {
            room: [
                '<li data-roomId="${room}">',
                    '<span class="icon"></span> ${room}',
                '</li>'
            ].join(""),
            client: [
                '<li data-clientId="${clientId}" class="cf">',
                    '<div class="fl clientName"><span class="icon"></span> ${nickname}</div>',
                    '<div class="fr composing"></div>',
                '</li>'
            ].join(""),
            message: [
                '<li class="cf">',
                    '<div class="fl sender">${sender}: </div><div class="fl text">${text}</div><div class="fr time">${time}</div>',
                '</li>'
            ].join("")
        };

    function bind_DOM_Events(){
        
        $('.chat-input input').on('keydown', function(e){
            var key = e.which || e.keyCode;
            if(key == 13) { handleMessage(); }
        });

        $('.chat-submit button').on('click', function(){
            handleMessage();
        });

        $('#addroom-popup .input input').on('keydown', function(e){
            var key = e.which || e.keyCode;
            if(key == 13) { createRoom(); }
        });

        $('#addroom-popup .create').on('click', function(){
            createRoom();
        });

        $('.chat-rooms .title-button').on('click', function(){
            $('#addroom-popup .input input').val('');
            window.setTimeout(function(){
                $('#addroom-popup .input input').focus();
            },100);
        });

        $('.chat-rooms ul').on('scroll', function(){
            $('.chat-rooms ul li.selected').css('top', $(this).scrollTop());
        });

        $('.chat-messages').on('scroll', function(){
            var self = this;
            window.setTimeout(function(){
                if($(self).scrollTop() + $(self).height() < $(self).find('ul').height()){
                    $(self).addClass('scroll');
                } else {
                    $(self).removeClass('scroll');
                }
            }, 50);
        });

        $('.chat-rooms ul li').live('click', function(){
            var room = $(this).attr('data-roomId');
            if(room != current_room){
                socket.emit('unsubscribe', { room: current_room });
                socket.emit('subscribe', { room: room });
            }
        });
    }

    function bindSocketEvents(){
        socket.on('connect', function(){
            socket.emit('connect', { nickname: nickname });
        });
        
        socket.on('ready', function(data){
            $('.chat-shadow').animate({ 'opacity': 0 }, 200, function(){
                $(this).hide();
                $('.chat input').focus();
            });
            clientId = data.clientId;
        });

        socket.on('roomslist', function(data){
            for(var i = 0, len = data.rooms.length; i < len; i++){
                if(data.rooms[i] != ''){
                    addRoom(data.rooms[i], false);
                }
            }
        });

        socket.on('chatmessage', function(data){
            var nickname = data.client.nickname;
            var message = data.message;
            insertMessage(nickname, message, true, false, false);
        });
        
        socket.on('roomclients', function(data){
            addRoom(data.room, false);
            setCurrentRoom(data.room);
            insertMessage(server_display_name, 'Welcome to the room: `' + data.room + '`... enjoy!', true, false, true);
            $('.chat-clients ul').empty();
            addClient({ nickname: nickname, clientId: clientId }, false, true);
            for(var i = 0, len = data.clients.length; i < len; i++){
                if(data.clients[i]){
                    addClient(data.clients[i], false);
                }
            }

            $('.chat-shadow').animate({ 'opacity': 0 }, 200, function(){
                $(this).hide();
                $('.chat input').focus();
            });
        });
        
        socket.on('addroom', function(data){
            addRoom(data.room, true);
        });
        
        socket.on('removeroom', function(data){
            removeRoom(data.room, true);
        });
        
        socket.on('presence', function(data){
            if(data.state == 'online'){
                addClient(data.client, true);
            } else if(data.state == 'offline'){
                removeClient(data.client, true);
            }
        });
    }

    function addRoom(name, announce){
        name = name.replace('/','');
        if($('.chat-rooms ul li[data-roomId="' + name + '"]').length == 0){
        // Edit
            $.tmpl(tmplt.room, { room: name }).appendTo('.chat-rooms ul');
            if(announce){
                insertMessage(server_display_name, 'The room `' + name + '` created...', true, false, true);
            }
        }
    }

    function removeRoom(name, announce){
        $('.chat-rooms ul li[data-roomId="' + name + '"]').remove();
        if(announce){
            insertMessage(server_display_name, 'The room `' + name + '` destroyed...', true, false, true);
        }
    }

    function addClient(client, announce, isMe){
        // Edit
        var $html = $.tmpl(tmplt.client, client);
        if(isMe){
            $html.addClass('me');
        }

        if(announce){
            insertMessage(server_display_name, client.nickname + ' has joined the room...', true, false, true);
        }
        $html.appendTo('.chat-clients ul')
    }

    function removeClient(client, announce){
        $('.chat-clients ul li[data-clientId="' + client.clientId + '"]').remove();
        if(announce){
            insertMessage(server_display_name, client.nickname + ' has left the room...', true, false, true);
        }
    }

    function createRoom(){
        var room = $('#addroom-popup .input input').val().trim();
        if(room && room.length <= ROOM_MAX_LENGTH && room != current_room){
            $('.chat-shadow').show().find('.content').html('Creating room: ' + room + '...');
            $('.chat-shadow').animate({ 'opacity': 1 }, 200);
            socket.emit('unsubscribe', { room: current_room });
            socket.emit('subscribe', { room: room });
        } else {
            $('#addroom-popup .input input').val('');
        }
    }

    function setCurrentRoom(room){
        current_room = room;
        $('.chat-rooms ul li.selected').removeClass('selected');
        $('.chat-rooms ul li[data-roomId="' + room + '"]').addClass('selected');
    }

    function handleMessage(){
        var message = $('.chat-input input').val().trim();
        if(message){
            socket.emit('chatmessage', { message: message, room: current_room });
            insertMessage(nickname, message, true, true);
            $('.chat-input input').val('');
        }
    }

    function insertMessage(sender, message, showTime, isMe, isServer){
        // Edit
        var $html = $.tmpl(tmplt.message, {
            sender: sender,
            text: message,
            time: showTime ? getTime() : ''
        });
        if(isMe){
            $html.addClass('marker');
        }
        if(isServer){
            $html.find('.sender').css('color', server_display_color);
        }
        $html.appendTo('.chat-messages ul');
        $('.chat-messages').animate({ scrollTop: $('.chat-messages ul').height() }, 100);
    }

    function getTime(){
        var date = new Date();
        return (date.getHours() < 10 ? '0' + date.getHours().toString() : date.getHours()) + ':' +
                (date.getMinutes() < 10 ? '0' + date.getMinutes().toString() : date.getMinutes());
    }

    function connect(){
        $('.chat-shadow .content').html('Connecting...');
        socket = io.connect(server_address);
        bindSocketEvents();
    }

    bind_DOM_Events();

});
