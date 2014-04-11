var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server), //����socket.ioģ�鲢�󶨵�������
    users = [];
//specify the html we will use
app.use('/', express.static(__dirname + '/www'));
//bind the server to the 3000 port
//server.listen(3000);//for local test
server.listen(3000);//publish to heroku
//server.listen(process.env.OPENSHIFT_NODEJS_PORT || 3000);//publish to openshift
console.log('server started on port'+3000);

//socket����
io.on('connection', function(socket) { //��connection�¼��Ļص������У�socket��ʾ���ǵ�ǰ���ӵ����������Ǹ��ͻ���
    //�ǳ�����,login�¼���Ӧ
    socket.on('login', function(nickname){
         if (users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');
        } else {
            socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            io.sockets.emit('system', nickname,users.length,'login'); //���������ӵ��������Ŀͻ��˷��͵�ǰ��½�û����ǳ� 
        } //else����						
    });
	
	//�Ͽ����ӵ��¼�
    socket.on('disconnect', function() {
    //���Ͽ����ӵ��û���users��ɾ��
    users.splice(socket.userIndex, 1);
    //֪ͨ���Լ������������
    socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
    });
	
	//��������Ϣ
    socket.on('postMsg', function(msg) {
        //����Ϣ���͵����Լ���������û�
        socket.broadcast.emit('newMsg', socket.nickname, msg);
    });
	
	 //�����û�������ͼƬ
    socket.on('img', function(imgData) {
    //ͨ��һ��newImg�¼��ַ������Լ����ÿ���û�
     socket.broadcast.emit('newImg', socket.nickname, imgData);
    });
	
	
});