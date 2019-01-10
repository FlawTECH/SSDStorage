export class Group {

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

    public static fromJSON(rawGroup : any) : Group {
        const tmpGroup = new Group(rawGroup['name']);
        tmpGroup.id = rawGroup['_id'];
        return tmpGroup;
    }

    public static fromArrayJSON(rawGroups : any[]) : Group[] {
        return rawGroups.map(Group.fromJSON);
    }

    public getCleanDataForSending() {
        return {
            "_id" : this._id,
            "name": this._name
        };
    }

}
