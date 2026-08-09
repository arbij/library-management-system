(
	await
		import(
			'dotenv'
		)
)
.config({
	path:
	'../.env',
	
	quiet:
	true
})

import
bcrypt
from
'bcrypt'

import{
	print
}
from
'../exports/print.mjs'

let
ai_model=
	(
		await
			import(
				'@ai-sdk/openai-compatible'
			)
	)
	.createOpenAICompatible({
		name:
		'zen',
		
		baseURL:
		'https://opencode.ai/zen/v1',
		
		apiKey:
		'public'
	})(
		'mimo-v2.5-free'
	)

async function
prompt_ai(
	ai_session,
	text
){
	ai_session
	.push({
		role:
		'user',
		
		content:
		text
	})
	
	let{
		text:
		result
	}
	=
		await
			(
				await
					import(
						'ai'
					)
			)
			.generateText({
				model:
				ai_model,
				
				messages:
				ai_session
			})
	
	ai_session
	.push({
		role:
		'assistant',
		
		content:
		result
	})
	
	return(
		result
	)
}

let
database=
	process
	.env
	.database

let
testing=
	database
	===
	'file:./databases/test/.db'

let
prisma=
	new
		(
			await
				import(
					'../databases/'
					+
						(
							testing
							?
							'test'
							:
							'prod'
						)
					+
					'/prisma/generated/client.js'
				)
		)
		.PrismaClient
	({
		adapter:
			new
				(
					await
						import(
							'@prisma/adapter-better-sqlite3'
						)
				)
				.PrismaBetterSqlite3
			({
				url:
					database
					.replace(
						'file:.',
						'..'
					),
				
				//lazy
				fileMustExist:
				true
			})
	})

//throw if db does not exist
await
	prisma
	.$queryRaw
	`select 1`

let
get_file

{
	let
	files=
		{
			client:
			'../client/.html',
			
			'reset localstorage':
			'../client/reset localstorage/.html',
			
			script:
			'../client/.mjs',
			
			print:
			'../exports/print.mjs',
			
			'send request':
			'../exports/send request.mjs'
		}
	
	let{
		readFileSync
	}
	=
		await
			import(
				'fs'
			)
	
	if(
		testing
	){
		//hot reload while testing for developer ease
		get_file
		=
		function(
			file
		){
			return(
				readFileSync(
					files[
						file
					]
				)
			)
		}
	}
	else{
		//load only once during prod for performance
		for(
			let
			file
			in
			files
		){
			files[
				file
			]
			=
			readFileSync(
				files[
					file
				]
			)
		}
		
		get_file
		=
		function(
			file
		){
			return(
				files[
					file
				]
			)
		}
	}
}

new
	(
		await
			import(
				'socket.io'
			)
	)
	.Server
