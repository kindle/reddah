export class UserModel {
    constructor(userName: string, password: string){
        this.UserName = userName;
        this.Password = password;
    }
    public UserName: string;
    public Password: string;
}
