export class FilePermissions {

    private _id: string;
    private _fileId: string;
    private _userId: string;
    private _read: boolean;
    private _write: boolean;
    private _deletePerm: boolean;
    private _isOwner: boolean;

    constructor(fileId?: string, userId?: string, read?: boolean, write?: boolean, deletePerm?: boolean, isOwner?: boolean) {
        this._fileId = fileId;
        this._userId = userId;
        this._read = read;
        this._write = write;
        this._deletePerm = deletePerm;
        this._isOwner = isOwner;
    }

	public get id(): string {
		return this._id;
	}

	public get fileId(): string {
		return this._fileId;
	}

	public get userId(): string {
		return this._userId;
	}

	public get read(): boolean {
		return this._read;
	}

	public get write(): boolean {
		return this._write;
	}

	public get deletePerm(): boolean {
		return this._deletePerm;
    }
    
	public get isOwner(): boolean {
		return this._isOwner;
	}

	public set id(value: string) {
		this._id = value;
	}

	public set fileId(value: string) {
		this._fileId = value;
	}

	public set userId(value: string) {
		this._userId = value;
	}

	public set read(value: boolean) {
		this._read = value;
	}

	public set write(value: boolean) {
		this._write = value;
	}

	public set deletePerm(value: boolean) {
		this._deletePerm = value;
	}

	public set isOwner(value: boolean) {
		this._isOwner = value;
    }
    
    public static fromJSON(rawFilePermissions : any) : FilePermissions {
        const tmpFilePermissions = new FilePermissions(rawFilePermissions['fileId'], rawFilePermissions['userId'], rawFilePermissions['read'], rawFilePermissions['write'], rawFilePermissions['delete'], rawFilePermissions['isOwner']);
        tmpFilePermissions.id = rawFilePermissions['_id'];
        return tmpFilePermissions;
    }

    public static fromArrayJSON(rawFilePermissions : any[]) : FilePermissions[] {
        return rawFilePermissions.map(FilePermissions.fromJSON);
    }

    public getCleanDataForSending() {
        return {
            "_id" : this._id,
            "fileId": this._fileId,
            "userId": this._userId,
            "read": this._read,
            "write": this._write,
            "delete": this._deletePerm,
            "isOwner": this._isOwner
        };
    }
    
}
