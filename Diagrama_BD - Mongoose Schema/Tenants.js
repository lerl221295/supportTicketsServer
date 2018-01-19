{
    "_id": {
        "type": "Schema.Types.ObjectId",
        "required": true
    },
    "name": {
        "type": "String",
        "required": true
    },
    "active": {
        "type": "Boolean",
        "required": true
    },
    "subdomain": {
        "type": "String",
        "required": true
    },
    "icon": {
        "type": "String"
    },
    "palette": {
        "type": "String"
    },
    "plan": {
        "key": {
            "type": "String"
        },
        "start_date": {
            "type": "Date"
        },
        "end_date": {
            "type": "Date"
        }
    }
}