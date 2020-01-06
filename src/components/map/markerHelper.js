
const createMarker = (L, latlng) => {
  return L.circleMarker(latlng, {
    radius: 5,
    fill: true,
    fillColor: '#FF0000',
    fillOpacity: 1,

    weight: 2,
  });
}
const createGifMarker = (L, latlng) => {
  return L.marker(latlng, {
    icon: L.icon({
      iconUrl: '/static/images/red_glow.gif',
      iconSize: [48, 48],
      iconAnchor: [24, 24],
      popupAnchor: [0, 0],
    })
  })
}

export default function markerHelper(options){
  let map = options.map
  let L = options.L || window.L
  const markerRadius = options.markerRadius || 5
  const latlng = L.latLng(0, 0)
  let marker = options.marker || createMarker(L, latlng)
  // let gifMarker = options.gifMarker || createGifMarker(L, latlng)
  let callback = options.callback

  let circle
  let marking = false
  // let markedLatlng
  const mousemove = e => {
    if(circle){
      circle.setLatLng(e.latlng)
    }else{
      circle = L.circleMarker(e.latlng, {radius: markerRadius})
      circle.addTo(map)
    }
  };
  const click = e=>{
    const latlng = e.latlng
    // markedLatlng = {
    //   lat: latlng.lat,
    //   lng: latlng.lng,
    // }
    addLocationMarker(latlng);
    clearMarking();
    callback({
      lat: latlng.lat,
      lng: latlng.lng,
    })
  };
  const addLocationMarker = (latlng)=>{
    marker.setLatLng(latlng)
    marker.addTo(map)
  };
  const clearMarking = ()=>{
    if(circle){
      map.removeLayer(circle)
      map.off('mousemove', mousemove)
      map.off('click', click)
    }
    marking = false
  };
  const start = ()=>{
    if(!map)return
    if(marking)return
    marking = true
    map.removeLayer(marker)
    // map.removeLayer(gifMarker)
    map.on('mousemove', mousemove)
    map.on('click', click)
    circle = null
  };
  const destroy = ()=>{
    map.removeLayer(marker)
    clearMarking();
    marker = null
    map = null
    L = null
    circle = null
    callback = null
  };
  return {
    start,
    clearMarking,
    addLocationMarker,
    destroy,
  }
}
