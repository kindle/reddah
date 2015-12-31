CREATE TABLE [dbo].[Comment]
(
	[Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY, 
    [ParentId] INT NULL, 
    [ParentType] CHAR(10) NULL, 
    [Content] NCHAR(10) NULL, 
    [Up] INT NULL DEFAULT 0, 
    [Down] INT NULL DEFAULT 0
)
