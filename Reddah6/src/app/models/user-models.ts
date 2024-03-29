export class UserModel {
    constructor(userName: string, password: string){
        this.UserName = userName;
        this.Password = password;
    }
    public UserName: string;
    public Password: string;
}

export class AppleUserModel {
    constructor(AuthCode,GivenName,Email,User,FamilyName,AppleToken,Locale){
        this.AuthCode = AuthCode;
        this.GivenName = GivenName;
        this.Email = Email;
        this.User = User;
        this.FamilyName = FamilyName;
        this.AppleToken = AppleToken;
        this.Locale = Locale;
    }
    public AuthCode: string;
    public GivenName: string;
    public Email: string;
    public User: string;
    public FamilyName: string;
    public AppleToken: string;
    public Locale: string;
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
    constructor(jwt: string, articleId: number, parentId: number, content: string, uid: string, atUsers: string){
        this.Jwt = jwt;
        this.ArticleId = articleId;
        this.ParentId = parentId;
        this.Content = content;
        this.Uid = uid;
        this.AtUsers = atUsers;
    }
    public Jwt: string;
    public ArticleId: number;
    public ParentId: number;
    public Content: string;
    public Uid: string;
    public AtUsers: string;
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

export class CacheResult {
    constructor(update: boolean, path: string){
        this.Update = update;
        this.Path = path;
    }
    public Update: boolean;
    public Path: string;
}

export class Queue<T> {
    _store: T[] = [];
    push(val: T) {
      this._store.push(val);
    }
    pop(): T | undefined {
      return this._store.shift();
    }
    length(){
        return this._store.length;
    }
}