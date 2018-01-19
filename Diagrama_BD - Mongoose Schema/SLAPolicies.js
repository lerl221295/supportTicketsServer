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
    "position": {
        "type": "Number",
        "min": 0,
        "required": true
    },
    "by_default": {
        "type": "Boolean",
        "default": false
    },
    "active": {
        "type": "Boolean",
        "required": true
    },
    "organizations": [
        {
            "type": "Schema.Types.ObjectId"
        }
    ],
    "clients": [
        {
            "type": "Schema.Types.ObjectId"
        }
    ],
    "policies": [
        {
            "priority": {
                "type": "String",
                "enum": [
                    "LOW",
                    "MEDIUM",
                    "HIGH",
                    "URGENT"
                ],
                "required": true
            },
            "operational_hours": {
                "type": "String",
                "enum": [
                    "CALENDAR",
                    "BUSINESS"
                ],
                "required": true
            },
            "first_response": {
                "value": {
                    "type": "Number"
                },
                "unity": {
                    "type": "String",
                    "enum": [
                        "MINUTES",
                        "HOURS",
                        "DAYS",
                        "MONTHS"
                    ]
                }
            },
            "solved": {
                "value": {
                    "type": "Number"
                },
                "unity": {
                    "type": "String",
                    "enum": [
                        "MINUTES",
                        "HOURS",
                        "DAYS",
                        "MONTHS"
                    ]
                }
            }
        }
    ]
}