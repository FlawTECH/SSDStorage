export class FileGroup {
    private _id: string;
    private _groupId: string;
    private _fileId: string;

    constructor(groupId: string, fileId: string) {
        this._groupId = groupId;
        this._fileId = fileId;
    }

    get id(): string {
        return this._id;
    }

    get groupId(): string {
        return this._groupId;
    }

    get fileId(): string {
        return this._fileId;
    }

    set id(value:string) {
        this._id = value;
    }

    set groupId(value:string) {
        this._groupId = value;
    }

    set fileId(value:string) {
        this._fileId = value;
    }

    public static fromJSON(rawFileGroup : any) : FileGroup {
        const tmpFileGroup = new FileGroup(rawFileGroup['groupId'], rawFileGroup['fileId']);
        tmpFileGroup.id = rawFileGroup['_id'];
        return tmpFileGroup;
    }

    public static fromArrayJSON(rawFileGroup : any[]) : FileGroup[] {
        return rawFileGroup.map(FileGroup.fromJSON);
    }

    public getCleanDataForSending() {
        return {
            "_id" : this._id,
            "groupId": this._groupId,
            "fileId": this._fileId
        };
    }
}
