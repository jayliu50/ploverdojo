jsPlumb.bind("ready", function() {
  jsPlumb.importDefaults({
    Anchors : [["Perimeter", {shape:"rectangle"}], ["Perimeter", {shape:"rectangle"}]],
    Connector : "StateMachine"
  });

  
  // make everything draggable
	jsPlumb.draggable($(".topic"));

  var paintStyleStrongConnection = {lineWidth:3, strokeStyle:'rgba(98, 98, 98, 0.618)'}
  var paintStyleWeakConnection = {lineWidth:2, strokeStyle:'rgba(158,158,158,0.382)', "dashstyle":"2 3"}
  
  var endpointStyleStrongConnection = {fillStyle:'rgba(98, 98, 98, 0.618)', radius:6}
  var endpointStyleWeakConnection = {fillStyle:'rgba(158,158,158,0.382)', radius:4}
  
  // connections from kbd_layout
  jsPlumb.connect({
	  source:"kbd_layout",
	  target:"alph",
	  endpointStyle:endpointStyleStrongConnection,
    paintStyle:paintStyleStrongConnection,
  });
  
  jsPlumb.connect({
	  source:"kbd_layout",
	  target:"core",
	  endpointStyle:endpointStyleWeakConnection,
    paintStyle:paintStyleWeakConnection,
  });
  
  jsPlumb.connect({
	  source:"kbd_layout",
	  target:"except",
	  endpointStyle:endpointStyleStrongConnection,
    paintStyle:paintStyleStrongConnection,
  });
  
  jsPlumb.connect({
	  source:"kbd_layout",
	  target:"phon_to_chords",
	  endpointStyle:endpointStyleStrongConnection,
    paintStyle:paintStyleStrongConnection,
  });
  
  jsPlumb.connect({
	  source:"kbd_layout",
	  target:"read",
	  endpointStyle:endpointStyleWeakConnection,
    paintStyle:paintStyleWeakConnection,
  });
  
  jsPlumb.connect({
	  source:"kbd_layout",
	  target:"there_are_phonemes",
	  endpointStyle:endpointStyleStrongConnection,
    paintStyle:paintStyleStrongConnection,
  });
  
  
  // connections from alph not already from kbd_layout
  jsPlumb.connect({
	  source:"alph",
	  target:"ec",
	  endpointStyle:endpointStyleStrongConnection,
    paintStyle:paintStyleStrongConnection,
  });
  
  jsPlumb.connect({
	  source:"alph",
	  target:"there_are_phonemes",
	  endpointStyle:endpointStyleStrongConnection,
    paintStyle:paintStyleStrongConnection,
  });
  
  
  // connections from ec not already from kbd_layout and alph
  jsPlumb.connect({
	  source:"ec",
	  target:"cust",
	  endpointStyle:endpointStyleWeakConnection,
    paintStyle:paintStyleWeakConnection,
  });
  
  jsPlumb.connect({
	  source:"ec",
	  target:"core",
	  endpointStyle:endpointStyleWeakConnection,
    paintStyle:paintStyleWeakConnection,
  });
  
  jsPlumb.connect({
	  source:"ec",
	  target:"except",
	  endpointStyle:endpointStyleStrongConnection,
    paintStyle:paintStyleStrongConnection,
  });
  
  jsPlumb.connect({
	  source:"ec",
	  target:"phon_to_chords",
	  endpointStyle:endpointStyleStrongConnection,
    paintStyle:paintStyleStrongConnection,
  });
  
  jsPlumb.connect({
	  source:"ec",
	  target:"there_are_phonemes",
	  endpointStyle:endpointStyleWeakConnection,
    paintStyle:paintStyleWeakConnection,
  });
  
  
  // connections from cust not already from kbd_layout, alph, and ec
  jsPlumb.connect({
	  source:"cust",
	  target:"core",
	  endpointStyle:endpointStyleStrongConnection,
    paintStyle:paintStyleStrongConnection,
  });
  
  jsPlumb.connect({
	  source:"cust",
	  target:"except",
	  endpointStyle:endpointStyleStrongConnection,
    paintStyle:paintStyleStrongConnection,
  });
  
  jsPlumb.connect({
	  source:"cust",
	  target:"phon_to_chords",
	  endpointStyle:endpointStyleStrongConnection,
    paintStyle:paintStyleStrongConnection,
  });
  
  jsPlumb.connect({
	  source:"cust",
	  target:"read",
	  endpointStyle:endpointStyleWeakConnection,
    paintStyle:paintStyleWeakConnection,
  });
  
  jsPlumb.connect({
	  source:"cust",
	  target:"there_are_phonemes",
	  endpointStyle:endpointStyleStrongConnection,
    paintStyle:paintStyleStrongConnection,
  });
  
  
  // connections from core not already from kbd_layout, alph, ec, and cust
  jsPlumb.connect({
	  source:"core",
	  target:"except",
	  endpointStyle:endpointStyleStrongConnection,
    paintStyle:paintStyleStrongConnection,
  });
  
  jsPlumb.connect({
	  source:"core",
	  target:"phon_to_chords",
	  endpointStyle:endpointStyleStrongConnection,
    paintStyle:paintStyleStrongConnection,
  });
  
  jsPlumb.connect({
	  source:"core",
	  target:"read",
	  endpointStyle:endpointStyleWeakConnection,
    paintStyle:paintStyleWeakConnection,
  });
  
  jsPlumb.connect({
	  source:"core",
	  target:"there_are_phonemes",
	  endpointStyle:endpointStyleStrongConnection,
    paintStyle:paintStyleStrongConnection,
  });
  
  
  // connections from except not already from kbd_layout, alph, ec, cust, and core
  jsPlumb.connect({
	  source:"except",
	  target:"phon_to_chords",
	  endpointStyle:endpointStyleStrongConnection,
    paintStyle:paintStyleStrongConnection,
  });
  
  jsPlumb.connect({
	  source:"except",
	  target:"there_are_phonemes",
	  endpointStyle:endpointStyleStrongConnection,
    paintStyle:paintStyleStrongConnection,
  });
  
  
  // connections from phon_to_chords not already from kbd_layout, alph, ec, cust, core, and except
  jsPlumb.connect({
	  source:"phon_to_chords",
	  target:"read",
	  endpointStyle:endpointStyleStrongConnection,
    paintStyle:paintStyleStrongConnection,
  });
  
  jsPlumb.connect({
	  source:"phon_to_chords",
	  target:"there_are_phonemes",
	  endpointStyle:endpointStyleStrongConnection,
    paintStyle:paintStyleStrongConnection,
  });
});