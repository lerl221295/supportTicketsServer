{
    "_id": {
        "type": "Schema.Types.ObjectId",
        "required": true
    },
    "automation_id": {
        "type": "Schema.Types.ObjectId",
        "required": true
    },
    "field_id": {
        "type": "Schema.Types.ObjectId",
        "required": true
    },
    "new_value": {
        "type": "String"
    },
    "email": {
        "subject": {
            "type": "String"
        },
        "body": {
            "type": "String"
        },
        "receiver": {
            "id": {
                "type": "Schema.Types.ObjectId"
            },
            "type": {
                "type": "String",
                "enum": [
                    "AGENT",
                    "CLIENT"
                ]
            }
        }
    }
}