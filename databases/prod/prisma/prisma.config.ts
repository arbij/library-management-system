(
	await import(
		'dotenv'
	)
)
.config({
	path:
	'../../../.env',
	
	quiet:
	true
})

export
default
	(
		await
			import(
				'prisma/config'
			)
	)
	.defineConfig({
		schema:
		'schema.prisma',
		
		migrations:{
			path:
			'migrations',
		},
		
		datasource:{
			url:
				process
				.env
				.database
				.replace(
					'file:./',
					'file:../../../'
				)
		},
	})