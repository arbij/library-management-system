import{
	print
}
from
'/print'

import{
	server,
	send_request
}
from
'/send request'

document
.body
.style
.minHeight
=
'1000px'

print(
	(
		location
		.port
		===
		'5001'
		?
		'test'
		:
		'prod'
	)
	+
	' client ready'
)

function
create_element(
	tag,
	attributes
){
	let
	element
	=
		document
		.createElement(
			tag
		)
	
	for(
		let
		key
		in
		attributes
	){
		element[
			key
		]
		=
			attributes[
				key
			]
	}
	
	return(
		element
	)
}

let
result
=
create_element(
	'pre'
)
	
server
.on(
	'ai chunk',
	
	function(
		chunk
	){
		result
		.textContent
		+=
		chunk
	}
)

async function
display(
	response
	=
	''
){
	response
	=
	await
	response
	
	if(
		typeof
		response
		===
		'object'
	){
		response
		=
			JSON
			.stringify(
				response,
				null,
				4
			)
	}
	
	result
	.innerHTML
	=
	response
}

function
append(
	...
	nodes
){
	document
	.body
	.append(
		...
		nodes
	)
}

function
br(){
	return(
		create_element(
			'br'
		)
	)
}

let
first_run
=
true

while(true){
	let
	auth_div
	=
		create_element(
			'div'
		)
	
	let
	auth_inputs
	=
	{}
	
	for(
		let
		value
		of
		[
			'name',
			'email',
			'password'
		]
	){
		auth_div
		.append(
			value
			+
			': ',
			
			auth_inputs[
				value
			]
			=
			create_element(
				'input',
				
				{
					value
					:
						localStorage[
							value
						]
						??
						''
				}
			),
			
			br()
		)
	}
	
	for(
		let
		value
		of
		[
			'email',
			'password'
		]
	){
		auth_inputs[
			value
		]
		.type
		=
		value
	}
	
	let
	auth_data
	=
	{}
	
	function
	get_auth_data(){
		auth_data
		=
		{}
		
		for(
			let
			key
			in
			auth_inputs
		){
			auth_data[
				key
			]
			=
				auth_inputs[
					key
				]
				.value
		}
		
		return(
			auth_data
		)
	}
	
	let{
		promise:
		auth,
		
		resolve:
		end_auth
	}
	=
	Promise
	.withResolvers()
	
	let
	register
	=
		create_element(
			'button',
			
			{
				innerHTML:
				'register',
				
				onclick
				:
				async function(){
					let
					response
					=
						await
							send_request(
								'register',
								
								get_auth_data()
							)
					
					switch(
						response
					){
						case 'success':
							end_auth(
								'user'
							)
						break
						
						case 'admin':
							end_auth(
								'admin'
							)
						break
						
						default:
							display(
								response
							)
					}
				}
			}
		)

	let
	log_in
	=
		create_element(
			'button',
			
			{
				innerHTML:
				'log in',
				
				onclick
				:
				async function(){
					let
					response
					=
						await
							send_request(
								'log in',
								
								get_auth_data()
							)
					
					switch(
						response
					){
						case 'user':
						case 'admin':
							end_auth(
								response
							)
							return
						
						default:
							display(
								response
							)
					}
				}
			}
		)
	
	auth_div
	.append(
		log_in,
		' (name and password)',
		br(),
		
		register,
		' (name, email, and password)'
	)
	
	let
	auth_successful
	=
	false
	
	if(
		first_run
	){
		first_run
		=
		false
		
		if(
			!
				await
					log_in
					.onclick()
		){
			append(
				auth_div,
				result
			)	
			
			display()
		}
	}
	else{
		append(
			auth_div,
			result
		)
	}
	
	let
	role
	=
		await
		auth
	
	auth_div
	.remove()
	
	display()
	
	let
	user_name
	
	let
	admin
	=
		role
		===
		'admin'
	
	let
	log_out
	=
	Promise
	.withResolvers()
	
	append(
		create_element(
			'button',
			
			{
				innerHTML:
				'log out',
				
				onclick:
					log_out
					.resolve
			}
		),
		
		br(),
		br()
	)
	
	localStorage
	.password
	=
		auth_data
		.password
	
	localStorage
	.name
	=
		admin
		?
		''
		:
			auth_data
				.name
	
	if(
		admin
	){
		append(
			create_element(
				'button',
				
				{
					innerHTML:
					'get all users',
					
					onclick(){
						display(
							send_request(
								'get all users'
							)
						)
					}
				}
			),
			
			br(),
			br()
		)
		
		user_name=
			create_element(
				'input'
			)
		
		append(
			'username: ',
			
			user_name,
			
			br(),
			
			create_element(
				'button',
				
				{
					innerHTML:
					'get user',
					
					onclick(){
						display(
							send_request(
								'get user',
								
								{
									name:
										user_name
										.value
								}
							)
						)
					}
				}
			),
			
			br(),
			
			create_element(
				'button',
				
				{
					innerHTML:
					'delete user',
					
					onclick(){
						display(
							send_request(
								'delete user',
								
								{
									name:
										user_name
										.value
								}
							)
						)
					}
				}
			),
			
			br(),
			br()
		)
		
		let
		user_data
		=
		{}
		
		for(
			let
			key
			of
			[
				'name',
				'email',
				'password'
			]
		){
			append(
				key
				===
				'name'
				?
				'new name'
				:
				key,
				
				': ',
				
				user_data[
					key
				]
				=
					create_element(
						'input'
					),
				
				br()
			)
		}
		
		append(
			create_element(
				'button',
				
				{
					innerHTML:
					'update a user',
					
					onclick(){
						let
						new_data
						=
						{}
						
						for(
							let
							key
							in
							user_data
						){
							if(
								user_data[
									key
								]
								.value
								!==
								''
							){
								new_data[
									key
								]
								=
								user_data[
									key
								]
								.value
							}		
						}
						
						display(
							send_request(
								'update user',
								
								{
									name:
										user_name
										.value,
									
									data:
									new_data
								}
							)
						)
					}
				}
			),
			
			' (also insert username) (empty values aren\'t used)',
			
			br()
		)
	}

	append(
		create_element(
			'button',
			
			{
				innerHTML:
				'get all books',
				
				onclick(){
					display(
						send_request(
							'get all books',
							
							{
								user_name:
									user_name
									?.value
							}
						)
					)
				}
			}
		),
		
		admin
		?
		' (also insert username)'
		:
		'',
		
		br(),
		br()
	)
	
	let
	book_title
	=
		create_element(
			'input'
		)
	
	append(
		'book title: ',
		
		book_title,
		
		br(),
		
		create_element(
			'button',
			
			{
				innerHTML:
				'get book',
				
				onclick(){
					display(
						send_request(
							'get book',
							
							{
								title:
									book_title
									.value,
								
								user_name:
									user_name
									?.value
							}
						)
					)
				}
			}
		),
		
		br(),
		
		create_element(
			'button',
			
			{
				innerHTML: 'delete book',
				
				onclick(){
					display(
						send_request(
							'delete book',
							
							{
								title:
									book_title
									.value,
									
								user_name:
									user_name
									?.value
							}
						)
					)
				}
			}
		),
		
		br(),
		br()
	)

	let
	book_data=
	{}

	for(
		let
		key
		of
			[
				'title',
				'author',
				'genre',
				'status'
			]
	){
		append(
			key
			===
			'title'
			?
			'new title'
			:
			key,
			
			': ',
			
			book_data[
				key
			]
			=
				create_element(
					'input'
				),
			
			br()
		)
	}

	function
	get_book_data(){
		let
		result
		=
		{}
		
		for(
			let
			key
			in
			book_data
		){
			result[
				key
			]
			=
				book_data[
					key
				]
				.value
		}
		
		return(
			result
		)
	}

	append(
		create_element(
			'button',
			
			{
				innerHTML:
				'new book',
				
				onclick(){
					let
					new_data
					=
					{}
					
					for(
						let
						key
						in
						book_data
					){
						new_data[
							key
						]
						=
						book_data[
							key
						]
						.value
					}
					
					let{
						title
					}
					=
					new_data
					
					delete
						new_data
						.title
					
					display(
						send_request(
							'new book',
							
							{
								title,
								
								data:
								new_data,
								
								user_name:
									user_name
									?.value
							}
						)
					)
				}
			}
		),
		
		br()
	)

	append(
		create_element(
			'button',
			
			{
				innerHTML:
				'update book',
				
				onclick(){
					let
					new_data
					=
					{}
					
					for(
						let
						key
						in
						book_data
					){
						if(
							book_data[
								key
							]
							.value
							!==
							''
						){
							new_data[
								key
							]
							=
							book_data[
								key
							]
							.value
						}		
					}
					
					display(
						send_request(
							'update book',
							
							{
								title:
									book_title
									.value,
								
								data:
								new_data,
								
								user_name:
									user_name
									?.value
							}
						)
					)
				}
			}
		),
		
		' (also insert book title) (empty values aren\'t used)',
		
		br(),
		br()
	)

	let
	ai_query
	=
		create_element(
			'input',
			
			{
				size:
				100
			}
		)

	append(
		ai_query,
		
		br(),
		
		' ',
		
		create_element(
			'button',
			
			{
				innerHTML:
				'ask ai',
				
				onclick
				:
				async function(){
					let
					query
					=
						ai_query
						.value
					
					if(
						query
						===
						''
					){
						display(
							'query can\'t be empty!'
						)
						return
					}
					
					display()
					
					let
					response
					=
					await
						send_request(
							'ai',
							
							{
								query
							}
						)
					
					if(
						response
						!==
						'success!'
					){
						display(
							response
						)
					}
				}
			}
		),
		
		' (might take a few seconds, please be patient!) (remembers past messages in the same session!)'
	)
	
	result
	.style
	.whiteSpace
	=
	'pre-wrap'
	
	append(
		result
	)
	
	await
		log_out
		.promise
	
	display()
	
	document
	.body
	.innerHTML
	=
	''
	
	server
	.disconnect()
	.connect()
}