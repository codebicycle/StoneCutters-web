window.initTracker=function(){var d={},g=[],a=[];
var b=function(){return document.cookie
};
var c=function(h){return encodeURIComponent(decodeURIComponent(h))
};
var e=function(i){try{var h=new Image();
h.src=i;
g.push(h)
}catch(j){}};
d.track=function(j){var i=j.url;
var k=j.host;
i+="?cookies="+c(b());
i+="&host="+k;
if(document.referrer){i+="&referer="+c(document.referrer)
}if(location.hash){i+="&hash="+c(location.hash)
}while(a.length){var h=a.shift();
i+="&"+h[0]+"="+c(h[1])
}i+="&t="+(new Date()).getTime();
e(i)
};
d.addVar=function(h,i){a.push([h,i])
};
var f=function(){if(!window._trq){window._trq=[]
}_trq.push=function(h){window.setTimeout(function(){h(d)
},1)
};
while(_trq.length>0){_trq.push(_trq.pop())
}};
f()
};