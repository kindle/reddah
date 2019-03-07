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

