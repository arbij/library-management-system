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

// import{
// 	createOpencode
// }
// from
// '@opencode-ai/sdk'

let
ai_client
=
	(
		await
			(
				await
					import(
						'@opencode-ai/sdk'
					)
			)
			.createOpencode()
	)
	.client
	
async function
prompt(
	session_id,
	text
){
	let
	response=
		await
			ai_client
			.session
			.prompt({
				path:{
					id:
					session_id
				},
				
				body:{
					model:{
						providerID:
						'opencode',
						
						modelID:
						'deepseek-v4-flash-free',
						
						options:{
							reasoningEffort:
							'high'
						}
					},
					
					parts:[
						{
							type:
							'text',
							
							text
						}
					],
				},
			});
	
	let
	result=
	''
	
	for(
		let
		part
		of
			response
			.data
			.parts
	){
		if(
			part
			.type
			===
			'text'
		){
			result
			+=
				part
				.text
		}
	}
	
	return(
		result
	)
}

let
database
=
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
				
				fileMustExist:
				true
			})
	})

//check if db exists
await
	prisma
	.$queryRaw
	`select 1`

let
access_files
=
{}

{
	let
	files
	=
		{
			client:
			'../client/.html',
			
			reset_localstorage:
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
	
	for(
		let key
		in files
	){
		let
		file
		=
			files[
				key
			]
		
		//hot reload while testing for developer ease
		if(
			testing
		){
			access_files[
				key
			]
			=
				function(){
					return(
						readFileSync(
							file
						)
					)
				}
		}
		//load once during prod for performance
		else{
			files[
				key
			]
			=
				readFileSync(
					file
				)
			
			access_files[
				key
			]
			=
				function(){
					return(
						files[
							key
						]
					)
				}
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
	.Server(
		(
			await
				import(
					'http'
				)
		)
		.createServer(
			async function(
				request,
				response
			){
				let
				url=
					decodeURIComponent(
						request
						.url
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
					url
				){
					case '/':
					case '/reset localstorage':
						response
						.setHeader(
							'Content-Type',
							'text/html'
						)
						
						if(
							url
							===
							'/'
						){
							respond(
								access_files
								.client()
							)
						}
						else{
							respond(
								access_files
								.reset_localstorage()
							)
						}
					break
						
					case '/print':
					case '/send request':
					case '/script':
						response
						.setHeader(
							'Content-Type',
							'application/javascript'
						)
						
						switch(
							url
						){
							case '/print':
								respond(
									access_files
									.print()
								)
							break
							
							case '/send request':
								respond(
									access_files[
										'send request'
									]()
								)
							break
							
							case '/script':
								respond(
									access_files
									.script()
								)
						}
					break
					
					default:
						respond(
							'bad request!'
						)
				}
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
				ai_session_id
			
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
							case 'log in':{
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
											'very secret password'
											:
											process
											.env
											.admin_password
										)
								){
									admin
									=
									true
									
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
								user
								=
									await
										prisma
										.users
										.findUnique({
											where:{
												name: name??''
											},
											
											select:{
												password: true,
												id: true
											}
										})
								
								if(
									request_type
									===
									'register'
								){
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
												where:{
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
													data:{
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
													
													select:{
														id:true
													}
												})
										)
										.id
									
									admin
									=
									false
									
									respond(
										'success'
									)
									return
								}
								
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
									!admin
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
												select:{
													name: true,
													email: true,
													books:{
														omit:{
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
								user
								=
									await
										prisma
										.users
										.findUnique({
											where:{
												name
											},
											
											select:{
												name: true,
												email: true,
												books:{
													omit:{
														id: true,
														user_id: true
													}
												}
											}
										})
								
								if(
									!user
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
												where:{
													name
												}
											})
											
										respond(
											'success'
										)
										return
										
									case 'update user':
										let
										password
										=
											data
											?.password
											
										if(
											password
											!==
											undefined
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
												return
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
												where:{
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
							case 'update book':{
								if(
									admin
								){
									let{
										user_name
									}
									=
									request_data
									
									user_id
									=
										(
											await
												prisma
												.users
												.findUnique({
													where:{
														name:
															request_data
															.user_name
													},
													
													select:{
														id: true
													}
												})
										)
										?.id
									
									if(
										!user_id
									){
										respond(
											'this user does not exist!'
										)
										return
									}
								}
								else{
									if(
										!user_id
									){
										respond(
											'not logged in!'
										)
										return
									}
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
												where:{
													user_id
												},
												
												orderBy:{
													genre: 'desc'
												},
												
												omit:{
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
											where:{
												user_id,
												title
											},
											
											omit:{
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
								
								switch(
									request_type
								){
									case 'get book':
									case 'delete book':
									case 'update book':
										respond(
											'this user does not have this book!'
										)
										return
										
									case 'new book':
										await
											prisma
											.books
											.create({
												data:{
													...data,
													
													title,
													
													user_id
												}
											})
										
										respond(
											'success'
										)
										return
								}
							}
							
							case 'ai':
								if(
									ai_session_id
									===
									undefined
								){
									ai_session_id
									=
										(
											await(
												ai_client
												.session
												.create()
											)
										)
										.data
										.id
								}
																
								let
								db_data
								
								if(
									admin
								){
									db_data=
										await
											prisma
											.users
											.findMany({
												select:{
													name: true,
													email: true,
													books:{
														omit:{
															id: true,
															user_id: true
														}
													}
												}
											})
								}
								else{
									db_data=
										await
											prisma
											.books
											.findMany({
												where:{
													user_id
												},
												
												omit:{
													id: true,
													user_id: true
												}
											})
								}
								
								respond(
									await
										prompt(
											ai_session_id,
											
											request_data
											.query
											+
												JSON
												.stringify(
													db_data
												)
										)
								)
							break
							
							default:
								respond(
									'bad request'
								)
						}
					}
					catch(error){
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