export const demoPlan={
  width:18,
  depth:9,
  origin:[-9,-4.5],
  units:'metres',
  disclaimer:'Fictional concept model for demonstration only. Dimensions, rooms and systems are illustrative.'
};

export const demoRooms=[
  {id:'entry',title:'Entry',x:-8.4,z:-4.1,width:3.2,depth:3.1},
  {id:'living',title:'Living room',x:-5.2,z:-4.1,width:6.0,depth:5.0},
  {id:'kitchen',title:'Kitchen',x:0.8,z:-4.1,width:4.9,depth:5.0},
  {id:'utility',title:'Utility',x:5.7,z:-4.1,width:2.7,depth:3.1},
  {id:'bath',title:'Bath',x:5.7,z:-1.0,width:2.7,depth:2.0},
  {id:'bedroom',title:'Bedroom',x:0.8,z:0.9,width:7.6,depth:3.2},
  {id:'studio',title:'Studio',x:-8.4,z:0.9,width:9.2,depth:3.2}
];

export const demoRoutes=[
  {id:'toilet-drain',title:'Toilet drain',category:'plumbing',room:'bath',color:'#d7773d',points:[[6.8,.45,-.25],[6.8,.25,-2.8],[10,.15,-2.8]],description:'Illustrative drain route from the bath fixture to a conceptual site connection.'},
  {id:'kitchen-outlet',title:'Kitchen outlet',category:'electrical',room:'kitchen',color:'#e5b83f',points:[[2.2,1.05,-3.98],[2.2,2.35,-3.98],[5.3,2.35,-3.98]],description:'Illustrative outlet and cable route for wayfinding.'},
  {id:'hvac-supply',title:'HVAC supply',category:'hvac',room:'living',color:'#5c9ca4',points:[[-2.3,2.7,-.8],[-2.3,2.7,2.2],[3.4,2.7,2.2]],description:'Illustrative supply run from a fictional mechanical zone.'},
  {id:'septic-tank',title:'Concept septic tank',category:'drainage',room:'site',color:'#8c7654',points:[[10,.1,-2.8],[13,.1,-2.8]],description:'Conceptual underground service marker. No site survey or construction information is implied.'}
];

export const demoSources=[
  {id:'concept-plan',title:'Concept floor plan',kind:'illustrative',note:'A fictional room arrangement used only for this public interaction demo.'},
  {id:'systems-overlay',title:'Systems overlay',kind:'schematic',note:'Routes demonstrate the finder interface and are not installation guidance.'}
];
