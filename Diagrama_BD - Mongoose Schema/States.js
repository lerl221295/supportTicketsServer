{
    "_id": {
        "type": "Schema.Types.ObjectId",
        "required": true
    },
    "tenant_id": {
        "type": "Schema.Types.ObjectId",
        "required": true
    },
    "key": {
        "type": "String",
        "required": true
    },
    "label": {
        "type": "String",
        "required": true
    },
    "stage": {
        "type": "String",
        "enum": [
            "PREPARATION",
            "PROGRESS",
            "END"
        ]
    },
    "came_from": [
        {
            "type": "Schema.Types.ObjectId"
        }
    ],
    "roles_permissions": [
        {
            "type": "String",
            "enum": [
                "AGENT",
                "SUPERVISOR",
                "SUPPLIER"
            ]
        }
    ]
}