let
	start_time,
	first_chunk_arrived

function
start(){
	start_time
	=
	performance
	.now()
}

function
end(
	message,
	
	indent
	=
	false
){
	indent
	=
	indent
	?
	'\t'
	:
	''
	
	print(
		indent
		+
		message,
		
		indent
		+
		(
			(
				performance
				.now()
				-
				start_time
			)
			/
			1000
		)
		.toFixed(
			1
		)
		+
		's'
	)
}

start()

import{
	equal,
	deepEqual,
	notEqual
}
from 'assert/strict';

import{
	server,
	send_request
}
from '../../exports/send request.mjs'

import{
	print
}
from '../../exports/print.mjs'

end(
	'set up'
)

start()

equal(
	await
		send_request(
			'get all users'
		),
	
	'denied'
)

equal(
	await
		send_request(
			'new book',
			
			{
				title: 'Harry Potter',
				
				data:{
					author: 'JK Rowling',
					genre: 'fantasy'
				}
			}
		),
	
	'not logged in!'
)

equal(
	await
		send_request(
			'log in',
			
			{
				password:
				'admin'
			}
		),
	
	'admin'
)

deepEqual(
	await
		send_request(
			'get all users'
		),
	
	[]
)

equal(
	await
		send_request(
			'register',
			{
				name: "John",
				email: "john@doe.com",
				password: "123"
			}
		),
	
	'password too short!'
)

equal(
	await
		send_request(
			'register',
			{
				name: "John",
				email: "john@doe.com",
				password: "12345678"
			}
		),
	
	'success'
)

equal(
	await
		send_request(
			'new book',
			{
				title: 'Harry Potter',
				
				data:{
					author: 'JK Rowling',
					genre: 'fantasy'
				}
			}
		),
	
	'success'
)

//duplicate
equal(
	await
		send_request(
			'new book',
			{
				title: 'Harry Potter',
				
				data:{
					author: 'JK Rowling',
					genre: 'fantasy'
				}
			}
		),
	
	'this user already has this book!'
)

equal(
	await
		send_request(
			'new book',
			
			{
				title: 'The Stranger',
				
				data:{
					author: 'Albert Camus',
					genre: 'philosophical',
					status: 'want to read'
				}
			}
		),
	
	'success'
)

equal(
	await
		send_request(
			'register',
			
			{
				name: "Jane",
				email: "jane@doe.com",
				password: "12345678"
			}
		),
	
	'success'
)

equal(
	await
		send_request(
			'new book',
			{
				title: 'Of mice and men',
				
				data:{
					author: 'someone',
					genre: 'old',
					status: 'read',
				}
			}
		),
	
	'success'
)

equal(
	await
		send_request(
			'register',
			
			{
				name: "Jane",
				email: "jane@doe.com",
				password: "12345678"
			}
		),
	
	'this username already exists!'
)

equal(
	await
		send_request(
			'register',
			
			{
				name: "Joane",
				email: "jane@doe.com",
				password: "12345678"
			}
		),
	
	'this email already has an account!'
)

equal(
	await
		send_request(
			'log in',
			
			{
				name: "John",
				email: "john@doe.com",
				password: "12345678"
			}
		),
	
	'user'
)

equal(
	await
		send_request(
			'new book',
			
			{
				title:
				'Lord of the Rings',
				
				data:{
					author:
					'Tolkien',
					
					genre:
					'fantasy'
				}
			}
		),
	
	'success'
)

deepEqual(
	await
		send_request(
			'get all books'
		),
	
	[
		{
			title: 'The Stranger',
			author: 'Albert Camus',
			genre: 'philosophical',
			status: 'want to read'
		},
		{
			title: 'Harry Potter',
			author: 'JK Rowling',
			genre: 'fantasy',
			status: 'reading'
		},
		{
			title: 'Lord of the Rings',
			author: 'Tolkien',
			genre: 'fantasy',
			status: 'reading'
		}
	]
)

equal(
	await
		send_request(
			'update book',
			
			{
				title:
				'Harry Potter',
				
				data:{
					status:
					'finished'
				}
			}
		),
	
	'success'
)

deepEqual(
	await
		send_request(
			'get book',
			
			{
				title:
				'Harry Potter'
			}
		),
	
	{
		title: 'Harry Potter',
		author: 'JK Rowling',
		genre: 'fantasy',
		status: 'finished'
	}
)

equal(
	await
		send_request(
			'delete book',
			
			{
				title: 'Harry Potter'
			}
		),
	
	'success'
)

equal(
	await
		send_request(
			'get book',
			
			{
				title: 'Harry Potter'
			}
		),
	
	'this user does not have this book!'
)

equal(
	await
		send_request(
			'update book',
			
			{
				title:
				'Harry Potter'
			}
		),
	
	'this user does not have this book!'
)

equal(
	await
		send_request(
			'delete book',
			
			{
				title: 'Harry Potter'
			}
		),
	
	'this user does not have this book!'
)

equal(
	await
		send_request(
			'log in',
			
			{
				name: "Jane",
				email: "jane@doe.com",
				password: "1234"
			}
		),
	
	'password too short!'
)

equal(
	await
		send_request(
			'log in',
			
			{
				name: "Jane",
				email: "jane@doe.com",
				password: "12341234"
			}
		),
	
	'credentials incorrect'
)

equal(
	await
		send_request(
			'log in',
			
			{
				password:
				'admin'
			}
		),
	
	'admin'
)

