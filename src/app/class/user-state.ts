export class UserState {

    private _id: string;
    private _name: string;

    constructor(name?: string) {
        this._name = name;
    }

	public get id(): string {
		return this._id;
	}

	public get name(): string {
		return this._name;
	}

	public set id(value: string) {
		this._id = value;
    }
    
	public set name(value: string) {
		this._name = value;
    }
    
    public static fromJSON(rawUserState : any) : UserState {
        const tmpUserState = new UserState(rawUserState['name']);
        tmpUserState.id = rawUserState['_id'];
        return tmpUserState;
    }

    public static fromArrayJSON(rawUserState : any[]) : UserState[] {
        return rawUserState.map(UserState.fromJSON);
    }

    public getCleanDataForSending() {
        return {
            "_id" : this._id,
            "name": this._name
        };
    }
}
