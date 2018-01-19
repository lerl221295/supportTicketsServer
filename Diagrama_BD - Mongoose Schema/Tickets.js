{
    "_id": {
        "type": "Schema.Types.ObjectId",
        "required": true
    },
    "time": {
        "type": "Date"
    },
    "tenant_id": {
        "type": "Schema.Types.ObjectId",
        "required": true
    },
    "number": {
        "type": "Number",
        "required": true
    },
    "satisfaction_level": {
        "type": "Number"
    },
    "field_values": [
        {
            "field_id": {
                "type": "Schema.Types.ObjectId",
                "required": true
            },
            "value": {
                "text": {
                    "type": "String"
                },
                "key": {
                    "type": "String"
                },
                "ent_id": {
                    "type": "String"
                },
                "date": {
                    "type": "Date"
                },
                "num": {
                    "type": "Number"
                }
            }
        }
    ],
    "interventions": [
        {
            "autor": {
                "id": {
                    "type": "Schema.Types.ObjectId"
                },
                "type": {
                    "type": "String"
                }
            },
            "time": {
                "type": "Date"
            },
            "text": {
                "type": "String"
            },
            "private": {
                "type": "Boolean"
            }
        }
    ],
    "tasks": [
        {
            "text": {
                "type": "String"
            },
            "done": {
                "type": "Boolean"
            }
        }
    ]
}