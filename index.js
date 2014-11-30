var users = {};

/*
need access to user
message.id = i;
RTC.emit(i,message)
*/
var wu;
if(typeof ForkRouter == "undefined"){
  methods.add({
    "WebRTC-Example-RTC-user": UserEnter
  })
  wu = "ws";
}else{
  methods.add({
    "RTC-user": UserEnter
  })
  wu = "user";
}

function UserEnter(message,call_ob,next){
  if(call_ob.id in users){
    return Command(message,users[call_ob.id]);
  }
  call_ob[wu].on("close", function(){
    UserLeave(call_ob.id);
  })
  users[call_ob.id] = {
    id:call_ob.id,
    info:message,
    send: next,
    offers:[],
    connections:[]
  };
  message = {cmd:"list",data:users};
  for(var i in users){
    users[i].send(void(0),message)
  }
};

function UserLeave(messageid){
  delete users[messageid];
  var message = {cmd:"list",data:users};
  for(var i in users){
    users[i].send(void(0),message)
  }
}


function Command (message,user){
  console.log("command");
	switch(message.cmd){
		case "offer": Offer(message,user); break;
		case "accept": Accept(message,user); break;
		case "ice": Ice(message,user); break;
		default: console.log(message)
	}
}

function Offer (message,user){
  if(!users[message.identity]){
    return user.send(new Error("cannot offer to a nonexistant user"));
  }
  if(message.identity == user.id){
    return user.send(new Error("cannot offer to self: "+message.identity+", "+user.id));
	}
  /*
    This is where you filter the offer
  */
  user.offers.push(message.identity)
  var oid = message.identity;
  message.identity = user.id;
  users[oid].send(void(0),message);
};

function Accept (message,user){
  console.log("accept");
  if(!users[message.identity]){
    return user.send(new Error("cannot accept to a nonexistant user"));
  }
  if(message.identity == user.id){
    return user.send(new Error("cannot accept to self: "+message.identity+", "+user.id));
  }
  var i = users[message.identity].offers.indexOf(user.id);
  if(i == -1){
    return user.send(new Error("cannot accept a user who never offered"));
  }
	var oid = message.identity;
	message.identity = user.id;
	delete users[oid].offers[i];
	users[oid].connections.push(user.id);
	users[user.id].connections.push(oid);
  users[oid].send(void(0),message);
};

function Ice (message,user){
  console.log("ice");
  if(!users[message.identity]){
    return user.send(new Error("cannot ice to a nonexistant user"));
  }
  if(message.identity == user.id){
    return user.send(new Error("cannot ice to self: "+message.identity+", "+user.id));
  }
  console.log(users[user.id].connections)
  console.log(users[message.identity].connections)
  var oid = message.identity;
  message.identity = user.id;
  users[oid].send(void(0),message);
};
