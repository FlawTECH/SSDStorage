export class File {
    private _id: string;
    private _name: string;
    private _path: string;
    private _type: string;
    private _createdAt: Date;

    constructor(name?:string, path?: string, type?: string, createdAt?: Date) {
        this._name = name;
        this._path = path;
        this._type = type;
        this._createdAt = createdAt;
    }

    public get id(): string {
        return this._id;
    }

    public get name(): string {
        return this._name;
    }

    public get path(): string {
        return this._path;
    }

    public get type(): string {
        return this._type;
    }

    public get createdAt(): Date {
        return this._createdAt;
    }

    public set id(value:string) {
        this._id = value;
    }

    public set name(value:string) {
        this._name = value;
    }

    public set path(value:string) {
        this._path = value;
    }

    public set type(value:string) {
        this._type = value;
    }

    public set createdAt(value:Date) {
        this._createdAt = value;
    }

    public static fromJSON(rawFile : any) : File {
        const tmpFile = new File(rawFile['name'], rawFile['path'], rawFile['type'], rawFile['createdAt']);
        tmpFile.id = rawFile['_id'];
        return tmpFile;
    }

    public static fromArrayJSON(rawFile : any[]) : File[] {
        return rawFile.map(File.fromJSON);
    }

    public getCleanDataForSending() {
        return {
            "_id" : this._id,
            "name": this._name,
            "path" : this._path,
            "type": this._type,
            "createdAt": this._createdAt
        };
    }
}
