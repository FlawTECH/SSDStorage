export class User {
    private _id: string;
    private _fullName: string;
    private _password: string;
    private _state: string;
    private _roles: string[];

    constructor(fullName?: string, roles?: string[]) {
        this._fullName = fullName;
        this._roles = roles;
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

    public get state(): string {
        return this._state;
    }

    public get roles(): string[] {
        return this._roles;
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

    public set state(value:string) {
        this._state = value;
    }

    public set roles(value:string[]) {
        this._roles = value;
    }

    public static fromJSON(rawUser : any) : User {
        const tmpUser = new User(rawUser['fullname'], rawUser['roles']);
        tmpUser.id = rawUser['_id'];
        tmpUser.state = rawUser['state'];
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
            "state": this._state,
            "roles" : this._roles
        };
    }
}