equal(
	await
		send_request(
			'new book',
			
			{
				title: 'Of mice and men',
				
				data:{
					author: 'someone',
					genre: 'old',
				},
				
				user_name: 'jim'
			}
		),
	
	'this user does not exist!'
)

equal(
	await
		send_request(
			'delete book',
			
			{
				title: 'The Stranger',
				user_name: 'John'
			}
		),
	
	'success'
)

deepEqual(
	await
		send_request(
			'get all users'
		),
	
	[
		{
			name: "John",
			email: "john@doe.com",
			books:[
				{
					title: 'Lord of the Rings',
					author: 'Tolkien',
					genre: 'fantasy',
					status: 'reading'
				}
			]
		},
		{
			name: "Jane",
			email: "jane@doe.com",
			books:[
				{
					title: 'Of mice and men',
					author: 'someone',
					genre: 'old',
					status: 'read'
				}
			]
		}
	]
)

equal(
	await
		send_request(
			'get user',
			
			{
				name: 'Janny'
			}
		),
	
	'this user does not exist!'
)

deepEqual(
	await
		send_request(
			'get user',
			
			{
				name: 'Jane'
			}
		),
		
	{
		name: "Jane",
		email: "jane@doe.com",
		books:[
			{
				title: 'Of mice and men',
				author: 'someone',
				genre: 'old',
				status: 'read'
			}
		]
	}
)

equal(
	await
		send_request(
			'update user',
			
			{
				name:
				'John',
				
				data:
				{
					name: 'Jeane',
					email: 'jeane@yahoo.com',
					password: '88888888'
				}
			}
		),
		
	'success'
)

deepEqual(
		await
			send_request(
				'get user',
				
				{
					name: 'Jeane'
				}
			),
		
	{
		name: "Jeane",
		email: "jeane@yahoo.com",
		books:[
			{
				title: 'Lord of the Rings',
				author: 'Tolkien',
				genre: 'fantasy',
				status: 'reading'
			}
		]
	}
)

equal(
	await
		send_request(
			'get user',
			
			{
				name: 'John'
			}
		),
		
	'this user does not exist!'
)

deepEqual(
	await
		send_request(
			'get user',
			
			{
				name: 'Jane'
			}
		),
		
	{
		name: "Jane",
		email: "jane@doe.com",
		books:[
			{
				title: 'Of mice and men',
				author: 'someone',
				genre: 'old',
				status: 'read'
			}
		]
	}
)

equal(
	await
		send_request(
			'delete user',
			
			{
				name: 'Jane'
			}
		),
		
	'success'
)

equal(
	await
		send_request(
			'delete user',
			
			{
				name: 'Jane'
			}
		),
		
	'this user does not exist!'
)

equal(
	await
		send_request(
			'get user',
			
			{
				name: 'Jane'
			}
		),
		
	'this user does not exist!'
)

equal(
	await
		send_request(
			'update user',
			
			{
				name:
				'Jeane',
				
				data:
				{
					email:
					'jeane@hotmail.com'
				}
			}
		),
		
	'success'
)

deepEqual(
		await
			send_request(
				'get user',
				
				{
					name: 'Jeane'
				}
			),
		
	{
		name: "Jeane",
		email: "jeane@hotmail.com",
		books:[
			{
				title: 'Lord of the Rings',
				author: 'Tolkien',
				genre: 'fantasy',
				status: 'reading'
			}
		]
	}
)

equal(
	await
		send_request(
			'log in',
			
			{
				name:
				'Jeane',	
				
				password:
				'88888888'
			}
		),
	
	'user'
)

equal(
	await
		send_request(
			'new book',
			
			{
				title:
				'The old man and the sea',
				
				data:
				{
					author: 'ernest hemingway',
					genre: 'philosophical',
					status: 'completed',
				}
			}
		),
	
	'success'
)

end(
	'crud tests'
)

let
ai_response

server
.on(
	'ai chunk',
	
	function(
		chunk
	){
		if(
			!
			first_chunk_arrived
		){
			end(
				'first chunk',
				true
			)
			
			first_chunk_arrived
			=
			true
		}
		
		ai_response
		+=
		chunk
	}
)

let
old_start
=
start

start
=
function(
	message
){
	print(
		message
	)
	
	first_chunk_arrived
	=
	false
	
	old_start()
}

async function
ai_test(
	test_name,
	query,
	expected_response
){
	ai_response
	=
	''
	
	start(
		test_name
	)
	
	equal(
		await
			send_request(
				'ai',
				
				{
					query
				}
			),
		
		'success!'
	)
	
	if(
		expected_response
	){
		equal(
			ai_response,
			expected_response
		)	
	}
	//uncomment for debugging
	// else{
	// 	print(
	// 		ai_response
	// 	)
	// }
	
	end(
		'last chunk',
		true
	)
}

await
	ai_test(
		'basic ai test:',
		'Respond only with the title of the first book',
		'Lord of the Rings'
	)
	
await
	ai_test(
		'ai memory persistence test:',
		'Give the same response as before, but in all caps',
		'LORD OF THE RINGS'
	)

await
	ai_test(
		'long ai response test',
		'What books would you recommend me?'
	)

await
	send_request(
		'register',
		
		{
			name:
			'Sarah',
			
			email:
			'sarah@email.com',
			
			password:
			'strong password'
		}
	)

await
	send_request(
		'log in',
		
		{
			password:
			'admin'
		}
	)

await
	ai_test(
		'admin ai test',
		'Respond only with the number of users',
		'2'
	)

print(
	'all tests passed'
)

server
.disconnect()