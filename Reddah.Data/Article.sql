CREATE TABLE [dbo].[Article]
(
	[Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY, 
    [Title] NVARCHAR(50) NULL, 
    [Content] NTEXT NULL, 
    [CreatedOn] DATETIME NULL , 
    [Up] INT NULL DEFAULT 0, 
    [Down] INT NULL DEFAULT 0, 
    [Count] INT NULL DEFAULT 0
)
