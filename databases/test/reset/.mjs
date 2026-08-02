new
	(
		await
			import(
				'better-sqlite3'
			)
	)
	.default
(
	'../.db'
)
.exec(`
	delete from "Books";
	delete from "Users";	
`)