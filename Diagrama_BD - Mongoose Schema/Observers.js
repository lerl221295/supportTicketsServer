{
    "_id": {
        "type": "Schema.Types.ObjectId"
    },
    "tenant_id": {
        "type": "Schema.Types.ObjectId",
        "required": true
    },
    "name": {
        "type": "String",
        "required": true
    },
    "desciption": {
        "type": "String"
    },
    "can_execute": {
        "type": "String",
        "enum": [
            "AGENT",
            "SYSTEM"
        ]
    },
    "agentes": [
        {
            "type": "Schema.Types.ObjectId"
        }
    ]
}