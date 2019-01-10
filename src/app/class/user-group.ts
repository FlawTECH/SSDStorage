export class UserGroup {

    private _id: string;
    private _groupId: string;
    private _userId: string;

    constructor(groupId?: string, userId?: string) {
        this._groupId = groupId;
        this._userId = userId;
    }

	public get id(): string {
		return this._id;
	}

	public get groupId(): string {
		return this._groupId;
	}

	public get userId(): string {
		return this._userId;
	}

	public set id(value: string) {
		this._id = value;
	}

	public set groupId(value: string) {
		this._groupId = value;
	}

	public set userId(value: string) {
		this._userId = value;
    }
    
    public static fromJSON(rawUserGroup : any) : UserGroup {
        const tmpUserGroup = new UserGroup(rawUserGroup['groupId'], rawUserGroup['userId']);
        tmpUserGroup.id = rawUserGroup['_id'];
        return tmpUserGroup;
    }

    public static fromArrayJSON(rawUserGroups : any[]) : UserGroup[] {
        return rawUserGroups.map(UserGroup.fromJSON);
    }

    public getCleanDataForSending() {
        return {
            "_id" : this._id,
            "userId": this._userId,
            "groupId": this._groupId
        };
    }

}
