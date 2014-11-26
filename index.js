var users = {};

/*
need access to user
message.id = i;
RTC.emit(i,message)
*/

methods.add({
  "RTC-user": UserEnter
})

function UserEnter(message,call_ob,next){
  if(call_ob.id in users){
    return Command(message,users[call_ob.id]);
  }
  call_ob.user.on("close", function(){
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
    user[i].send(void(0),message)
  }
}


function Command (message,user){
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
    return user.send(new Error("cannot send to self"));
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
    return user.send(new Error("cannot offer to a nonexistant user"));
  }
  if(message.identity == user.id){
    return user.send(new Error("cannot send to self"));
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
    return user.send(new Error("cannot offer to a nonexistant user"));
  }
  if(message.identity == user.id){
    return user.send(new Error("cannot send to self"));
  }
  if(users.connections.indexOf(message.identity) == -1){
    return user.send(new Error("are not connected to that user"));
  }
  var oid = message.identity;
  message.identity = user.id;
  users[oid].send(void(0),message);
};
