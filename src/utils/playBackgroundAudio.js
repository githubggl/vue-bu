import msg from '@/assets/audio/msg.wav'
import urgency_type_height from '@/assets/audio/new_message.mp3'
import event_urgency_normal from '@/assets/audio/msg.wav'

export default function playBackgroundAudio(source, loop, time){
  if(!source)return;
  var ua = navigator.userAgent.toLowerCase();
  var hideDiv = document.createElement("div");
  //hideDiv.className = "audio";
  hideDiv.style.display = "none";
  if(ua.match(/chrome\/([\d.]+)/)){
    loop = loop ? ' loop="loop"': '';
    hideDiv.innerHTML = '<audio autoplay="autoplay"'+loop+' src="'+source+'"><embed src="'+source+'"/></audio>';
  }else if(ua.match(/msie([\d.]+)/)){
    //hideDiv.innerHTML = '<object classid="clsid:22D6F312-B0F6-11D0-94AB-0080C74C7E95">'+
    //	'<param name="AutoStart" value="1" />'+
    //	'<param name="Src" value="'+source+'" /></object>';
    hideDiv.innerHTML = '<bgsound src="'+source+'" autostart="true" loop="'+loop+'">';
  }else{
    hideDiv.innerHTML = '<embed loop="'+loop+'" autostart="true" src="'+source+'"></embed>';
  }
  document.body.appendChild(hideDiv);
  if(time > 0)
    setTimeout(function(){
      document.body.removeChild(hideDiv);
    },time);
  return hideDiv;
}

export function playNewMessageAudio(){
  let node = playBackgroundAudio(msg, true, 0);
  return function(){
    if(node){
      node.parentNode.removeChild(node)
      node = null
    }
  }
}
const urgencys = {
  urgency_type_height,
  event_urgency_normal,
}
export function playNewEventAudio(urgency){
  const source = urgencys[urgency] || event_urgency_normal
  let node = playBackgroundAudio(source, true, 0);
  return function(){
    if(node){
      node.parentNode.removeChild(node)
      node = null
    }
  }
}
