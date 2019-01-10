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

    get id(): string {
        return this._id;
    }

    get fullName(): string {
        return this._fullName;
    }

    get password(): string {
        return this._password;
    }

    get stateId(): string {
        return this._stateId;
    }

    get isAdmin(): boolean {
        return this._isAdmin;
    }

    set id(value:string) {
        this._id = value;
    }

    set fullName(value:string) {
        this._fullName = value;
    }

    set password(value:string) {
        this.password = value;
    }

    set stateId(value:string) {
        this._stateId = value;
    }

    set isAdmin(value:boolean) {
        this._isAdmin = value;
    }

    public static fromJSON(rawUser : any) : User {
        const tmpUser = new User(rawUser['fullname'], rawUser['isAdmin']);
        tmpUser.id = rawUser['id'];
        tmpUser.stateId = rawUser['stateId'];
        return tmpUser;
    }

    public static fromArrayJSON(rawUsers : any[]) : User[] {
        return rawUsers.map(User.fromJSON);
    }

    public getCleanDataForSending() {
        return {
            "id" : this._id,
            "fullname": this._fullName,
            "password": this._password,
            "stateId": this._stateId,
            "isAdmin" : this._isAdmin
        };
    }
}
