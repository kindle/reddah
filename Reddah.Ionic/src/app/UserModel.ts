export class UserModel {
    constructor(userName: string, password: string){
        this.UserName = userName;
        this.Password = password;
    }
    public UserName: string;
    public Password: string;
}

export class QueryCommentModel {
    constructor(jwt: string, articleId: number){
        this.Jwt = jwt;
        this.ArticleId = articleId;
    }
    public Jwt: string;
    public ArticleId: number;
}

export class NewCommentModel {
    constructor(jwt: string, articleId: number, parentId: number, content: string){
        this.Jwt = jwt;
        this.ArticleId = articleId;
        this.ParentId = parentId;
        this.Content = content;
    }
    public Jwt: string;
    public ArticleId: number;
    public ParentId: number;
    public Content: string;
}

export class NewTimelineModel {
    constructor(jwt: string, thoughts: string, content: string, location: string){
        this.Jwt = jwt;
        this.Thoughts = thoughts;
        this.Content = content;
        this.Location = location;
    }
    public Jwt: string;
    public Thoughts: string;
    public Content: string;
    public Location: string;
}
