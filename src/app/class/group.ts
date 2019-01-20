export class Group {

    private _id: string;
    private _name: string;
    private _status:boolean;
    private _statusGlobal:boolean;
    private _fileId:string;
    private _userId:string;

    constructor(name?: string,status?:boolean, statusGlobal?:boolean,
        fileId?:string,userId?:string) {
        this._name = name;
        this.status = status;
        this._statusGlobal = statusGlobal;
        this._fileId = fileId;
        this._userId = userId; 
        
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
    


   
	public get status(): boolean {
		return this.status;
	}

    
	public set status(value: boolean) {
		this.status = value;
	}

   
	public get statusGlobal(): boolean {
		return this.statusGlobal;
	}

    
	public set statusGlobal(value: boolean) {
		this.statusGlobal = value;
	}
    
	public get fileId(): string {
		return this.fileId;
	}

   
	public set fileId(value: string) {
		this.fileId = value;
	}

	public get userId(): string {
		return this.userId;
	}

    
	public set userId(value: string) {
		this.userId = value;
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
            "name": this._name,
            "status":this.status,
            "statusGlobal": this.statusGlobal,
            "fileId":this.fileId,
            "userId":this.userId,
            
        };
    }

}
