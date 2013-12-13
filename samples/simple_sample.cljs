(let [$div js/Appify/templates/$div
	  $a js/Appify/templates/$a
	  $attr js/Appify/templates/$attr
	  $event js/Appify/templates/$event]

	(js/Appify (fn [route render transition]

  		(route (fn [next details]
  			(next details)))
  		
  		(route 'index' (fn [renderer details]
  			(renderer 'index' details)))
  		
  		(route 'other' (fn [renderer details]
  			(renderer 'other' details)))
  		
  		(render (fn [$outlet details]
  			($div ($attr 'class' 'application') 
  				($outlet details))))
  		
  		(render 'index' (fn [details]
  			($div ($attr 'class' 'home') 
  				($div 'Home Page') 
  				($event ($a 'Go to Other Page') 'click' (fn []
  					(transition 'other'))))))

  		(render 'other' (fn [details]
  			($div ($attr 'class' 'other')
  				($div 'Other Page')
  				($event ($a 'Go to Home Page') 'click' (fn []
  					(transition 'index')))))))))
