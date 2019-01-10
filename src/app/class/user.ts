export class User {
    private _id: string;
    private _fullName: string;
    private _password: string;
    private _stateId: string;
    private _isAdmin: boolean;

    constructor(fullName?: string, isAdmin?: boolean) {
        this._fullName = fullName;
        this._isAdmin = isAdmin;
    }

    public get id(): string {
        return this._id;
    }

    public get fullName(): string {
        return this._fullName;
    }

    public get password(): string {
        return this._password;
    }

    public get stateId(): string {
        return this._stateId;
    }

    public get isAdmin(): boolean {
        return this._isAdmin;
    }

    public set id(value:string) {
        this._id = value;
    }

    public set fullName(value:string) {
        this._fullName = value;
    }

    public set password(value:string) {
        this.password = value;
    }

    public set stateId(value:string) {
        this._stateId = value;
    }

    public set isAdmin(value:boolean) {
        this._isAdmin = value;
    }

    public static fromJSON(rawUser : any) : User {
        const tmpUser = new User(rawUser['fullname'], rawUser['isAdmin']);
        tmpUser.id = rawUser['_id'];
        tmpUser.stateId = rawUser['stateId'];
        tmpUser.password = rawUser['password'];
        return tmpUser;
    }

    public static fromArrayJSON(rawUsers : any[]) : User[] {
        return rawUsers.map(User.fromJSON);
    }

    public getCleanDataForSending() {
        return {
            "_id" : this._id,
            "fullname": this._fullName,
            "password": this._password,
            "stateId": this._stateId,
            "isAdmin" : this._isAdmin
        };
    }
}
