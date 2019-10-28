export class ConnectorStore {
    private store:Array<connectorConfig>;

    constructor() {
        this.store = [];
    }

    set(obj:connectorConfig) {
        this.store.push(obj);
    }
    getAll() {
        return this.store;
    }
}

interface connectorConfig {
    message:string;
    interval:number;
    team:string;
    tenant:string;
    channel:string;
    configuredBy:string;
    webhook:string;
}