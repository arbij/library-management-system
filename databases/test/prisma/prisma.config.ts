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
			'file:../.db'
		},
	})