(
	(
		await
			import(
				'http'
			)
	)
	.createServer(
		function(
			request,
			response
		){
			let
			file=
				decodeURIComponent(
					request
					.url
				)
				.slice(
					1
				)
			
			function
			respond(
				result
			){
				response
				.end(
					result
				)
			}
			
			switch(
				file
			){
				case '':
					file
					=
					'client'
				
				case 'reset localstorage':
					response
					.setHeader(
						'Content-Type',
						'text/html'
					)
				break
				
				case 'print':
				case 'send request':
				case 'script':
					response
					.setHeader(
						'Content-Type',
						'application/javascript'
					)
				break
				
				default:
					respond(
						'bad request!'
					)
				return
			}
			
			respond(
				get_file(
					file
				)
			)
		}
	)
	.listen(
		testing
		?
		5001
		:
		5000
	)
)
.on(
	'connection',
	
	function(
		client
	){
		print(
			'client connected!'
		)
		
		let
			user_id,
			admin,
			ai_session
		
		client
		.on(
			'request',
			
			async function(
				request_type,
				request_data,
				respond
			){
				try{
					switch(
						request_type
					){
						case 'register':
						case 'log in':
						{	
							let{
								name,
								email,
								password
							}
							=
							request_data
							
							if(
								password
								===
								(
									testing
									?
									'admin'
									:
									process
									.env
									.admin_password
								)
							){
								admin
								=
								true
								
								ai_session
								=
								undefined
								
								user_id
								=
								undefined
								
								respond(
									'admin'
								)
									
								return
							}
							
							if(
								password
								.length
								<
								8
							){
								respond(
									'password too short!'
								)
								return
							}
							
							let
							user=
								await
									prisma
									.users
									.findUnique({
										where:
										{
											name:
												name
												??
												''
										},
										
										select:
										{
											password: true,
											id: true
										}
									})
							
							switch(
								request_type
							){
								case 'register':
									if(
										user
									){
										respond(
											'this username already exists!'
										)
										return
									}
									
									if(
										await
											prisma
											.users
											.count({
												where:
												{
													email
												}
											})
									){
										respond(
											'this email already has an account!'
										)
										return
									}
									
									user_id
									=
										(
											await
												prisma
												.users
												.create({
													data:
													{
														name,
														email,
														
														password:
															await
																bcrypt
																.hash(
																	password,
																	10
																)
													},
													
													select:
													{
														id: true
													}
												})
										)
										.id
									
									admin
									=
									false
									
									ai_session
									=
									undefined
									
									respond(
										'success'
									)
									return
								
								case
								'log in':
									let
									success
									=
										user
										&&
											await
												bcrypt
												.compare(
													password,
													
													user
													.password
												)
									
									if(
										success
									){
										user_id
										=
											user
											.id
										
										admin
										=
										false
										
										ai_session
										=
										undefined
										
										respond(
											'user'
										)
										return
									}
									
									respond(
										'credentials incorrect'
									)
									return
							}
						}
						
						case 'log out':
							admin
							=
								user_id
								=
								undefined
							
							respond(
								'success'
							)
							return
						
						case 'get all users':
						case 'get user':
						case 'update user':
						case 'delete user':
							if(
								!
								admin
							){
								respond(
									'denied'
								)
								return
							}
							
							if(
								request_type
								===
								'get all users'
							){
								respond(
									await
										prisma
										.users
										.findMany({
											select:
											{
												name: true,
												email: true,
												
												books:
												{
													omit:
													{
														id: true,
														user_id: true
													}
												}
											}
										})
								)
								return
							}
							
							let{
								name,
								data
							}
							=
							request_data
							
							let
							user=
								await
									prisma
									.users
									.findUnique({
										where:
										{
											name
										},
										
										select:
										{
											name: true,
											email: true,
											
											books:
											{
												omit:
												{
													id: true,
													user_id: true
												}
											}
										}
									})
							
							if(
								!
								user
							){
								respond(
									'this user does not exist!'
								)
								return
							}
							
							switch(
								request_type
							){
								case 'get user':
									respond(
										user
									)
									return
								
								case 'delete user':
									await
										prisma
										.users
										.delete({
											where:
											{
												name
											}
										})
										
									respond(
										'success'
									)
									return
								
								case 'update user':
									let{
										password	
									}
									=
									data
									
									if(
										!
										(
											password
											===
											undefined
										)
									){	
										if(
											password
											.length
											<
											8
										){
											respond(
												'password too short!'
											)
										}
										
										data
										.password
										=
											await
												bcrypt
												.hash(
													password,
													10
												)
									}
									
									await
										prisma
										.users
										.update({
											where:
											{
												name
											},
											
											data
										})
										
									respond(
										'success'
									)
									return
							}
						
						case 'new book':
						case 'delete book':
						case 'get all books':
						case 'get book':
						case 'update book':
						{
							if(
								admin
							){
								user_id
								=
									(
										await
											prisma
											.users
											.findUnique({
												where:
												{
													name:
														request_data
														.user_name
												},
												
												select:
												{
													id: true
												}
											})
									)
									?.id
								
								if(
									!
									user_id
								){
									respond(
										'this user does not exist!'
									)
									return
								}
							}
							
							if(
								!
								user_id
							){
								respond(
									'not logged in!'
								)
								return
							}
							
							if(
								request_type
								===
								'get all books'
							){
								respond(
									await
										prisma
										.books
										.findMany({
											where:
											{
												user_id
											},
											
											orderBy:
											{
												genre: 'desc'
											},
											
											omit:
											{
												id: true,
												user_id: true
											}
										})
								)
								return
							}
							
							let{
								title,
								data
							}
							=
							request_data
							
							let
							book
							=
								await
									prisma
									.books
									.findFirst({
										where:
										{
											user_id,
											title
										},
										
										omit:
										{
											id: true,
											user_id: true
										}
									})
							
							if(
								book
							){
								switch(
									request_type
								){
									case 'new book':
										respond(
											'this user already has this book!'
										)
										return
									
									case 'get book':
										respond(
											book
										)
										return
									
									case 'delete book':
										await
											prisma
											.books
											.deleteMany({
												where:{
													user_id,
													title
												}
											})
										
										respond(
											'success'
										)
										return
									
									case 'update book':
										await
											prisma
											.books
											.updateMany({
												where:{
													user_id,
													title
												},
												
												data
											})
										
										respond(
											'success'
										)
								}
							}
							
							if(
								request_type
								===
								'new book'
							){
								await
									prisma
									.books
									.create({
										data:{
											...
											data,
											
											title,
											
											user_id
										}
									})
								
								respond(
									'success'
								)
								return
							}
							
							respond(
								'this user does not have this book!'
							)
							return
						}
						
						case 'ai':
							if(
								!
								(
									admin
									||
									user_id
								)
							){
								respond(
									'not logged in!'
								)
								return
							}
							
							let{
								query
							}
							=
							request_data
							
							if(
								ai_session
								===
								undefined
							){
								ai_session
								=
								[]
								
								query
								+=
									JSON.stringify(
										await
											prisma
											.users
											.findMany({
												where:
													admin
													?
													{}
													:
													{
														id:
														user_id
													},
												
												select:
												{
													name: true,
													email: true,
													
													books:
													{
														omit:
														{
															id: true,
															user_id: true
														}
													}
												}
											})
									)
							}
							
							respond(
								await
									prompt_ai(
										ai_session,
										query
									)
							)
							return
						
						default:
							respond(
								'bad request'
							)
					}
				}
				catch(
					error
				){
					console
					.error(
						error
					)
					
					respond(
						'something went wrong'
					)
				}
			}
		)
	}
)

print(
	(
		testing
		?
		'test '
		:
		'prod '
	)
	+
	'server ready',
	
	'connected to '
	+
	database
)