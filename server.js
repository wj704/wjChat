var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server), //引入socket.io模块并绑定到服务器
    users = [];
//specify the html we will use
app.use('/', express.static(__dirname + '/www'));
//bind the server to the 3000 port
//server.listen(3000);//for local test
server.listen(3000);//publish to heroku
//server.listen(process.env.OPENSHIFT_NODEJS_PORT || 3000);//publish to openshift
console.log('server started on port'+3000);

//socket部分
io.on('connection', function(socket) { //在connection事件的回调函数中，socket表示的是当前连接到服务器的那个客户端
    //昵称设置,login事件响应
    socket.on('login', function(nickname){
         if (users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');
        } else {
            socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            io.sockets.emit('system', nickname,users.length,'login'); //向所有连接到服务器的客户端发送当前登陆用户的昵称 
        } //else结束						
    });
	
	//断开连接的事件
    socket.on('disconnect', function() {
    //将断开连接的用户从users中删除
    users.splice(socket.userIndex, 1);
    //通知除自己以外的所有人
    socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
    });
	
	//接收新消息
    socket.on('postMsg', function(msg) {
        //将消息发送到除自己外的所有用户
        socket.broadcast.emit('newMsg', socket.nickname, msg);
    });
	
	 //接收用户发来的图片
    socket.on('img', function(imgData) {
    //通过一个newImg事件分发到除自己外的每个用户
     socket.broadcast.emit('newImg', socket.nickname, imgData);
    });
	
	
});