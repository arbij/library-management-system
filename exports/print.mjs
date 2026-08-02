export
	function
	print(
		...strings
	){
		let
		node=
			typeof
			window
			===
			'undefined'
		
		for(
			let string
			of strings
		){
			if(
				node
			){
				console
				.dir(
					string,
					
					{
						depth:
						null
					}
				)
			}
			else{
				console
				.log(
					string
				)
			}
		}
		
		console
		.log()
	}