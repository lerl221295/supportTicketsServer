{
    "type": {
        "type": "String",
        "enum": [
            "REMINDER",
            "SLA_VIOLATION"
        ],
        "required": true
    },
    "_id": {
        "type": "Schema.Types.ObjectId",
        "required": true
    },
    "time": {
        "type": "Number",
        "required": true
    },
    "motive": {
        "type": "String",
        "enum": [
            "RESPONSE",
            "RESOLUTION"
        ],
        "required": true
    },
    "message": {
        "type": "String",
        "required": true
    },
    "to": [
        {
            "type": "Schema.Types.ObjectId"
        }
    ],
    "sla_policy_id": {
        "type": "Schema.Types.ObjectId",
        "required": true
    }
}