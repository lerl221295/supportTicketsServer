{
    "description": {
        "type": "String"
    },
    "_id": {
        "type": "Schema.Types.ObjectId",
        "required": true
    },
    "tenant_id": {
        "type": "Schema.Types.ObjectId",
        "required": true
    },
    "name": {
        "type": "String",
        "required": true
    },
    "available_for": {
        "type": "String",
        "enum": [
            "ME",
            "AGENTS",
            "GROUPS"
        ]
    },
    "groups": [
        {
            "type": "Schema.Types.ObjectId"
        }
    ],
    "creator_id": {
        "type": "Schema.Types.ObjectId",
        "required": true
    }
}